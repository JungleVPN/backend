import { Module } from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';

@Module({
  providers: [BroadcastsService],
  exports: [BroadcastsService],
})
export class BroadcastsModule {}
