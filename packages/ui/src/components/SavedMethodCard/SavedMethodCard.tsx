import { Badge, Group, Stack, Text } from '@mantine/core';
import type { SavedMethodDto } from '@workspace/types';

export interface SavedMethodCardProps {
  method: SavedMethodDto;
}

const METHOD_ICONS: Record<string, string> = {
  bank_card: '💳',
  yoo_money: '💛',
  sberbank: '🟢',
  tinkoff_bank: '🟡',
  sbp: '⚡',
};

function getIcon(type: string): string {
  return METHOD_ICONS[type] ?? '💰';
}

function formatCardLabel(method: SavedMethodDto): string {
  if (method.card?.last4) {
    const expiry =
      method.card.expiryMonth && method.card.expiryYear
        ? ` · ${method.card.expiryMonth}/${method.card.expiryYear.slice(-2)}`
        : '';
    return `•••• ${method.card.last4}${expiry}`;
  }
  return method.title ?? method.paymentMethodType;
}

/**
 * Displays a single saved payment method.
 * Shared between web and Telegram Mini App — pure Mantine, no platform deps.
 */
export const SavedMethodCard = ({ method }: SavedMethodCardProps) => {
  return (
    <Group gap='md' wrap='nowrap'>
      <Text size='xl' style={{ lineHeight: 1 }}>
        {getIcon(method.paymentMethodType)}
      </Text>

      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text size='sm' fw={500} style={{ lineHeight: 1.2 }}>
          {formatCardLabel(method)}
        </Text>

        {method.card?.cardType && (
          <Badge size='xs' variant='light' color='gray' radius='sm' w='fit-content'>
            {method.card.cardType}
          </Badge>
        )}
      </Stack>
    </Group>
  );
};
