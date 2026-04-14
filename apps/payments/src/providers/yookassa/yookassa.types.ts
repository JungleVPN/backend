/**
 * HTTP transport DTOs for YooKassa endpoints exposed by this service.
 * These describe what the bot sends us — NOT the YooKassa API surface.
 * YooKassa API types live in `@workspace/types` (Payments namespace).
 */

/** Body of `POST /payments/yookassa/create-session`. */
export interface CreateYookassaSessionDto {
  readonly userId: string;
  readonly amount: number | string;
  readonly description?: string;
  readonly metadata?: Record<string, string | number | boolean | null>;
  /** When true (and the user hasn't opted out), YooKassa saves the method for future autopayments. */
  readonly savePaymentMethod: boolean;
}

/** Response of `POST /payments/yookassa/create-session`. */
export interface YookassaSessionResponse {
  readonly id: string;
  readonly url: string;
}
