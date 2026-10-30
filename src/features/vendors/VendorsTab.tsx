import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { VendorKanban } from './VendorKanban';
import { VendorQuoteTable } from './VendorQuoteTable';
import { VendorChecklistView } from './VendorChecklistView';
import { VendorNegotiationModal } from './VendorNegotiationModal';
import { AddVendorModal } from './AddVendorModal';
import { Button } from '../../components/ui/Button';
import { Vendor } from '../../types/vendor';
import { Kanban, Table, CheckSquare, Plus } from 'lucide-react';

export const VendorsTab: React.FC = () => {
  const { state, currency, updateVendor, addVendor, deleteVendor } = useWorkspace();
  const [layout, setLayout] = useState<'kanban' | 'table' | 'checklist'>('checklist');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeNegotiatingVendor, setActiveNegotiatingVendor] = useState<Vendor | null>(null);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(state.vendors.map((v) => v.category))),
    [state.vendors]
  );

  const filteredVendors = useMemo(() => {
    if (categoryFilter === 'all') return state.vendors;
    const lowerFilter = categoryFilter.toLowerCase();
    return state.vendors.filter((v) => v.category.toLowerCase() === lowerFilter);
  }, [state.vendors, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#18181B] dark:text-[#FAFAFA] tracking-tight">
            Vendor CRM, Checklist & AI Negotiation Studio
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Modality-specific category checklists and pipeline tracking synced to budget
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddVendorModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Vendor
          </Button>

          {/* Tri-Layout Switcher */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700">
            <button
              onClick={() => setLayout('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                layout === 'checklist'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Category Checklist</span>
            </button>
            <button
              onClick={() => setLayout('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                layout === 'kanban'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Pipeline</span>
            </button>
            <button
              onClick={() => setLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                layout === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Side-by-Side Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Kanban & Table only) */}
      {layout !== 'checklist' && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-[#18181B] text-white dark:bg-white dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            All Categories ({state.vendors.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[#18181B] text-white dark:bg-white dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Layout Content */}
      {layout === 'checklist' ? (
        <VendorChecklistView
          vendors={state.vendors}
          currency={currency}
          eventType={state.event.type}
          onOpenNegotiation={(vendor) => setActiveNegotiatingVendor(vendor)}
          onAddVendor={addVendor}
        />
      ) : layout === 'kanban' ? (
        <VendorKanban
          vendors={filteredVendors}
          currency={currency}
          onUpdateVendor={updateVendor}
          onDeleteVendor={deleteVendor}
          onOpenNegotiation={(vendor) => setActiveNegotiatingVendor(vendor)}
        />
      ) : (
        <VendorQuoteTable
          vendors={filteredVendors}
          currency={currency}
          onUpdateVendor={updateVendor}
          onDeleteVendor={deleteVendor}
          onOpenNegotiation={(vendor) => setActiveNegotiatingVendor(vendor)}
        />
      )}

      {/* AI Negotiation Studio Modal */}
      <VendorNegotiationModal
        vendor={activeNegotiatingVendor}
        onClose={() => setActiveNegotiatingVendor(null)}
      />

      {/* Add Custom Vendor Modal */}
      <AddVendorModal
        isOpen={isAddVendorModalOpen}
        onClose={() => setIsAddVendorModalOpen(false)}
        onAddVendor={addVendor}
        currency={currency}
      />
    </div>
  );
};
