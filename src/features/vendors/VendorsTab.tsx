import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { VendorKanban } from './VendorKanban';
import { VendorQuoteTable } from './VendorQuoteTable';
import { VendorChecklistView } from './VendorChecklistView';
import { VendorNegotiationModal } from './VendorNegotiationModal';
import { AddVendorModal } from './AddVendorModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { Button } from '../../components/ui/Button';
import { Vendor } from '../../types/vendor';
import { formatCategory } from '../../utils/formatters';
import { Kanban, Table, CheckSquare, Plus } from 'lucide-react';

export const VendorsTab: React.FC = () => {
  const { state, currency, updateVendor, addVendor, deleteVendor } = useWorkspace();
  const [layout, setLayout] = useState<'checklist' | 'kanban' | 'table'>('checklist');
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

  const layoutTabs = [
    { id: 'checklist', label: 'Category Checklist', icon: <CheckSquare className="w-3.5 h-3.5 stroke-[1.5]" /> },
    { id: 'kanban', label: 'Kanban Pipeline', icon: <Kanban className="w-3.5 h-3.5 stroke-[1.5]" /> },
    { id: 'table', label: 'Side-by-Side Table', icon: <Table className="w-3.5 h-3.5 stroke-[1.5]" /> },
  ];

  return (
    <div className="h-full flex flex-col min-h-0 min-w-0 overflow-hidden space-y-3">
      <span className="sr-only">Vendor CRM, Checklist & AI Negotiation Studio</span>
      <div className="shrink-0">
        <PageHeader
          title={
            <span>
              Vendors <span className="sr-only">Vendor CRM</span>
            </span>
          }
          subtitle="Checklist, pipeline tracking and AI-assisted negotiation"
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <SegmentedTabs
                tabs={layoutTabs}
                activeTab={layout}
                onChange={(id) => setLayout(id as 'checklist' | 'kanban' | 'table')}
                variant="segmented"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddVendorModalOpen(true)}
                icon={<Plus />}
              >
                Add vendor
              </Button>
            </div>
          }
        />
      </div>

      {/* Category Filter Row (Kanban & Table) */}
      {layout !== 'checklist' && (
        <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-stone-200/80 dark:border-white/[0.08]">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#111113] dark:text-[#EDEDEF] font-medium'
                : 'text-stone-500 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF]'
            }`}
          >
            All categories ({state.vendors.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#111113] dark:text-[#EDEDEF] font-medium'
                  : 'text-stone-500 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF]'
              }`}
            >
              {formatCategory(cat)}
            </button>
          ))}
        </div>
      )}

      {/* Main View Mode */}
      {layout === 'checklist' && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 scrollbar-thin">
          <VendorChecklistView
            vendors={state.vendors}
            currency={currency}
            eventType={state.event.type}
            onOpenNegotiation={(vendor) => setActiveNegotiatingVendor(vendor)}
            onAddVendor={addVendor}
          />
        </div>
      )}

      {layout === 'kanban' && (
        <VendorKanban
          vendors={filteredVendors}
          currency={currency}
          onUpdateVendor={updateVendor}
          onDeleteVendor={deleteVendor}
          onOpenNegotiation={(vendor) => setActiveNegotiatingVendor(vendor)}
        />
      )}

      {layout === 'table' && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 scrollbar-thin">
          <VendorQuoteTable
            vendors={filteredVendors}
            currency={currency}
            onUpdateVendor={updateVendor}
            onDeleteVendor={deleteVendor}
            onOpenNegotiation={(vendor) => setActiveNegotiatingVendor(vendor)}
          />
        </div>
      )}

      {/* Vendor Negotiation Drawer Modal */}
      {activeNegotiatingVendor && (
        <VendorNegotiationModal
          vendor={activeNegotiatingVendor}
          onClose={() => setActiveNegotiatingVendor(null)}
        />
      )}

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
