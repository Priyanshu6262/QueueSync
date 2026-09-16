import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobStatus } from '../common/enums/job-status.enum';

/**
 * Valid state machine transitions:
 * pending   -> running, failed
 * running   -> completed, failed
 * completed -> (terminal)
 * failed    -> (terminal)
 */
export const ALLOWED_SOURCE_STATES: Record<JobStatus, JobStatus[]> = {
  [JobStatus.RUNNING]: [JobStatus.PENDING],
  [JobStatus.COMPLETED]: [JobStatus.RUNNING],
  [JobStatus.FAILED]: [JobStatus.PENDING, JobStatus.RUNNING],
  [JobStatus.PENDING]: [], // Terminal/initial; cannot transition back to pending
};

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  /**
   * Create a new job with default status 'pending'.
   */
  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      title: createJobDto.title,
      type: createJobDto.type,
      status: JobStatus.PENDING,
    });
    const savedJob = await this.jobRepository.save(job);
    this.logger.log(`Created job [${savedJob.id}] with title "${savedJob.title}"`);
    return savedJob;
  }

  /**
   * Get all jobs sorted newest first.
   */
  async findAll(): Promise<Job[]> {
    return await this.jobRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a single job by ID.
   */
  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Job not found',
      });
    }
    return job;
  }

  /**
   * Concurrency-safe atomic status update using conditional database query.
   *
   * Solves race conditions:
   * UPDATE jobs
   * SET status = :targetStatus, "updatedAt" = NOW()
   * WHERE id = :id AND status IN (:...allowedSources);
   */
  async updateStatus(
    id: string,
    updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    const targetStatus = updateJobStatusDto.status;
    const allowedSources = ALLOWED_SOURCE_STATES[targetStatus];

    // If targetStatus does not allow any source state (e.g. attempting to set back to 'pending')
    if (!allowedSources || allowedSources.length === 0) {
      const existingJob = await this.jobRepository.findOne({ where: { id } });
      if (!existingJob) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Job not found',
        });
      }
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: `Job status transition to '${targetStatus}' is not allowed`,
      });
    }

    // Execute atomic conditional update query at database level
    const updateResult = await this.jobRepository
      .createQueryBuilder()
      .update(Job)
      .set({
        status: targetStatus,
        updatedAt: new Date(),
      })
      .where('id = :id AND status IN (:...allowedSources)', {
        id,
        allowedSources,
      })
      .execute();

    if (updateResult.affected === 0) {
      // Differentiate between 404 (Not Found) and 409 (Conflict/Invalid transition/Already updated)
      const existingJob = await this.jobRepository.findOne({ where: { id } });

      if (!existingJob) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Job not found',
        });
      }

      this.logger.warn(
        `Conflicting update for job [${id}]: current status is '${existingJob.status}', target was '${targetStatus}'`,
      );

      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: `Job status has already changed or transition from '${existingJob.status}' to '${targetStatus}' is not allowed`,
      });
    }

    this.logger.log(`Job [${id}] transitioned to '${targetStatus}' successfully`);
    return await this.jobRepository.findOneByOrFail({ id });
  }

  /**
   * Delete a job by ID.
   */
  async delete(id: string): Promise<{ statusCode: number; message: string; id: string }> {
    const result = await this.jobRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Job not found',
      });
    }

    this.logger.log(`Deleted job [${id}]`);
    return {
      statusCode: HttpStatus.OK,
      message: 'Job deleted successfully',
      id,
    };
  }
}
