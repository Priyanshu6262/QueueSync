import React from 'react';
import { FilterStatus } from '../types/job';

interface StatusFilterProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const filterOptions: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'running', label: 'Running' },
    { key: 'completed', label: 'Completed' },
    { key: 'failed', label: 'Failed' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
        Filter:
      </span>
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => onFilterChange(option.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              currentFilter === option.key
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
