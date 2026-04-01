import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class RemnawaveHealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'remna-service' };
  }
}
