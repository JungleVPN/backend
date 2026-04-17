import * as process from 'node:process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true,
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api');

  const port = process.env.REMNAWAVE_PORT ?? 3002;
  await app.listen(port, '0.0.0.0');

  console.log(`[remnawave] listening on port ${port}`);
}

bootstrap();
