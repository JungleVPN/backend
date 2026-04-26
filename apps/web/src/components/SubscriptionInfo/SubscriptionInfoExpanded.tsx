import { Card, Surface } from '@heroui/react';
import {
  IconAlertCircle,
  IconArrowsUpDown,
  IconCalendar,
  IconCheck,
  IconUserScan,
  IconX,
} from '@tabler/icons-react';
import { useSubscription } from '@workspace/core/stores';
import type { ReactNode } from 'react';
import { InfoBlock } from '@/components/InfoBlock/InfoBlock';
import { useTranslation } from '@/hooks/useTranslations';
import { getColorGradientSolid } from '@/utils/colorParser';
import { formatDate, getExpirationTextUtil } from '@/utils/configParser';

export const SubscriptionInfoExpanded = () => {
  const { t, currentLang, baseTranslations } = useTranslation();
  const subscription = useSubscription();

  const { user } = subscription;

  const getStatusAndIcon = (): {
    color: string;
    icon: ReactNode;
    status: string;
  } => {
    if (user.userStatus === 'ACTIVE' && user.daysLeft > 0) {
      return {
        color: 'teal',
        icon: <IconCheck size={18} />,
        status: t(baseTranslations.active),
      };
    }
    if (
      (user.userStatus === 'ACTIVE' && user.daysLeft === 0) ||
      (user.daysLeft >= 0 && user.daysLeft <= 3)
    ) {
      return {
        color: 'orange',
        icon: <IconAlertCircle size={18} />,
        status: t(baseTranslations.active),
      };
    }
    return {
      color: 'red',
      icon: <IconX size={18} />,
      status: t(baseTranslations.inactive),
    };
  };

  const statusInfo = getStatusAndIcon();
  const gradientColor = getColorGradientSolid(statusInfo.color);

  return (
    <Card className='z-[3] overflow-hidden border border-divider' variant='default'>
      <Card.Content className='gap-3 p-2'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <Surface
              className='flex size-9 shrink-0 items-center justify-center rounded-full'
              style={{
                background: gradientColor.background,
                border: gradientColor.border,
                boxShadow: gradientColor.boxShadow,
              }}
              variant='transparent'
            >
              {statusInfo.icon}
            </Surface>

            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <Card.Title className='truncate text-base'>{user.username}</Card.Title>
              <Card.Description
                className={
                  user.daysLeft === 0 ? 'font-semibold text-danger' : 'font-semibold text-muted'
                }
              >
                {getExpirationTextUtil(user.expiresAt, currentLang, baseTranslations)}
              </Card.Description>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <InfoBlock
            color='blue'
            icon={<IconUserScan size={16} />}
            title={t(baseTranslations.name)}
            value={user.username}
          />

          <InfoBlock
            color={user.userStatus === 'ACTIVE' ? 'green' : 'red'}
            icon={user.userStatus === 'ACTIVE' ? <IconCheck size={16} /> : <IconX size={16} />}
            title={t(baseTranslations.status)}
            value={
              user.userStatus === 'ACTIVE'
                ? t(baseTranslations.active)
                : t(baseTranslations.inactive)
            }
          />

          <InfoBlock
            color='red'
            icon={<IconCalendar size={16} />}
            title={t(baseTranslations.expires)}
            value={formatDate(user.expiresAt, currentLang, baseTranslations)}
          />

          <InfoBlock
            color='yellow'
            icon={<IconArrowsUpDown size={16} />}
            title={t(baseTranslations.bandwidth)}
            value={`${user.trafficUsed} / ${user.trafficLimit === '0' ? '∞' : user.trafficLimit}`}
          />
        </div>
      </Card.Content>
    </Card>
  );
};
