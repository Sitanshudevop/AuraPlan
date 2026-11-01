import React, { useState, useEffect, useRef } from 'react';
import { Vendor, VendorVetQuestions } from '../../types/vendor';
import { Currency } from '../../types/event';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { generateVendorVet } from '../../services/geminiService';
import { getLocalVendorVet } from '../../services/deterministicFallback';
import { logger } from '../../utils/logger';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { VendorVettingDetails } from './VendorVettingDetails';

interface VendorNegotiationModalProps {
  vendor: Vendor | null;
  currency?: Currency;
  onClose: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const VendorNegotiationModal: React.FC<VendorNegotiationModalProps> = ({
  vendor,
  currency = 'INR',
  onClose,
}) => {
  const [data, setData] = useState<VendorVetQuestions | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    if (!vendor) {
      setData(null);
      setStatus('idle');
      setErrorMsg(null);
      setIsOfflineFallback(false);
      return;
    }

    const price = vendor.estimatedPrice || vendor.contractedPrice || 0;
    setStatus('loading');
    setErrorMsg(null);

    const execute = async () => {
      try {
        const res = await generateVendorVet(vendor.name, vendor.category, price);
        if (!active) return;
        setData(res);
        setIsOfflineFallback(false);
        setStatus('success');
      } catch (err) {
        if (!active) return;
        logger.error('Vendor vetting generation failed, attempting local fallback', err);
        try {
          const fallback = getLocalVendorVet(vendor.name, vendor.category, price);
          if (!active) return;
          setData(fallback);
          setIsOfflineFallback(true);
          setStatus('success');
        } catch (fallbackErr) {
          if (!active) return;
          logger.error('Offline fallback also failed', fallbackErr);
          setErrorMsg('Unable to synthesize commercial vetting checklist. Please check your connection and try again.');
          setStatus('error');
        }
      }
    };

    execute();

    return () => {
      active = false;
    };
  }, [vendor, retryTrigger]);

  useEffect(() => {
    if (status === 'error') {
      retryBtnRef.current?.focus();
    }
  }, [status]);

  if (!vendor) return null;

  return (
    <Modal
      isOpen={!!vendor}
      onClose={onClose}
      title={`AI Negotiation & Vetting Studio: ${vendor.name}`}
      description={`Category: ${vendor.category.toUpperCase()} • Tailored outreach scripts and hidden-cost audit checklist`}
      maxWidth="xl"
    >
      {status === 'loading' && (
        <div
          role="status"
          aria-busy="true"
          aria-live="polite"
          className="py-12 flex flex-col items-center justify-center space-y-3"
        >
          <Loader2 className="w-6 h-6 animate-spin text-stone-600 dark:text-zinc-300" />
          <p className="text-xs text-stone-500 font-mono">
            Synthesizing commercial negotiation posture & vetting checklist...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div
          role="alert"
          className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-3 my-4"
        >
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-medium text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg || 'Unable to generate negotiation strategy.'}</span>
          </div>
          <Button
            ref={retryBtnRef}
            size="sm"
            variant="secondary"
            onClick={() => setRetryTrigger((c) => c + 1)}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Try again
          </Button>
        </div>
      )}

      {status !== 'loading' && data && (
        <VendorVettingDetails
          data={data}
          vendor={vendor}
          currency={currency}
          isOfflineFallback={isOfflineFallback}
          onRetryLive={() => setRetryTrigger((c) => c + 1)}
        />
      )}
    </Modal>
  );
};
