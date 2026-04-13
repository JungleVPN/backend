import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import type { TRemnawaveWebhookEvent, YookassaWebhookPayload } from '@workspace/types';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  readonly logger = new Logger(WebhookService.name);
  constructor(private readonly webhookService: WebhookService) {}

  @Post('remnawave')
  async handleRemnaEvents(
    @Headers('x-remnawave-signature') signature: string,
    @Body() payload: TRemnawaveWebhookEvent,
  ) {
    await this.webhookService.validateAndProcessRemna(signature, payload);
    return { ok: true };
  }

  @Post('torrent')
  async handleTorrentEvents(
    @Headers('Authorization') token: string,
    @Body() payload: {
      username: string;
      ip: string;
      server: string;
      action: string;
      duration: string;
      timestamp: string;
    },
  ) {
    this.webhookService.validateAndProcessTorrent(token, payload);
    return { ok: true };
  }

  @Post('payment/yookassa')
  @HttpCode(200)
  async handleYookassaEvents(
    @Headers('x-forwarded-for') xForwardedFor: string,
    @Headers('x-real-ip') xRealIp: string,
    @Body() payload: YookassaWebhookPayload,
  ) {
    this.logger.log(`Received Yookassa webhook`);
    await this.webhookService.forwardYookassaWebhook(payload, xForwardedFor || xRealIp || '');
    return { ok: true };
  }

  @Post('payment/stripe')
  @HttpCode(200)
  async handleStripeEvents(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Record<string, unknown>>,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { received: false, error: 'Missing raw body' };
    }

    await this.webhookService.forwardStripeWebhook(rawBody, signature);
    return { received: true };
  }
}
