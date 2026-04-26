import type { SavedMethodDto } from '@workspace/types';

const METHOD_ICONS: Record<string, string> = {
  bank_card: '💳',
  yoo_money: '💛',
  sberbank: '🟢',
  tinkoff_bank: '🟡',
  sbp: '⚡',
};

export function getPaymentMethodIcon(type: string): string {
  return METHOD_ICONS[type] ?? '💰';
}

export function formatSavedMethodLabel(method: SavedMethodDto): string {
  if (method.card?.last4) {
    const expiry =
      method.card.expiryMonth && method.card.expiryYear
        ? ` · ${method.card.expiryMonth}/${method.card.expiryYear.slice(-2)}`
        : '';
    return `•••• ${method.card.last4}${expiry}`;
  }
  return method.title ?? method.paymentMethodType;
}
