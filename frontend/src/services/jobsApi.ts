import apiClient from './api';
import { Job, CreateJobInput, JobStatus } from '../types/job';

export const jobsApi = {
  /**
   * Fetch all jobs from backend.
   */
  async getJobs(): Promise<Job[]> {
    const response = await apiClient.get<Job[]>('/jobs');
    return response.data;
  },

  /**
   * Create a new job with initial status 'pending'.
   */
  async createJob(data: CreateJobInput): Promise<Job> {
    const response = await apiClient.post<Job>('/jobs', data);
    return response.data;
  },

  /**
   * Update the status of an existing job.
   */
  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    const response = await apiClient.patch<Job>(`/jobs/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete a job by ID.
   */
  async deleteJob(id: string): Promise<{ statusCode: number; message: string; id: string }> {
    const response = await apiClient.delete<{ statusCode: number; message: string; id: string }>(
      `/jobs/${id}`,
    );
    return response.data;
  },
};
