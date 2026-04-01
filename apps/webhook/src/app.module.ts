import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@workspace/database/datasource';
import { WebhookModule } from './webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    WebhookModule,
  ],
})
export class AppModule {}
