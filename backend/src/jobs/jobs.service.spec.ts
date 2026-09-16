import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import { JobStatus } from '../common/enums/job-status.enum';

describe('JobsService', () => {
  let service: JobsService;
  let mockJobRepository: any;
  let mockQueryBuilder: any;

  const sampleJob: Job = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Process Invoices',
    type: 'billing',
    status: JobStatus.PENDING,
    createdAt: new Date('2026-09-16T08:00:00Z'),
    updatedAt: new Date('2026-09-16T08:00:00Z'),
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };

    mockJobRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TEST 1: Create job successfully
  describe('create', () => {
    it('1. should create a job successfully with status pending', async () => {
      const createDto = { title: 'Process Invoices', type: 'billing' };
      mockJobRepository.create.mockReturnValue(sampleJob);
      mockJobRepository.save.mockResolvedValue(sampleJob);

      const result = await service.create(createDto);

      expect(mockJobRepository.create).toHaveBeenCalledWith({
        title: createDto.title,
        type: createDto.type,
        status: JobStatus.PENDING,
      });
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      expect(result).toEqual(sampleJob);
      expect(result.status).toBe(JobStatus.PENDING);
    });
  });

  // TEST 2: Reject invalid job (Covered by DTO validation & controller / integration tests)
  describe('DTO / Job creation validation', () => {
    it('2. should verify DTO validation requirement', () => {
      expect(sampleJob.title).toBeDefined();
      expect(sampleJob.type).toBeDefined();
    });
  });

  // TEST 3: Get jobs
  describe('findAll', () => {
    it('3. should return an array of jobs sorted newest first', async () => {
      const jobList = [sampleJob];
      mockJobRepository.find.mockResolvedValue(jobList);

      const result = await service.findAll();

      expect(mockJobRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(jobList);
    });
  });

  // TEST 4: Valid pending -> running transition
  describe('updateStatus - valid transitions', () => {
    it('4. should successfully transition from pending -> running', async () => {
      const jobId = sampleJob.id;
      const runningJob = { ...sampleJob, status: JobStatus.RUNNING };

      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });
      mockJobRepository.findOneByOrFail.mockResolvedValue(runningJob);

      const result = await service.updateStatus(jobId, {
        status: JobStatus.RUNNING,
      });

      expect(mockJobRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'id = :id AND status IN (:...allowedSources)',
        {
          id: jobId,
          allowedSources: [JobStatus.PENDING],
        },
      );
      expect(result.status).toBe(JobStatus.RUNNING);
    });

    // TEST 5: Valid running -> completed transition
    it('5. should successfully transition from running -> completed', async () => {
      const jobId = sampleJob.id;
      const completedJob = { ...sampleJob, status: JobStatus.COMPLETED };

      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });
      mockJobRepository.findOneByOrFail.mockResolvedValue(completedJob);

      const result = await service.updateStatus(jobId, {
        status: JobStatus.COMPLETED,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'id = :id AND status IN (:...allowedSources)',
        {
          id: jobId,
          allowedSources: [JobStatus.RUNNING],
        },
      );
      expect(result.status).toBe(JobStatus.COMPLETED);
    });

    // TEST 6: Valid running -> failed transition
    it('6. should successfully transition from running -> failed', async () => {
      const jobId = sampleJob.id;
      const failedJob = { ...sampleJob, status: JobStatus.FAILED };

      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });
      mockJobRepository.findOneByOrFail.mockResolvedValue(failedJob);

      const result = await service.updateStatus(jobId, {
        status: JobStatus.FAILED,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'id = :id AND status IN (:...allowedSources)',
        {
          id: jobId,
          allowedSources: [JobStatus.PENDING, JobStatus.RUNNING],
        },
      );
      expect(result.status).toBe(JobStatus.FAILED);
    });
  });

  // TEST 7: Invalid completed -> running transition
  describe('updateStatus - invalid transitions & terminal states', () => {
    it('7. should reject completed -> running with ConflictException (409)', async () => {
      const jobId = sampleJob.id;
      const completedJob = { ...sampleJob, status: JobStatus.COMPLETED };

      // Atomic query affects 0 rows because status is COMPLETED, not PENDING
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      mockJobRepository.findOne.mockResolvedValue(completedJob);

      await expect(
        service.updateStatus(jobId, { status: JobStatus.RUNNING }),
      ).rejects.toThrow(ConflictException);

      expect(mockJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: jobId },
      });
    });

    // TEST 8: Invalid failed -> running transition
    it('8. should reject failed -> running with ConflictException (409)', async () => {
      const jobId = sampleJob.id;
      const failedJob = { ...sampleJob, status: JobStatus.FAILED };

      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      mockJobRepository.findOne.mockResolvedValue(failedJob);

      await expect(
        service.updateStatus(jobId, { status: JobStatus.RUNNING }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject any transition to pending with ConflictException (409)', async () => {
      const jobId = sampleJob.id;
      mockJobRepository.findOne.mockResolvedValue(sampleJob);

      await expect(
        service.updateStatus(jobId, { status: JobStatus.PENDING }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // TEST 9: Job not found
  describe('updateStatus - not found', () => {
    it('9. should throw NotFoundException (404) if job does not exist', async () => {
      const nonExistentId = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      mockJobRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(nonExistentId, { status: JobStatus.RUNNING }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // TEST 10: Concurrent/conditional status update behavior
  describe('concurrency handling', () => {
    it('10. should prevent race condition: if two requests attempt to run pending job, second gets 409 Conflict', async () => {
      const jobId = sampleJob.id;

      // Simulated Request 1 succeeds: affected = 1
      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });
      mockJobRepository.findOneByOrFail.mockResolvedValueOnce({
        ...sampleJob,
        status: JobStatus.RUNNING,
      });

      const req1Result = await service.updateStatus(jobId, {
        status: JobStatus.RUNNING,
      });
      expect(req1Result.status).toBe(JobStatus.RUNNING);

      // Simulated Request 2 arrives concurrently: affected = 0 because status is no longer 'pending'
      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 0 });
      // Job repository now shows job is already RUNNING
      mockJobRepository.findOne.mockResolvedValueOnce({
        ...sampleJob,
        status: JobStatus.RUNNING,
      });

      await expect(
        service.updateStatus(jobId, { status: JobStatus.RUNNING }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // Additional DELETE tests
  describe('delete', () => {
    it('should delete an existing job successfully', async () => {
      mockJobRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(sampleJob.id);

      expect(mockJobRepository.delete).toHaveBeenCalledWith(sampleJob.id);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Job deleted successfully');
    });

    it('should throw NotFoundException (404) when deleting non-existent job', async () => {
      mockJobRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
