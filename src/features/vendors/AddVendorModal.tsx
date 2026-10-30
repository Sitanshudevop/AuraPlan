import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Vendor, VendorStatus } from '../../types/vendor';
import { BudgetCategory } from '../../types/budget';
import { Currency } from '../../types/event';
import { sanitizeInput } from '../../utils/sanitizer';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVendor: (vendor: Vendor) => void;
  currency: Currency;
}

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
      notes: cleanDeliverables || 'Standard Service Agreement',
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
      title="Add Vendor Partner"
      description="Record vendor commercial terms, contact details, and contract milestones."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="vendor-name" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Company / Vendor Name
            </label>
            <input
              id="vendor-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Marwar Sound & Light Rigging"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="vendor-cat" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Category
            </label>
            <select
              id="vendor-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as BudgetCategory)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            >
              <option value="venue">Venue & Grounds</option>
              <option value="catering">Catering & Bar</option>
              <option value="decor">Decor & Florals</option>
              <option value="av_photo">Photography & AV</option>
              <option value="entertainment">Entertainment & Music</option>
              <option value="logistics">Logistics & Shuttles</option>
              <option value="buffer">Contingency Services</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="vendor-status" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Pipeline Stage
            </label>
            <select
              id="vendor-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as VendorStatus)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            >
              <option value="shortlisted">Shortlisted</option>
              <option value="contacted">Contacted</option>
              <option value="quote_received">Quote Received</option>
              <option value="contract_signed">Contract Signed</option>
              <option value="paid">Paid in Full</option>
            </select>
          </div>

          <div>
            <label htmlFor="vendor-estimate" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Estimated Quote ({currency === 'INR' ? '₹' : '$'})
            </label>
            <input
              id="vendor-estimate"
              type="number"
              min="0"
              step="1000"
              required
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="vendor-contracted" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Contracted Price ({currency === 'INR' ? '₹' : '$'})
            </label>
            <input
              id="vendor-contracted"
              type="number"
              min="0"
              step="1000"
              value={contractedPrice}
              onChange={(e) => setContractedPrice(Number(e.target.value))}
              placeholder="0 if not signed"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md font-mono dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="vendor-contact" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Contact Person
            </label>
            <input
              id="vendor-contact"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Vikramaditya Singh"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="vendor-phone" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Phone Number
            </label>
            <input
              id="vendor-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98200 88776"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="vendor-email" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
              Email Address
            </label>
            <input
              id="vendor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vikram@marwarlighting.com"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="vendor-scope" className="block text-stone-600 dark:text-zinc-400 font-semibold mb-1">
            Deliverables / Scope (comma-separated)
          </label>
          <input
            id="vendor-scope"
            type="text"
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder="e.g. 12 Moving-Head Beams, Warm 2700K Par Cans, Stage Truss Scaffolding"
            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add Vendor
          </Button>
        </div>
      </form>
    </Modal>
  );
};
