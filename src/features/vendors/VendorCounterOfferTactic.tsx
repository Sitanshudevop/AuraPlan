import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { Currency } from '../../types/event';
import { Copy, Check, Calculator } from 'lucide-react';

interface VendorCounterOfferTacticProps {
  vendorName: string;
  category: string;
  quotedPrice: number;
  currency: Currency;
}

const CONCESSION_OPTIONS = [
  'Complimentary 2-hour setup & teardown window',
  'Flexible milestone schedule (30% deposit, 70% post-event)',
  'Included backup equipment & standby operator',
  'Zero cancellation surcharge in case of weather reschedule',
];

export const VendorCounterOfferTactic: React.FC<VendorCounterOfferTacticProps> = ({
  vendorName,
  category,
  quotedPrice,
  currency,
}) => {
  const [discountPercent, setDiscountPercent] = useState(12);
  const [selectedConcessions, setSelectedConcessions] = useState<string[]>([CONCESSION_OPTIONS[0]]);
  const [copied, setCopied] = useState(false);

  const counterOfferAmount = Math.round(quotedPrice * (1 - discountPercent / 100));

  const toggleConcession = (option: string) => {
    setSelectedConcessions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const scriptText = `Dear ${vendorName} Team,\n\nThank you for sharing your proposal for our upcoming celebration's ${category} requirements. We love your work and would appreciate partnering with you.\n\nOur client's target budget for this line item is ${formatCurrency(counterOfferAmount, currency)} (a ${discountPercent}% adjustment from the initial quote).\n\nIf we can align on this target along with:\n${selectedConcessions.map((c) => `• ${c}`).join('\n')}\n\nwe are ready to issue the commercial confirmation and deposit today.\n\nWarm regards,\nAuraPlan Planning Team`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3.5 bg-stone-50 dark:bg-[#161618] rounded-lg border border-stone-200/80 dark:border-white/[0.08] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-zinc-200 text-xs">
          <Calculator className="w-3.5 h-3.5 text-[#6E79F5]" />
          <span>Tactical Counter-Offer & Concession Builder</span>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={handleCopy}
          icon={copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        >
          {copied ? 'Copied script' : 'Copy counter-offer'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-muted text-xs mb-1 font-medium">
            Target discount: <span className="tabular-nums font-semibold text-foreground">{discountPercent}%</span> ({formatCurrency(counterOfferAmount, currency)})
          </label>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="w-full h-1.5 bg-stone-200 dark:bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#6E79F5]"
          />
        </div>

        <div>
          <span className="block text-muted text-xs mb-1 font-medium">Concession asks</span>
          <div className="space-y-1">
            {CONCESSION_OPTIONS.slice(0, 2).map((opt, i) => (
              <label key={i} className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-[#EDEDEF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConcessions.includes(opt)}
                  onChange={() => toggleConcession(opt)}
                  className="rounded border-stone-300 dark:border-white/[0.1] text-[#6E79F5] focus:ring-0"
                />
                <span className="truncate">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
