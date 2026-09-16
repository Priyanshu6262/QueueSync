import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe to strictly validate incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Standardized Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure CORS for frontend access
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigin : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Job Queue Backend service is running on: http://localhost:${port}`);
}

bootstrap();
