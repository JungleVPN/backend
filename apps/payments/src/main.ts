import * as process from 'node:process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Trust the reverse-proxy / ngrok hop so that @Ip() and req.ip resolve
  // to the real client IP from X-Forwarded-For instead of the Docker
  // internal gateway address.
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  const corsOriginEnv = process.env.CORS_ORIGIN;
  if (!corsOriginEnv) {
    throw new Error('CORS_ORIGIN environment variable must be set to an explicit origin URL');
  }

  const origin = corsOriginEnv
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: process.env.NODE_ENV !== 'production' ? true : origin,
    credentials: true,
  });

  const port = process.env.PAYMENTS_PORT ?? 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`[payments] listening on port ${port}`);
}

bootstrap();
