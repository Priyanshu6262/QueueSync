import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { jobsApi } from '../services/jobsApi';
import { Job, JobStatus, CreateJobInput, JobCounts, FilterStatus } from '../types/job';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Fetch all jobs
  const fetchJobs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const data = await jobsApi.getJobs();
      setJobs(data);
    } catch (err: any) {
      if (!isSilent) {
        if (axios.isAxiosError(err)) {
          const msg = err.response?.data?.message || err.message || 'Failed to fetch jobs';
          setError(Array.isArray(msg) ? msg.join(', ') : msg);
        } else {
          setError('Failed to connect to backend service. Please ensure the server is running.');
        }
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Production Bonus Feature: Automatic Polling (every 5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchJobs(true); // Silent background fetch without triggering global spinner
    }, 5000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchJobs]);

  // Create job
  const createJob = useCallback(
    async (input: CreateJobInput): Promise<boolean> => {
      try {
        setError(null);
        setConflictMessage(null);
        const newJob = await jobsApi.createJob(input);
        setJobs((prev) => [newJob, ...prev]);
        return true;
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const msg = err.response?.data?.message || err.message || 'Failed to create job';
          setError(Array.isArray(msg) ? msg.join(', ') : msg);
        } else {
          setError('Failed to create job.');
        }
        return false;
      }
    },
    [],
  );

  // Update status with concurrency conflict handling
  const updateStatus = useCallback(
    async (id: string, newStatus: JobStatus) => {
      setActionLoadingId(id);
      setError(null);
      setConflictMessage(null);
      try {
        const updatedJob = await jobsApi.updateJobStatus(id, newStatus);
        setJobs((prev) => prev.map((j) => (j.id === id ? updatedJob : j)));
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 409) {
            // Concurrency conflict detected: another user or request changed the job
            setConflictMessage(
              'This job was updated by another user. The latest status has been loaded.',
            );
            // Immediately reload jobs to reflect the latest state
            await fetchJobs(true);
          } else {
            const msg = err.response?.data?.message || err.message || 'Failed to update job status';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
          }
        } else {
          setError('Failed to update job status.');
        }
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchJobs],
  );

  // Delete job
  const deleteJob = useCallback(
    async (id: string) => {
      setActionLoadingId(id);
      setError(null);
      setConflictMessage(null);
      try {
        await jobsApi.deleteJob(id);
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const msg = err.response?.data?.message || err.message || 'Failed to delete job';
          setError(Array.isArray(msg) ? msg.join(', ') : msg);
          // If job was already deleted elsewhere, refresh
          if (err.response?.status === 404) {
            await fetchJobs(true);
          }
        } else {
          setError('Failed to delete job.');
        }
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchJobs],
  );

  // Compute status counts dynamically
  const counts: JobCounts = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        acc.total += 1;
        if (job.status === 'pending') acc.pending += 1;
        else if (job.status === 'running') acc.running += 1;
        else if (job.status === 'completed') acc.completed += 1;
        else if (job.status === 'failed') acc.failed += 1;
        return acc;
      },
      { total: 0, pending: 0, running: 0, completed: 0, failed: 0 },
    );
  }, [jobs]);

  // Compute filtered jobs
  const filteredJobs = useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter((job) => job.status === filter);
  }, [jobs, filter]);

  return {
    jobs,
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
    clearError: () => setError(null),
    clearConflict: () => setConflictMessage(null),
  };
}
