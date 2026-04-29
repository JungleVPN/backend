import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const port = Number(process.env.BOT_PORT) || 7000;

  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on http://localhost:${port}`);

  const bot = app.get(BotService).bot;
  await bot.start();
}
bootstrap();
