import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions, Referral } from '@workspace/database';
import { ReferralController } from './main/referral.controller';
import { ReferralService } from './main/referral.service';
import { RemnaClient } from './main/remna.client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Referral]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ReferralController],
  providers: [ReferralService, RemnaClient],
})
export class AppModule {}
