import 'reflect-metadata';
import * as process from 'node:process';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { CreateStripePaymentDto } from '@payments/providers/stripe/stripe.types';
import { StripeWebhookService } from '@payments/providers/stripe/stripe-webhook.service';
import { StripePayment } from '@workspace/database';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Stripe class
const mockSessionsCreate = vi.fn();
const mockCustomersSearch = vi.fn();
const mockSubscriptionsList = vi.fn();
const mockCustomersCreate = vi.fn();
const mockBillingPortalSessionsCreate = vi.fn();

vi.mock('@workspace/database', () => {
  return {
    StripePayment: class {},
  };
});

vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: mockSessionsCreate,
        },
      },
      customers: {
        search: mockCustomersSearch,
        create: mockCustomersCreate,
      },
      subscriptions: {
        list: mockSubscriptionsList,
      },
      billingPortal: {
        sessions: {
          create: mockBillingPortalSessionsCreate,
        },
      },
    })),
  };
});

describe('StripeProvider', () => {
  let stripeProvider: StripeProvider;
  let stripeWebhookService: StripeWebhookService;
  let paymentRepository: Repository<StripePayment>;
  let mockPaymentRepositoryFindOne: any;
  let mockPaymentRepositoryUpdate: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPaymentRepositoryFindOne = vi.fn();
    mockPaymentRepositoryUpdate = vi.fn();

    stripeWebhookService = {} as unknown as StripeWebhookService;

    paymentRepository = {
      findOne: mockPaymentRepositoryFindOne,
      update: mockPaymentRepositoryUpdate,
    } as unknown as Repository<StripePayment>;
    stripeProvider = new StripeProvider(stripeWebhookService, paymentRepository);
  });

  it('should create session for amount 2 (new customer)', async () => {
    process.env.PRICE_EUR_MONTH_1 = '2';
    process.env.STRIPE_PRICE_ID_MONTH_1 = 'price_1';
    process.env.STRIPE_SECRET_KEY = 'sk_test';

    mockPaymentRepositoryFindOne.mockResolvedValue(null);
    mockCustomersCreate.mockResolvedValue({ id: 'cus_new' });
    mockSessionsCreate.mockResolvedValue({
      id: 'sess_123',
      url: 'https://checkout.stripe.com/sess_123',
    });

    const dto: CreateStripePaymentDto = {
      userId: '123',
      payment: {
        amount: 2,
        currency: 'EUR',
      },
    };

    const result = await stripeProvider.createPayment(dto);

    expect(mockPaymentRepositoryFindOne).toHaveBeenCalled();
    expect(mockCustomersCreate).toHaveBeenCalled();
    expect(mockSessionsCreate).toHaveBeenCalled();
    expect(result.id).toBe('cus_new');
    expect(result.url).toBe('https://checkout.stripe.com/sess_123');
  });

  it('should reuse customer if exists but no active subscription', async () => {
    process.env.PRICE_EUR_MONTH_1 = '2';
    process.env.STRIPE_PRICE_ID_MONTH_1 = 'price_1';
    process.env.STRIPE_SECRET_KEY = 'sk_test';

    mockPaymentRepositoryFindOne.mockResolvedValue({ stripeCustomerId: 'cus_existing' });
    mockSubscriptionsList.mockResolvedValue({ data: [] });
    mockSessionsCreate.mockResolvedValue({
      id: 'sess_456',
      url: 'https://checkout.stripe.com/sess_456',
    });

    const dto: CreateStripePaymentDto = {
      userId: '123',
      payment: {
        amount: 2,
        currency: 'EUR',
      },
    };

    const result = await stripeProvider.createPayment(dto);

    expect(mockCustomersCreate).not.toHaveBeenCalled();
    expect(mockSessionsCreate).toHaveBeenCalled();
    expect(result.id).toBe('cus_existing');
    expect(result.url).toBe('https://checkout.stripe.com/sess_456');
  });

  it('should return portal link if active subscription exists', async () => {
    process.env.PRICE_EUR_MONTH_1 = '2';
    process.env.STRIPE_PRICE_ID_MONTH_1 = 'price_1';
    process.env.STRIPE_SECRET_KEY = 'sk_test';

    mockPaymentRepositoryFindOne.mockResolvedValue({ stripeCustomerId: 'cus_active' });
    mockSubscriptionsList.mockResolvedValue({
      data: [{ status: 'active', cancel_at_period_end: false }],
    });
    mockBillingPortalSessionsCreate.mockResolvedValue({
      id: 'portal_123',
      url: 'https://billing.stripe.com/portal_123',
      customer: 'cus_active',
    });

    const dto: CreateStripePaymentDto = {
      userId: '123',
      payment: {
        amount: 2,
        currency: 'EUR',
      },
    };

    const result = await stripeProvider.createPayment(dto);

    expect(mockSessionsCreate).not.toHaveBeenCalled();
    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_active',
      }),
    );
    expect(result.id).toBe('cus_active');
    expect(result.url).toBe('https://billing.stripe.com/portal_123');
  });
});
