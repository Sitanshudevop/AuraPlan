import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { MilestoneStatus, PaymentMilestone } from '../../types/budget';

export const MilestoneTracker: React.FC = () => {
  const { state, currency } = useWorkspace();
  const [milestones, setMilestones] = useState<PaymentMilestone[]>(state.paymentMilestones);

  const toggleStatus = (id: string) => {
    const nextStatus: Record<MilestoneStatus, MilestoneStatus> = {
      pending: 'paid',
      paid: 'partial',
      partial: 'overdue',
      overdue: 'pending',
    };
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: nextStatus[m.status] } : m))
    );
  };

  const getStatusVariant = (status: MilestoneStatus) => {
    switch (status) {
      case 'paid':
        return 'emerald';
      case 'partial':
        return 'indigo';
      case 'overdue':
        return 'rose';
      case 'pending':
      default:
        return 'amber';
    }
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#FAFAFA]">
            Vendor Payment Milestone Schedule
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Escrow and tranche release timetable with due dates
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-stone-600 dark:text-zinc-400">
          {milestones.filter((m) => m.status === 'paid').length} / {milestones.length} Cleared
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
              <th className="py-2.5 px-3">Milestone Title</th>
              <th className="py-2.5 px-3">Vendor / Recipient</th>
              <th className="py-2.5 px-3 font-mono">Due Date</th>
              <th className="py-2.5 px-3 font-mono">Amount</th>
              <th className="py-2.5 px-3 text-right">Status (Click to cycle)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/60">
            {milestones.map((pm) => (
              <tr key={pm.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-900/30">
                <td className="py-3 px-3 font-medium text-stone-900 dark:text-white">
                  {pm.title}
                </td>
                <td className="py-3 px-3 text-stone-600 dark:text-zinc-400">
                  {pm.vendorName}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-stone-500 dark:text-zinc-400">
                  {pm.dueDate}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-stone-900 dark:text-white tabular-nums">
                  {formatCurrency(pm.amount, currency)}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => toggleStatus(pm.id)}
                    className="focus:outline-none"
                    title="Click to advance status"
                  >
                    <Badge variant={getStatusVariant(pm.status)} size="sm">
                      {pm.status.toUpperCase()}
                    </Badge>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
