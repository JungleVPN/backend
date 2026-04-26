import * as process from 'node:process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const corsOriginEnv = process.env.CORS_ORIGIN;
  if (!corsOriginEnv) {
    throw new Error('CORS_ORIGIN environment variable must be set to an explicit origin URL');
  }

  const origin = corsOriginEnv
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin,
    credentials: true,
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api');

  const port = process.env.REMNAWAVE_PORT ?? 3002;
  await app.listen(port, '0.0.0.0');

  console.log(`[remnawave] listening on port ${port}`);
}

bootstrap();
