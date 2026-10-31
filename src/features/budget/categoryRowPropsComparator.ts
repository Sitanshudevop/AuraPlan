import { BudgetItem } from '../../types/budget';
import { Currency } from '../../types/event';

export interface CategoryRowProps {
  item: BudgetItem;
  totalBudget: number;
  currency: Currency;
  onUpdate: (partial: Partial<BudgetItem>) => void;
  onDelete?: () => void;
}

export const areCategoryRowPropsEqual = (prev: CategoryRowProps, next: CategoryRowProps): boolean => {
  return (
    prev.item.id === next.item.id &&
    prev.item.allocated === next.item.allocated &&
    prev.item.actualContracted === next.item.actualContracted &&
    prev.item.amountPaid === next.item.amountPaid &&
    prev.item.vendorQuote === next.item.vendorQuote &&
    prev.item.isLocked === next.item.isLocked &&
    prev.currency === next.currency &&
    prev.totalBudget === next.totalBudget
  );
};

