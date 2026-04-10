/**
 * Shared type definitions for the JungleVPN monorepo.
 *
 * These types are used across multiple apps and should not contain
 * business logic — only interfaces, enums, and type aliases.
 */

// Re-export domain types from @remnawave/backend-contract
// so consuming apps don't need a direct dependency on the contract package.
export {
  CreateUserCommand,
  DeleteUserCommand,
  GetUserByTelegramIdCommand,
  GetUserByUuidCommand,
  UpdateUserCommand,
} from '@remnawave/backend-contract';

/**
 * Minimal user shape returned by the Remnawave panel.
 * Used in webhook payloads. The full type comes from CreateUserCommand.Response.
 * TODO: Align with the canonical UserDto from @remnawave/backend-contract.
 */
export interface UserDto {
  uuid: string;
  username: string;
  telegramId?: number;
  status: string;
  subscriptionUrl: string;
  [key: string]: unknown;
}

/**
 * Union of all payment statuses from both providers.
 * Yookassa: 'pending' | 'succeeded'
 * Stripe: Invoice.Status from the stripe SDK
 *
 * We keep this as a string to avoid pulling the full Stripe SDK
 * into the types package. Individual apps can narrow the type.
 */
// ── Yookassa webhook types (shared between payments and webhook apps) ─

export type YookassaPaymentStatus = YookassaNotificationEvent;

export type YookassaNotificationEvent =
  | 'payment.succeeded'
  | 'payment.canceled'
  | 'payment.waiting_for_capture';

export interface YookassaPaymentPayload {
  id: string;
  status: YookassaPaymentStatus;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  authorization_details?: {
    rrn?: string;
    auth_code?: string;
    three_d_secure?: {
      applied: boolean;
    };
  };
  created_at: string;
  description?: string;
  expires_at?: string;
  metadata: Record<string, any>;
  payment_method?: {
    type: string;
    id: string;
    saved: boolean;
    card?: {
      first6?: string;
      last4?: string;
      expiry_month?: string;
      expiry_year?: string;
      card_type?: string;
      issuer_country?: string;
      issuer_name?: string;
    };
    title?: string;
  };
  refundable: boolean;
  test: boolean;
}

export interface YookassaWebhookPayload {
  type: 'notification';
  event: YookassaNotificationEvent;
  object: YookassaPaymentPayload;
}

// ── Autopayment types ──────────────────────────────────────────────────

export interface CreateAutopaymentDto {
  /** Telegram ID */
  userId: string;
  amount: number;
  selectedPeriod: number;
  description?: string;
}

export interface AutopaymentResult {
  paymentId: string;
  status: YookassaPaymentStatus;
  /** Present when status === 'canceled' */
  cancellationDetails?: {
    party: string;
    reason: string;
  };
}

export interface SavedPaymentMethodDto {
  id: string;
  userId: string;
  provider: string;
  paymentMethodId: string;
  paymentMethodType: string;
  title: string | null;
  card: {
    last4?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardType?: string;
  } | null;
  isActive: boolean;
  createdAt: string;
}
