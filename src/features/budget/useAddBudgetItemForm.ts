import { useState } from 'react';
import { BudgetItem, BudgetCategory } from '../../types/budget';
import { sanitizeInput } from '../../utils/security';

interface UseAddBudgetItemFormProps {
  remainingBudget: number;
  onAddBudgetItem: (item: BudgetItem) => void;
  onClose: () => void;
}

export function useAddBudgetItemForm({
  remainingBudget,
  onAddBudgetItem,
  onClose,
}: UseAddBudgetItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('decor');
  const [allocated, setAllocated] = useState<number>(Math.max(1000, Math.min(25000, remainingBudget)));
  const [vendorQuote, setVendorQuote] = useState<number>(0);
  const [actualContracted, setActualContracted] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name);
    const cleanNotes = sanitizeInput(notes);
    if (!cleanName) return;

    onAddBudgetItem({
      id: `b-user-${Date.now()}`,
      category,
      name: cleanName,
      allocated: Number(allocated),
      vendorQuote: Number(vendorQuote) || Number(allocated),
      actualContracted: Number(actualContracted) || 0,
      amountPaid: Number(amountPaid) || 0,
      isLocked,
      notes: cleanNotes || undefined,
    });

    setName('');
    setNotes('');
    setVendorQuote(0);
    setActualContracted(0);
    setAmountPaid(0);
    onClose();
  };

  return {
    name,
    setName,
    category,
    setCategory,
    allocated,
    setAllocated,
    vendorQuote,
    setVendorQuote,
    actualContracted,
    setActualContracted,
    amountPaid,
    setAmountPaid,
    isLocked,
    setIsLocked,
    notes,
    setNotes,
    handleSubmit,
  };
}

