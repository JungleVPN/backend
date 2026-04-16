import { BotModule } from '@bot/bot.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot(),
    BotModule,
    WebhookModule,
  ],
})
export class AppModule {}
