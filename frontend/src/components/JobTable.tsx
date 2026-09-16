import React from 'react';
import { Job, JobStatus } from '../types/job';
import { JobRow } from './JobRow';

interface JobTableProps {
  jobs: Job[];
  actionLoadingId: string | null;
  onUpdateStatus: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
}

export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  actionLoadingId,
  onUpdateStatus,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="px-4 sm:px-6 py-3.5">
                Title
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5">
                Type
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5">
                Created At
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                isProcessing={actionLoadingId === job.id}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
