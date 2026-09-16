import React from 'react';
import { Plus, RefreshCw, Activity } from 'lucide-react';

interface DashboardHeaderProps {
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenCreateModal,
  onRefresh,
  isLoading,
  autoRefresh,
  onToggleAutoRefresh,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                QueueSync Dashboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time asynchronous job tracking & concurrency-safe worker execution
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Bonus Feature: Auto-refresh Toggle */}
            <button
              onClick={onToggleAutoRefresh}
              title="Toggle 5-second automatic polling"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              Auto-poll: {autoRefresh ? '5s ON' : 'OFF'}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh jobs now"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Create Job */}
            <button
              onClick={onOpenCreateModal}
              id="create-job-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Job
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
