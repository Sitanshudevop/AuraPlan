import { useState } from 'react';
import { Vendor, VendorStatus } from '../../types/vendor';
import { BudgetCategory } from '../../types/budget';
import { sanitizeInput } from '../../utils/security';

interface UseAddVendorFormProps {
  onAddVendor: (vendor: Vendor) => void;
  onClose: () => void;
}

export function useAddVendorForm({ onAddVendor, onClose }: UseAddVendorFormProps) {
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

  return {
    name,
    setName,
    category,
    setCategory,
    status,
    setStatus,
    estimatedPrice,
    setEstimatedPrice,
    contractedPrice,
    setContractedPrice,
    contactName,
    setContactName,
    phone,
    setPhone,
    email,
    setEmail,
    deliverables,
    setDeliverables,
    handleSubmit,
  };
}

