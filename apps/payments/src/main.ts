import * as process from 'node:process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PAYMENTS_PORT ?? 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`[payments] listening on port ${port}`);
}

bootstrap();
