import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentNotificationModule } from '@payments/notifications/payment-notification.module';
import { StripeModule } from '@payments/providers/stripe/stripe.module';
import { YookassaModule } from '@payments/providers/yookassa/yookassa.module';
import { dataSourceOptions } from '@workspace/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    StripeModule,
    YookassaModule,
    PaymentNotificationModule,
  ],
})
export class AppModule {}
