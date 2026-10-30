import React from 'react';
import { StatStrip, StatItem } from '../../components/ui/StatStrip';
import { Currency } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';

interface BudgetSummaryStripProps {
  targetBudget: number;
  actualContracted: number;
  paidAmount: number;
  remainingBudget: number;
  isOverBudget: boolean;
  currency: Currency;
}

const BudgetSummaryStripComponent: React.FC<BudgetSummaryStripProps> = ({
  targetBudget,
  actualContracted,
  paidAmount,
  remainingBudget,
  isOverBudget,
  currency,
}) => {
  const committedProgress = targetBudget > 0 ? (actualContracted / targetBudget) * 100 : 0;
  const paidProgress = actualContracted > 0 ? (paidAmount / actualContracted) * 100 : 0;

  const stats: StatItem[] = [
    {
      label: 'Total target',
      value: formatCurrency(targetBudget, currency),
      helper: <span>Target allocation</span>,
    },
    {
      label: 'Contracted',
      value: formatCurrency(actualContracted, currency),
      statusTone: isOverBudget ? 'red' : undefined,
      progress: committedProgress,
      helper: (
        <span>
          {isOverBudget ? 'Exceeds target budget' : 'Committed obligations'}
        </span>
      ),
    },
    {
      label: 'Amount paid',
      value: formatCurrency(paidAmount, currency),
      progress: paidProgress,
      helper: <span>Vendor advances cleared</span>,
    },
    {
      label: 'Remaining buffer',
      value: formatCurrency(remainingBudget, currency),
      statusTone: remainingBudget <= 0 ? 'red' : 'green',
      helper: <span>{remainingBudget > 0 ? 'Available liquidity' : 'Exhausted buffer'}</span>,
    },
  ];

  return <StatStrip stats={stats} />;
};

export const BudgetSummaryStrip = React.memo(BudgetSummaryStripComponent);
