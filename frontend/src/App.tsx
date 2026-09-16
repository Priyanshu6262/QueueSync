import { useState } from 'react';
import { useJobs } from './hooks/useJobs';
import { DashboardHeader } from './components/DashboardHeader';
import { StatusCards } from './components/StatusCards';
import { StatusFilter } from './components/StatusFilter';
import { JobTable } from './components/JobTable';
import { CreateJobModal } from './components/CreateJobModal';
import { LoadingState } from './components/LoadingState';
import { ErrorMessage } from './components/ErrorMessage';
import { EmptyState } from './components/EmptyState';

export function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    filteredJobs,
    counts,
    loading,
    actionLoadingId,
    error,
    conflictMessage,
    filter,
    autoRefresh,
    setFilter,
    setAutoRefresh,
    fetchJobs,
    createJob,
    updateStatus,
    deleteJob,
    clearError,
    clearConflict,
  } = useJobs();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Dashboard Top Navigation */}
      <DashboardHeader
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onRefresh={() => fetchJobs(false)}
        isLoading={loading}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Status Count Summary Cards */}
        <StatusCards
          counts={counts}
          currentFilter={filter}
          onSelectFilter={setFilter}
        />

        {/* Global / Concurrency Notifications */}
        <ErrorMessage
          error={error}
          conflictMessage={conflictMessage}
          onDismissError={clearError}
          onDismissConflict={clearConflict}
          onRetry={() => fetchJobs(false)}
        />

        {/* Table Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <StatusFilter
            currentFilter={filter}
            onFilterChange={setFilter}
          />
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredJobs.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{counts.total}</span> jobs
          </div>
        </div>

        {/* Dynamic Table / Loading / Empty Content */}
        {loading && filteredJobs.length === 0 ? (
          <LoadingState />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            filter={filter}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onResetFilter={() => setFilter('all')}
          />
        ) : (
          <JobTable
            jobs={filteredJobs}
            actionLoadingId={actionLoadingId}
            onUpdateStatus={updateStatus}
            onDelete={deleteJob}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Mini Job Queue Dashboard • PostgreSQL Concurrency & State Machine Architecture
        </div>
      </footer>

      {/* Create Job Modal Dialog */}
      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createJob}
      />
    </div>
  );
}

export default App;
