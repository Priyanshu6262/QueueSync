import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobDto {
  @IsNotEmpty({ message: 'title is required and should not be empty' })
  @IsString({ message: 'title must be a string' })
  @MaxLength(255, { message: 'title must not exceed 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @IsNotEmpty({ message: 'type is required and should not be empty' })
  @IsString({ message: 'type must be a string' })
  @MaxLength(100, { message: 'type must not exceed 100 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  type: string;
}
