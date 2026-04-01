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

// ── Remnawave webhook types ─────────────────────────────────────────

/**
 * Events emitted by the Remnawave panel webhook.
 * TODO: Replace with the actual enum/union from @remnawave/backend-contract
 * once the contract package exposes it.
 */
export type WebHookEvent = string;

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

// ── Payment types (shared between database entity and apps) ─────────

export type PaymentProvider = 'yookassa' | 'stripe';

export type PaymentCurrency = 'RUB' | 'EUR';

export type PaymentPeriod = 'month_1' | 'month_3' | 'month_6';

/**
 * Union of all payment statuses from both providers.
 * Yookassa: 'pending' | 'succeeded'
 * Stripe: Invoice.Status from the stripe SDK
 *
 * We keep this as a string to avoid pulling the full Stripe SDK
 * into the types package. Individual apps can narrow the type.
 */
export type PaymentStatus = 'pending' | 'succeeded' | 'paid' | 'open' | 'draft' | 'void' | 'uncollectible' | string;

export type PaymentNotificationEvent =
  | 'payment.succeeded'
  | 'payment.canceled'
  | 'payment.waiting_for_capture';
