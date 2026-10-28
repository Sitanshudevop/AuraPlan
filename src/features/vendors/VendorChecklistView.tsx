import React, { useMemo } from 'react';
import { Vendor } from '../../types/vendor';
import { EventType, Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MODALITY_CHECKLISTS, ChecklistRequirement } from '../../data/modalityChecklists';
import {
  CheckCircle2, Clock, AlertCircle, Plus, Sparkles, Building2, Utensils, Camera,
  Palette, Music, FileCheck, ShieldAlert, Gift,
} from 'lucide-react';

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'building': return <Building2 className="w-4 h-4 text-stone-500" />;
    case 'utensils': return <Utensils className="w-4 h-4 text-amber-500" />;
    case 'camera': return <Camera className="w-4 h-4 text-blue-500" />;
    case 'palette': return <Palette className="w-4 h-4 text-rose-500" />;
    case 'music': return <Music className="w-4 h-4 text-indigo-500" />;
    case 'file': return <FileCheck className="w-4 h-4 text-emerald-500" />;
    case 'shield': return <ShieldAlert className="w-4 h-4 text-red-500" />;
    default: return <Gift className="w-4 h-4 text-stone-500" />;
  }
};

interface Props {
  vendors: Vendor[];
  currency: Currency;
  eventType: EventType;
  onOpenNegotiation: (vendor: Vendor) => void;
  onAddVendor: (vendor: Vendor) => void;
}

export const VendorChecklistView: React.FC<Props> = ({
  vendors, currency, eventType, onOpenNegotiation, onAddVendor,
}) => {
  const requirements = useMemo(() => MODALITY_CHECKLISTS[eventType] || MODALITY_CHECKLISTS.wedding, [eventType]);

  const itemsWithStatus = useMemo(() => {
    return requirements.map((req) => {
      const matchingVendors = vendors.filter((v) => v.category === req.category);
      const contracted = matchingVendors.find((v) => v.status === 'contract_signed' || v.status === 'paid');
      const inProgress = matchingVendors[0];
      const status = contracted ? 'contracted' : inProgress ? 'sourced' : 'missing';
      return { req, matchedVendor: contracted || inProgress || null, status };
    });
  }, [requirements, vendors]);

  const stats = useMemo(() => {
    const contractedCount = itemsWithStatus.filter((i) => i.status === 'contracted').length;
    const sourcedCount = itemsWithStatus.filter((i) => i.status === 'sourced').length;
    const missingCount = itemsWithStatus.filter((i) => i.status === 'missing').length;
    const pct = Math.round((contractedCount / itemsWithStatus.length) * 100);
    return { contractedCount, sourcedCount, missingCount, pct };
  }, [itemsWithStatus]);

  const handleQuickSource = (req: ChecklistRequirement) => {
    onAddVendor({
      id: `v-req-${Date.now()}`,
      name: `${req.roleTitle} (Partner)`,
      category: req.category,
      status: 'shortlisted',
      estimatedPrice: req.defaultEstimate,
      contractedPrice: 0,
      paidAmount: 0,
      contactName: 'Operations Lead',
      phone: '+91 98200 12345',
      email: 'vendor@auraplan.ai',
      rating: 4.8,
      ratingCount: 16,
      location: 'Local Region',
      notes: req.description,
      deliverables: [req.description],
    });
  };

  return (
    <div className="space-y-4">
      {/* Overview Progress Banner */}
      <div className="p-4 bg-stone-50 dark:bg-zinc-900/60 rounded-xl border border-stone-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
              {eventType.toUpperCase()} Essential Vendor Checklist
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400">
              Mandatory categories tailored to {eventType} operations
            </p>
          </div>
          <Badge variant={stats.pct === 100 ? 'emerald' : stats.pct >= 50 ? 'amber' : 'rose'} size="sm">
            {stats.pct}% Covered
          </Badge>
        </div>

        <div className="w-full bg-stone-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
          <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${(stats.contractedCount / itemsWithStatus.length) * 100}%` }} />
          <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${(stats.sourcedCount / itemsWithStatus.length) * 100}%` }} />
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono tabular-nums text-stone-500 dark:text-zinc-400">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> {stats.contractedCount} Contracted</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> {stats.sourcedCount} Sourced</span>
          <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-rose-500" /> {stats.missingCount} Missing</span>
        </div>
      </div>

      {/* Checklist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {itemsWithStatus.map(({ req, matchedVendor, status }) => (
          <div
            key={req.id}
            className={`p-3.5 rounded-lg border transition-all space-y-2.5 ${
              status === 'contracted'
                ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800/60'
                : status === 'sourced'
                ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-300 dark:border-amber-800/60'
                : 'bg-white dark:bg-zinc-900/40 border-stone-200 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-stone-100 dark:bg-zinc-800 rounded-md">
                  {getCategoryIcon(req.iconName)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white leading-tight">
                    {req.roleTitle}
                  </h4>
                  <span className="text-[10px] uppercase font-semibold text-stone-400">
                    {req.category} • {req.priority}
                  </span>
                </div>
              </div>
              <Badge variant={status === 'contracted' ? 'emerald' : status === 'sourced' ? 'amber' : 'rose'} size="sm">
                {status.toUpperCase()}
              </Badge>
            </div>

            <p className="text-[11px] text-stone-600 dark:text-zinc-400 leading-relaxed">
              {req.description}
            </p>

            <div className="pt-2 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              {matchedVendor ? (
                <>
                  <div className="truncate pr-2">
                    <span className="font-semibold text-stone-900 dark:text-white truncate block">
                      {matchedVendor.name}
                    </span>
                    <span className="font-mono text-[10px] text-stone-500 tabular-nums">
                      {formatCurrency(matchedVendor.contractedPrice || matchedVendor.estimatedPrice, currency)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onOpenNegotiation(matchedVendor)}
                    icon={<Sparkles className="w-3 h-3 text-indigo-500" />}
                  >
                    Negotiate
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-mono text-[11px] text-stone-400 tabular-nums">
                    Est: {formatCurrency(req.defaultEstimate, currency)}
                  </span>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleQuickSource(req)}
                    icon={<Plus className="w-3 h-3" />}
                  >
                    Source Vendor
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

