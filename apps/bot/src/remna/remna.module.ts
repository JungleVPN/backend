import { Module } from '@nestjs/common';
import { RemnaService } from './remna.service';

@Module({
  providers: [RemnaService],
  exports: [RemnaService],
})
export class RemnaModule {}
