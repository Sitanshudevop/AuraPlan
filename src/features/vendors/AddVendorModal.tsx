import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { Vendor, VendorStatus } from '../../types/vendor';
import { BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { VendorContactFields } from './VendorContactFields';
import { useAddVendorForm } from './useAddVendorForm';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVendor: (vendor: Vendor) => void;
  currency: Currency;
}

export const VENDOR_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'venue', label: 'Venue & grounds' },
  { value: 'catering', label: 'Catering & bar' },
  { value: 'decor', label: 'Decor & florals' },
  { value: 'av_photo', label: 'Photography & AV' },
  { value: 'entertainment', label: 'Entertainment & music' },
  { value: 'logistics', label: 'Logistics & shuttles' },
  { value: 'buffer', label: 'Contingency services' },
];

export const VENDOR_STATUS_OPTIONS: SelectOption[] = [
  { value: 'shortlisted', label: 'Shortlisted', dotColor: 'bg-stone-400' },
  { value: 'contacted', label: 'Contacted', dotColor: 'bg-stone-400' },
  { value: 'quote_received', label: 'Quote received', dotColor: 'bg-amber-500' },
  { value: 'contract_signed', label: 'Contract signed', dotColor: 'bg-emerald-500' },
  { value: 'paid', label: 'Paid in full', dotColor: 'bg-emerald-500' },
];

export const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  onAddVendor,
  currency,
}) => {
  const form = useAddVendorForm({ onAddVendor, onClose });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add vendor partner"
      description="Record vendor commercials, contact details, and pipeline milestone."
      maxWidth="lg"
    >
      <form onSubmit={form.handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="vendor-name" className="block text-muted font-medium mb-1">
              Company / vendor name
            </label>
            <input
              id="vendor-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
              placeholder="e.g. Royal Marwar Sound & Light Rigging"
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Category</label>
            <Select
              value={form.category}
              onChange={(val) => form.setCategory(val as BudgetCategory)}
              options={VENDOR_CATEGORY_OPTIONS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">Pipeline stage</label>
            <Select
              value={form.status}
              onChange={(val) => form.setStatus(val as VendorStatus)}
              options={VENDOR_STATUS_OPTIONS}
            />
          </div>

          <div>
            <label htmlFor="vendor-estimate" className="block text-muted font-medium mb-1">
              Estimated quote ({currency})
            </label>
            <input
              id="vendor-estimate"
              type="number"
              min="0"
              step="1000"
              required
              value={form.estimatedPrice}
              onChange={(e) => form.setEstimatedPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="vendor-contracted" className="block text-muted font-medium mb-1">
              Contracted price ({currency})
            </label>
            <input
              id="vendor-contracted"
              type="number"
              min="0"
              step="1000"
              value={form.contractedPrice}
              onChange={(e) => form.setContractedPrice(Number(e.target.value))}
              placeholder="0 if not signed"
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <VendorContactFields
          contactName={form.contactName}
          setContactName={form.setContactName}
          phone={form.phone}
          setPhone={form.setPhone}
          email={form.email}
          setEmail={form.setEmail}
          deliverables={form.deliverables}
          setDeliverables={form.setDeliverables}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add vendor
          </Button>
        </div>
      </form>
    </Modal>
  );
};
