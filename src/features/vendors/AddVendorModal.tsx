import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { Vendor, VendorStatus } from '../../types/vendor';
import { BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { sanitizeInput } from '../../utils/security';
import { VendorContactFields } from './VendorContactFields';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVendor: (vendor: Vendor) => void;
  currency: Currency;
}

const categoryOptions: SelectOption[] = [
  { value: 'venue', label: 'Venue & grounds' },
  { value: 'catering', label: 'Catering & bar' },
  { value: 'decor', label: 'Decor & florals' },
  { value: 'av_photo', label: 'Photography & AV' },
  { value: 'entertainment', label: 'Entertainment & music' },
  { value: 'logistics', label: 'Logistics & shuttles' },
  { value: 'buffer', label: 'Contingency services' },
];

const statusOptions: SelectOption[] = [
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
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('decor');
  const [status, setStatus] = useState<VendorStatus>('shortlisted');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(50000);
  const [contractedPrice, setContractedPrice] = useState<number>(0);
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const location = 'Local City / Destination';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name);
    const cleanContact = sanitizeInput(contactName);
    const cleanPhone = sanitizeInput(phone);
    const cleanEmail = sanitizeInput(email);
    const cleanDeliverables = sanitizeInput(deliverables);
    const cleanLocation = sanitizeInput(location);
    if (!cleanName) return;

    onAddVendor({
      id: `v-user-${Date.now()}`,
      name: cleanName,
      category,
      status,
      estimatedPrice: Number(estimatedPrice),
      contractedPrice: Number(contractedPrice) || (status === 'contract_signed' ? Number(estimatedPrice) : 0),
      paidAmount: 0,
      contactName: cleanContact || 'Account Rep',
      phone: cleanPhone || '+91 98000 00000',
      email: cleanEmail || 'contact@vendor.com',
      rating: 4.8,
      ratingCount: 1,
      location: cleanLocation || 'Local Region',
      notes: cleanDeliverables || '',
      deliverables: cleanDeliverables ? cleanDeliverables.split(',').map((d) => d.trim()) : ['Full Scope of Work'],
    });

    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setDeliverables('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add vendor partner"
      description="Record vendor commercials, contact details, and pipeline milestone."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="vendor-name" className="block text-muted font-medium mb-1">
              Company / vendor name
            </label>
            <input
              id="vendor-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Marwar Sound & Light Rigging"
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">
              Category
            </label>
            <Select
              value={category}
              onChange={(val) => setCategory(val as BudgetCategory)}
              options={categoryOptions}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">
              Pipeline stage
            </label>
            <Select
              value={status}
              onChange={(val) => setStatus(val as VendorStatus)}
              options={statusOptions}
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
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(Number(e.target.value))}
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
              value={contractedPrice}
              onChange={(e) => setContractedPrice(Number(e.target.value))}
              placeholder="0 if not signed"
              className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <VendorContactFields
          contactName={contactName}
          setContactName={setContactName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          deliverables={deliverables}
          setDeliverables={setDeliverables}
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
