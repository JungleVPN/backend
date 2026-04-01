import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@workspace/database';
import { RemnawaveHealthController } from './health/health.controller';
import { PaymentStatusModule } from './payment-status/payment-status.module';
import { ReferralModule } from './referral/referral.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    EventEmitterModule.forRoot(),
    UserModule,
    ReferralModule,
    PaymentStatusModule,
  ],
  controllers: [RemnawaveHealthController],
})
export class AppModule {}
