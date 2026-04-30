import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RemnawaveHealthController } from './health/health.controller';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env.development', '../../.env'],
      expandVariables: true,
    }),
    UserModule,
    SubscriptionModule,
  ],
  controllers: [RemnawaveHealthController],
})
export class AppModule {}
