import 'reflect-metadata';
import { AutopaymentController } from '@payments/autopayment/autopayment.controller';
import type { AutopaymentService } from '@payments/autopayment/autopayment.service';
import type { RemnawebhookPayload } from '@workspace/types';
import { REMNAWAVE_EVENTS } from '@workspace/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const EXPIRES_IN_24H = REMNAWAVE_EVENTS.USER.EXPIRE_NOTIFY_EXPIRES_IN_24_HOURS;

describe('AutopaymentController', () => {
  let controller: AutopaymentController;
  let mockInit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInit = vi.fn().mockResolvedValue(undefined);

    const autopaymentService = {
      init: mockInit,
    } as unknown as AutopaymentService;

    controller = new AutopaymentController(autopaymentService);
  });

  const makePayload = (event: string) =>
    ({
      scope: 'user',
      event,
      data: { uuid: 'u-1', username: 'test', status: 'ACTIVE', telegramId: 42 },
      timestamp: new Date(),
      meta: null,
    }) as unknown as RemnawebhookPayload;

  it('returns { ok: true } for known events', async () => {
    const result = await controller.handleRemnaEvent(makePayload(EXPIRES_IN_24H));
    expect(result).toEqual({ ok: true });
  });

  it('delegates user.expires_in_24_hours to autopayment service (fire-and-forget)', async () => {
    const payload = makePayload(EXPIRES_IN_24H);
    await controller.handleRemnaEvent(payload);

    expect(mockInit).toHaveBeenCalledWith(payload);
  });

  it('returns { ok: true } for unknown events without calling service', async () => {
    const result = await controller.handleRemnaEvent(makePayload('user.created'));

    expect(result).toEqual({ ok: true });
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('does not throw when the async handler rejects', async () => {
    mockInit.mockRejectedValue(new Error('boom'));

    // Fire-and-forget — the controller catches the rejection internally
    const result = await controller.handleRemnaEvent(makePayload(EXPIRES_IN_24H));
    expect(result).toEqual({ ok: true });
  });
});
