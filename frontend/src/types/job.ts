export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateJobInput {
  title: string;
  type: string;
}

export interface JobCounts {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export type FilterStatus = 'all' | JobStatus;
