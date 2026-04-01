import * as process from 'node:process';
import { Body, Controller, Headers, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { YookassaWebhookPayload } from '@payments/providers/yookassa/yookassa.model';
import type { UserDto, WebHookEvent } from '@workspace/types';
import type { Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly stripeProvider: StripeProvider,
  ) {}

  @Post('remna')
  async handleRemnaEvents(
    @Headers('x-remnawave-signature') signature: string,
    @Body() payload: {
      event: WebHookEvent;
      data: UserDto;
      timestamp: string;
    },
  ) {
    this.webhookService.validateAndProcessRemna(signature, payload);
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
  async handleYookassaEvents(
    @Headers('x-forwarded-for') xForwardedFor: string,
    @Headers('x-real-ip') xRealIp: string,
    @Res() res: Response,
    @Body()
    payload: YookassaWebhookPayload,
  ) {
    res.status(200).send('OK');

    await this.webhookService.handleYookassaWebhook(payload, xForwardedFor || xRealIp || '');
  }

  @Post('payment/stripe')
  async handleStripeEvents(
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const body = req.rawBody;

    if (!body) return res.status(400).send({});
    try {
      const event = this.stripeProvider.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );

      await this.webhookService.handleStripeWebhook(event);
      res.status(200).send('OK');
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err}`);
    }
  }
}
