import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const port = process.env.PORT ?? 3002;
  await app.listen(port);

  console.log(`[payments] listening on port ${port}`);
}

bootstrap();
