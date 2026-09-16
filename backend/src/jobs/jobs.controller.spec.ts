import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobStatus } from '../common/enums/job-status.enum';

describe('JobsController', () => {
  let controller: JobsController;
  let service: JobsService;

  const mockJob = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Generate PDF Report',
    type: 'report',
    status: JobStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJobsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    service = module.get<JobsService>(JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on POST /jobs', async () => {
    const createDto = { title: 'Generate PDF Report', type: 'report' };
    mockJobsService.create.mockResolvedValue(mockJob);

    const result = await controller.create(createDto);
    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(mockJob);
  });

  it('should call service.findAll on GET /jobs', async () => {
    mockJobsService.findAll.mockResolvedValue([mockJob]);

    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockJob]);
  });

  it('should call service.findOne on GET /jobs/:id', async () => {
    mockJobsService.findOne.mockResolvedValue(mockJob);

    const result = await controller.findOne(mockJob.id);
    expect(service.findOne).toHaveBeenCalledWith(mockJob.id);
    expect(result).toEqual(mockJob);
  });

  it('should call service.updateStatus on PATCH /jobs/:id/status', async () => {
    const updateDto = { status: JobStatus.RUNNING };
    const updatedJob = { ...mockJob, status: JobStatus.RUNNING };
    mockJobsService.updateStatus.mockResolvedValue(updatedJob);

    const result = await controller.updateStatus(mockJob.id, updateDto);
    expect(service.updateStatus).toHaveBeenCalledWith(mockJob.id, updateDto);
    expect(result).toEqual(updatedJob);
  });

  it('should call service.delete on DELETE /jobs/:id', async () => {
    const deleteResponse = { statusCode: 200, message: 'Job deleted successfully', id: mockJob.id };
    mockJobsService.delete.mockResolvedValue(deleteResponse);

    const result = await controller.delete(mockJob.id);
    expect(service.delete).toHaveBeenCalledWith(mockJob.id);
    expect(result).toEqual(deleteResponse);
  });
});
