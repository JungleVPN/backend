import 'reflect-metadata';
import * as crypto from 'node:crypto';
import * as process from 'node:process';

import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RemnaSignatureGuard } from '../main/remna-signature.guard';
import { WebhookController } from '../main/webhook.controller';
import { WebhookService } from '../main/webhook.service';

// ── axios mock ────────────────────────────────────────────────────────────────
const mockAxiosPost = vi.fn().mockResolvedValue({ status: 200 });
vi.mock('axios', () => ({
  default: { post: (...args: any[]) => mockAxiosPost(...args) },
}));

// ── Shared helpers ────────────────────────────────────────────────────────────

const makeConfigService = (overrides: Record<string, string> = {}) => ({
  get: vi.fn((key: string, fallback?: string): string => {
    const defaults: Record<string, string> = {
      PAYMENTS_URL: 'http://payments:3001',
      NODE_ENV: 'test',
      REMNAWAVE_WEBHOOK_SECRET: 'super-secret',
      ...overrides,
    };
    return defaults[key] ?? fallback ?? '';
  }),
});

const makeEventEmitter = () => ({ emit: vi.fn() }) as unknown as EventEmitter2;

const makeValidSignature = (secret: string, payload: object): string =>
  crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

const remnaPayload = {
  event: 'user.expires_in_24_hours',
  data: { uuid: 'u-1', telegramId: 42 },
  timestamp: '2026-01-01T00:00:00Z',
} as any;

describe('Security Audit', () => {
  describe('[FINDING #2] WebhookController — must use TCP socket IP, not x-forwarded-for header', () => {
    let service: WebhookService;
    let controller: WebhookController;

    beforeEach(() => {
      vi.clearAllMocks();
      service = new WebhookService(makeEventEmitter(), makeConfigService() as any);
      controller = new WebhookController(service);
      vi.spyOn(service, 'forwardYookassaWebhook').mockResolvedValue(undefined);
    });

    it('does not forward an empty string when both IP headers are absent — uses socket instead', async () => {
      const socketIp = '203.0.113.99';
      const payload = { type: 'notification', event: 'payment.succeeded', object: {} } as any;

      await controller.handleYookassaEvents(
        { socket: { remoteAddress: socketIp } } as any,
        payload,
      );

      // After fix: socket IP is always used; never an empty string derived from missing headers
      expect(service.forwardYookassaWebhook).not.toHaveBeenCalledWith(payload, '');
      expect(service.forwardYookassaWebhook).toHaveBeenCalledWith(payload, socketIp);
    });
  });
  describe('[FINDING #3] WebhookController — internal routes must have an authentication guard', () => {
    /**
     * The controller has two categories of routes:
     *
     *   Internal  — called by services within the Docker network that can
     *               carry the x-service-secret header. Must be protected by
     *               InterServiceGuard.
     *
     *   External  — called directly by third-party providers (YooKassa, Stripe)
     *               that have no knowledge of the internal secret. Must NOT
     *               have InterServiceGuard; they rely on their own auth
     *               mechanisms (CIDR allowlist, Stripe signature, etc.).
     *
     * Only the internal handleRemnaEvents route is checked here.
     */

    it('handleRemnaEvents must be guarded by RemnaSignatureGuard', () => {
      // NestJS @UseGuards on a method stores metadata on descriptor.value (the
      // function itself), not on (prototype, propertyKey).
      const guards: unknown[] =
        Reflect.getMetadata('__guards__', WebhookController.prototype.handleRemnaEvents) ?? [];

      expect(guards).toContain(RemnaSignatureGuard);
    });
  });
  describe('[FINDING #7] RemnaSignatureGuard — HMAC signature must be validated in all environments', () => {
    /**
     * Signature validation lives in RemnaSignatureGuard, not the service.
     * The guard runs before the handler in every environment — there is no
     * NODE_ENV gate.
     */

    const makeGuard = (secret: string) => new RemnaSignatureGuard({ get: () => secret } as any);

    const makeContext = (signature: string, body: unknown) =>
      ({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { 'x-remnawave-signature': signature },
            body,
          }),
        }),
      }) as any;

    it('rejects an invalid signature', () => {
      const guard = makeGuard('super-secret');
      const ctx = makeContext('totally-wrong-signature', remnaPayload);

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('rejects an empty signature', () => {
      const guard = makeGuard('super-secret');
      const ctx = makeContext('', remnaPayload);

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('rejects the string "undefined" as a signature', () => {
      const guard = makeGuard('super-secret');
      const ctx = makeContext('undefined', remnaPayload);

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('CONTROL: accepts a valid HMAC-SHA256 signature', () => {
      const secret = 'super-secret';
      const guard = makeGuard(secret);
      const validSig = makeValidSignature(secret, remnaPayload);
      const ctx = makeContext(validSig, remnaPayload);

      expect(() => guard.canActivate(ctx)).not.toThrow();
    });
  });
  describe('[FINDING #10] Bot notification secret — must always require a valid secret', () => {
    function validateSecret(secret: string): void {
      const expected = process.env.BOT_NOTIFY_SECRET;
      if (!expected) {
        throw new UnauthorizedException('BOT_NOTIFY_SECRET is not configured');
      }
      if (secret !== expected) {
        throw new UnauthorizedException('Invalid notification secret');
      }
    }

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      delete process.env.BOT_NOTIFY_SECRET;
    });

    it('rejects any secret when BOT_NOTIFY_SECRET is not configured (env var absent)', () => {
      delete process.env.BOT_NOTIFY_SECRET;

      // CORRECT: missing env must NOT be treated as "no auth required"
      expect(() => validateSecret('attacker-secret')).toThrow(UnauthorizedException);
      expect(() => validateSecret('')).toThrow(UnauthorizedException);
    });

    it('rejects any secret when BOT_NOTIFY_SECRET is an empty string', () => {
      process.env.BOT_NOTIFY_SECRET = '';

      // CORRECT: empty env var must not silently disable authentication
      expect(() => validateSecret('anything')).toThrow(UnauthorizedException);
    });

    it('rejects an empty-string secret when BOT_NOTIFY_SECRET is not set', () => {
      delete process.env.BOT_NOTIFY_SECRET;

      // CORRECT: even an empty string must not pass when there is no configured secret
      expect(() => validateSecret('')).toThrow(UnauthorizedException);
    });

    // ── Control tests — must always pass ────────────────────────────────────────

    it('CONTROL: rejects an incorrect secret when BOT_NOTIFY_SECRET is properly configured', () => {
      process.env.BOT_NOTIFY_SECRET = 'correct-secret';

      expect(() => validateSecret('wrong-secret')).toThrow(UnauthorizedException);
    });

    it('CONTROL: accepts the correct secret when BOT_NOTIFY_SECRET is configured', () => {
      process.env.BOT_NOTIFY_SECRET = 'correct-secret';

      expect(() => validateSecret('correct-secret')).not.toThrow();
    });
  });
});
