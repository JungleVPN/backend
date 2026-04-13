/**
 * Re-export everything from @remnawave/backend-contract so consuming apps
 * can import from '@workspace/types' instead of depending on the contract directly.
 */

export type { TRemnawaveWebhookUserEvent as RemnawebhookPayload } from '@remnawave/backend-contract';
export * from '@remnawave/backend-contract';
// Convenience aliases for commonly used types
export { EVENTS as REMNAWAVE_EVENTS } from '@remnawave/backend-contract';
