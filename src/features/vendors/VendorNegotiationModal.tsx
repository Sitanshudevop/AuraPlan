import React, { useState, useEffect, useRef } from 'react';
import { Vendor, VendorVetQuestions } from '../../types/vendor';
import { Currency } from '../../types/event';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { generateVendorVet } from '../../services/geminiService';
import { getLocalVendorVet } from '../../services/deterministicFallback';
import { logger } from '../../utils/logger';
import { Copy, Check, MessageSquare, Mail, AlertCircle, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { VendorCounterOfferTactic } from './VendorCounterOfferTactic';

interface VendorNegotiationModalProps {
  vendor: Vendor | null;
  currency?: Currency;
  onClose: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface VendorVettingDetailsProps {
  data: VendorVetQuestions;
  vendor: Vendor;
  currency: Currency;
  isOfflineFallback: boolean;
  onRetryLive: () => void;
}

const VendorVettingDetails: React.FC<VendorVettingDetailsProps> = ({
  data,
  vendor,
  currency,
  isOfflineFallback,
  onRetryLive,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
      {isOfflineFallback && (
        <div className="px-3 py-1.5 bg-stone-100 dark:bg-zinc-800/60 rounded-md text-[11px] text-stone-600 dark:text-zinc-400 flex items-center justify-between">
          <span>Showing deterministic offline suggestions</span>
          <button
            type="button"
            onClick={onRetryLive}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Try live AI again
          </button>
        </div>
      )}

      <VendorCounterOfferTactic
        vendorName={vendor.name}
        category={vendor.category}
        quotedPrice={vendor.estimatedPrice || vendor.contractedPrice}
        currency={currency}
      />

      <div className="p-3.5 bg-stone-50 dark:bg-zinc-900/60 rounded-lg border border-stone-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-zinc-200">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ready-to-Copy WhatsApp Direct Outreach</span>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => copyToClipboard(data.whatsappOutreachScript, 'wa')}
            icon={copiedType === 'wa' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          >
            {copiedType === 'wa' ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="text-stone-600 dark:text-zinc-300 whitespace-pre-wrap font-sans bg-white dark:bg-zinc-800 p-2.5 rounded border border-stone-200 dark:border-zinc-700">
          {data.whatsappOutreachScript}
        </p>
      </div>

      <div className="p-3.5 bg-stone-50 dark:bg-zinc-900/60 rounded-lg border border-stone-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-zinc-200">
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            <span>Formal RFP & Commercial Review Email</span>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => copyToClipboard(data.emailOutreachScript, 'email')}
            icon={copiedType === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          >
            {copiedType === 'email' ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <pre className="text-stone-600 dark:text-zinc-300 whitespace-pre-wrap font-mono text-[11px] bg-white dark:bg-zinc-800 p-2.5 rounded border border-stone-200 dark:border-zinc-700">
          {data.emailOutreachScript}
        </pre>
      </div>

      <div className="p-3.5 bg-stone-50 dark:bg-zinc-900/60 rounded-lg border border-stone-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-zinc-200">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>5 Critical Vetting Questions</span>
        </div>
        <ul className="space-y-1.5">
          {data.vettingQuestions.map((q, i) => (
            <li key={i} className="flex items-start gap-2 text-stone-700 dark:text-zinc-300">
              <span className="font-mono font-bold text-stone-500">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900/40 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Category Hidden-Cost Red Flags</span>
        </div>
        <ul className="space-y-1">
          {data.hiddenCostRedFlags.map((flag, i) => (
            <li key={i} className="text-rose-700 dark:text-rose-300">
              • {flag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

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
