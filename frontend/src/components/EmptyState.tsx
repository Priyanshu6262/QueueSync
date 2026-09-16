import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { FilterStatus } from '../types/job';

interface EmptyStateProps {
  filter: FilterStatus;
  onOpenCreateModal: () => void;
  onResetFilter: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filter,
  onOpenCreateModal,
  onResetFilter,
}) => {
  const isFiltered = filter !== 'all';

  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">
        {isFiltered ? `No ${filter} jobs found` : 'No jobs found'}
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
        {isFiltered
          ? `There are currently no jobs with status "${filter}". Check other filters or view all jobs.`
          : 'Create your first job to get started.'}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        {isFiltered ? (
          <button
            onClick={onResetFilter}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Show All Jobs
          </button>
        ) : (
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Job
          </button>
        )}
      </div>
    </div>
  );
};
