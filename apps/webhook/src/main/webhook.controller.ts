import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { PaymentWebhookNotification, TRemnawaveWebhookEvent } from '@workspace/types';
import type { Request } from 'express';
import { RemnaSignatureGuard } from './remna-signature.guard';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  readonly logger = new Logger(WebhookService.name);
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Remnawave webhook — called by the Remnawave panel.
   * Authenticated by RemnaSignatureGuard (HMAC-SHA256 of the JSON body),
   * so the handler receives only pre-validated payloads.
   */
  @Post('remnawave')
  @UseGuards(RemnaSignatureGuard)
  async handleRemnaEvents(@Body() payload: TRemnawaveWebhookEvent) {
    await this.webhookService.processRemnaEvent(payload);
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

  /**
   * Security is provided by the payments service's CIDR allowlist check against
   * req.socket.remoteAddress (the kernel-level TCP peer address, unforgeable).
   */
  @Post('payment/yookassa')
  @HttpCode(200)
  async handleYookassaEvents(@Req() req: Request, @Body() payload: PaymentWebhookNotification) {
    this.logger.log(`Received Yookassa webhook`);
    // Use the kernel-supplied TCP source address — never trust forged headers.
    const sourceIp = (req as any).socket?.remoteAddress ?? '';
    await this.webhookService.forwardYookassaWebhook(payload, sourceIp);
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
