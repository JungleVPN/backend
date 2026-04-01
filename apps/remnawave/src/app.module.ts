import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RemnawaveHealthController } from './health/health.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    UserModule,
  ],
  controllers: [RemnawaveHealthController],
})
export class AppModule {}
