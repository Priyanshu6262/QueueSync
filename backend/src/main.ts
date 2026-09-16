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

  // Configure CORS - allow the configured frontend URL(s) or all origins in development
  const allowedOrigin = process.env.FRONTEND_URL;
  let corsOrigin: any = true; // allow all by default (reflects request origin)

  if (allowedOrigin && allowedOrigin !== '*') {
    // Support comma-separated list of allowed origins e.g. "https://foo.vercel.app,https://bar.vercel.app"
    const origins = allowedOrigin.split(',').map((o) => o.trim());
    corsOrigin = origins.length === 1 ? origins[0] : origins;
  }

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Job Queue Backend service is running on: http://0.0.0.0:${port}`);
}

bootstrap();
