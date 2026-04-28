import { Button, Chip, Separator, Tooltip } from '@heroui/react';
import type { SavedMethodDto } from '@workspace/types';
import { useTranslation } from 'react-i18next';
// @ts-expect-error
import BinIcon from '@/assets/icons/bin-icon.svg?react';
import { formatSavedMethodLabel, getPaymentMethodIcon } from '@/ui/savedMethodDisplay';

export interface SavedMethodRowProps {
  method: SavedMethodDto;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  showSeparatorAbove?: boolean;
}

export function SavedMethodRow({
  method,
  onDelete,
  isDeleting,
  showSeparatorAbove,
}: SavedMethodRowProps) {
  const { t } = useTranslation();

  return (
    <>
      {showSeparatorAbove ? <Separator className='shrink-0' variant='secondary' /> : null}
      <div className='flex min-h-[52px] items-center gap-3 px-4 py-2.5'>
        <span aria-hidden className='shrink-0 text-xl leading-none'>
          {getPaymentMethodIcon(method.paymentMethodType)}
        </span>

        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium leading-tight text-foreground'>
            {formatSavedMethodLabel(method)}
          </p>
          {method.card?.cardType ? (
            <Chip className='mt-1 w-fit' color='default' size='sm' variant='tertiary'>
              <Chip.Label>{method.card.cardType}</Chip.Label>
            </Chip>
          ) : null}
        </div>

        {onDelete ? (
          <Tooltip delay={0} closeDelay={0}>
            <Button
              aria-label={t('a11y.deletePaymentMethod')}
              className='shrink-0'
              isIconOnly
              isPending={isDeleting}
              size='sm'
              variant='tertiary'
              onPress={() => onDelete(method.id)}
            >
              <BinIcon />
            </Button>
            <Tooltip.Content placement='left' showArrow>
              <Tooltip.Arrow />
              <p className='text-sm'>{t('a11y.removeCard')}</p>
            </Tooltip.Content>
          </Tooltip>
        ) : null}
      </div>
    </>
  );
}
