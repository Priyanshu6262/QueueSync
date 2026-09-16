import React from 'react';
import { JobCounts, FilterStatus } from '../types/job';
import { Clock, PlayCircle, CheckCircle2, XCircle, Layers } from 'lucide-react';

interface StatusCardsProps {
  counts: JobCounts;
  currentFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  counts,
  currentFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      key: 'all' as FilterStatus,
      label: 'Total Jobs',
      count: counts.total,
      icon: Layers,
      color: 'text-slate-700',
      bg: 'bg-white',
      border: currentFilter === 'all' ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200',
      badgeBg: 'bg-slate-100 text-slate-700',
    },
    {
      key: 'pending' as FilterStatus,
      label: 'Pending',
      count: counts.pending,
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-white',
      border: currentFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200',
      badgeBg: 'bg-amber-50 text-amber-700',
    },
    {
      key: 'running' as FilterStatus,
      label: 'Running',
      count: counts.running,
      icon: PlayCircle,
      color: 'text-blue-700',
      bg: 'bg-white',
      border: currentFilter === 'running' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200',
      badgeBg: 'bg-blue-50 text-blue-700',
    },
    {
      key: 'completed' as FilterStatus,
      label: 'Completed',
      count: counts.completed,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-white',
      border: currentFilter === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      key: 'failed' as FilterStatus,
      label: 'Failed',
      count: counts.failed,
      icon: XCircle,
      color: 'text-rose-700',
      bg: 'bg-white',
      border: currentFilter === 'failed' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200',
      badgeBg: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            onClick={() => onSelectFilter(card.key)}
            className={`flex flex-col p-4 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer ${card.bg} ${card.border}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {card.count}
            </div>
          </button>
        );
      })}
    </div>
  );
};
