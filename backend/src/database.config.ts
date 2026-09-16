import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Job } from './jobs/entities/job.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [Job],
      synchronize: true, // For development and assessment demonstration
      autoLoadEntities: true,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgrespassword',
    database: process.env.DB_NAME || 'job_queue_db',
    entities: [Job],
    synchronize: true,
    autoLoadEntities: true,
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  };
};
