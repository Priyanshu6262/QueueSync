import React, { useState } from 'react';
import { Job, JobStatus } from '../types/job';
import { Play, Check, X, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface JobRowProps {
  job: Job;
  isProcessing: boolean;
  onUpdateStatus: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
}

export const JobRow: React.FC<JobRowProps> = ({
  job,
  isProcessing,
  onUpdateStatus,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Accessible status badge styling
  const renderStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin" />
            Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        );
    }
  };

  // Format date readable
  const formattedDate = new Date(job.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
      {/* Title */}
      <td className="px-4 sm:px-6 py-4">
        <div className="font-semibold text-slate-900 text-sm">{job.title}</div>
        <div className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[200px]" title={job.id}>
          ID: {job.id}
        </div>
      </td>

      {/* Type */}
      <td className="px-4 sm:px-6 py-4">
        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
          {job.type}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 sm:px-6 py-4">
        {renderStatusBadge(job.status)}
      </td>

      {/* Created At */}
      <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
        {formattedDate}
      </td>

      {/* Actions */}
      <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
        {confirmDelete ? (
          <div className="inline-flex items-center gap-2 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
            <span className="text-xs font-medium text-rose-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Confirm delete?
            </span>
            <button
              onClick={() => {
                setConfirmDelete(false);
                onDelete(job.id);
              }}
              disabled={isProcessing}
              className="px-2 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors disabled:opacity-50"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={isProcessing}
              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5">
            {/* Pending actions */}
            {job.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdateStatus(job.id, 'running')}
                  disabled={isProcessing}
                  title="Run Job"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  Run
                </button>
                <button
                  onClick={() => onUpdateStatus(job.id, 'failed')}
                  disabled={isProcessing}
                  title="Mark as Failed"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Fail
                </button>
              </>
            )}

            {/* Running actions */}
            {job.status === 'running' && (
              <>
                <button
                  onClick={() => onUpdateStatus(job.id, 'completed')}
                  disabled={isProcessing}
                  title="Complete Job"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Complete
                </button>
                <button
                  onClick={() => onUpdateStatus(job.id, 'failed')}
                  disabled={isProcessing}
                  title="Mark as Failed"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Fail
                </button>
              </>
            )}

            {/* Delete button (available on all states) */}
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={isProcessing}
              title="Delete Job"
              className="inline-flex items-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};
