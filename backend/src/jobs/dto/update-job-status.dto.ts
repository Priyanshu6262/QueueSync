import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from '../../common/enums/job-status.enum';

export class UpdateJobStatusDto {
  @IsNotEmpty({ message: 'status is required' })
  @IsEnum(JobStatus, {
    message: 'status must be one of: pending, running, completed, failed',
  })
  status: JobStatus;
}
