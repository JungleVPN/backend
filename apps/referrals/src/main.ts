import * as process from 'node:process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.REFERRALS_PORT ?? 3004;
  await app.listen(port, '0.0.0.0');

  console.log(`[referrals] listening on port ${port}`);
}

bootstrap();
