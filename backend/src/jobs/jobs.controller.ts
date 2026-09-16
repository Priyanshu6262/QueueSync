import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { Job } from './entities/job.entity';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * POST /jobs
   * Create a new job.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return await this.jobsService.create(createJobDto);
  }

  /**
   * GET /jobs
   * Get all jobs sorted newest first.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Job[]> {
    return await this.jobsService.findAll();
  }

  /**
   * GET /jobs/:id
   * Get a single job by ID.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
  ): Promise<Job> {
    return await this.jobsService.findOne(id);
  }

  /**
   * PATCH /jobs/:id/status
   * Concurrency-safe status transition.
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    return await this.jobsService.updateStatus(id, updateJobStatusDto);
  }

  /**
   * DELETE /jobs/:id
   * Delete a job.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
  ): Promise<{ statusCode: number; message: string; id: string }> {
    return await this.jobsService.delete(id);
  }
}
