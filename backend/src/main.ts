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

  // Configure CORS - dynamically validate origin, strip trailing slashes, and allow vercel/local domains
  const rawAllowedOrigin = process.env.FRONTEND_URL;
  app.enableCors({
    origin: (requestOrigin, callback) => {
      // Allow non-browser requests (e.g. curl, server-to-server)
      if (!requestOrigin) {
        return callback(null, true);
      }

      // If no FRONTEND_URL is set or wildcard is passed, allow all origins
      if (!rawAllowedOrigin || rawAllowedOrigin === '*') {
        return callback(null, true);
      }

      // Clean trailing slashes from both allowed origin(s) and request origin
      const allowedList = rawAllowedOrigin
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, '').toLowerCase());

      const cleanRequest = requestOrigin.replace(/\/+$/, '').toLowerCase();

      // Check if exact match or wildcard match
      if (
        allowedList.includes(cleanRequest) ||
        allowedList.includes('*') ||
        cleanRequest.includes('localhost') ||
        cleanRequest.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      // Fallback: allow to prevent blocking unexpected preview URLs
      return callback(null, true);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Job Queue Backend service is running on: http://0.0.0.0:${port}`);
}

bootstrap();
