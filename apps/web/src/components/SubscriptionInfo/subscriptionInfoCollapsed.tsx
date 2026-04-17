import {
  Card,
  Collapse,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowsUpDown,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconUserScan,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { InfoBlock } from '@/components/InfoBlock/InfoBlock';
import { useTranslation } from '@/hooks/useTranslations';
import { useSubscription } from '@workspace/core/stores';
import { getColorGradientSolid } from '@/utils/colorParser';
import { formatDate, getExpirationTextUtil } from '@/utils/configParser';
import { vibrate } from '@/utils/vibrate';

export const SubscriptionInfoCollapsed = () => {
  const { t, currentLang, baseTranslations } = useTranslation();
  const subscription = useSubscription();
  const [isExpanded, setIsExpanded] = useState(false);

  const { user } = subscription;

  const getStatusConfig = () => {
    if (user.userStatus === 'ACTIVE' && user.daysLeft > 3) {
      return { color: 'teal', icon: <IconCheck size={14} /> };
    }
    if (user.userStatus === 'ACTIVE' && user.daysLeft > 0) {
      return { color: 'orange', icon: <IconAlertCircle size={14} /> };
    }
    return { color: 'red', icon: <IconX size={14} /> };
  };

  const status = getStatusConfig();
  const gradientColor = getColorGradientSolid(status.color);

  return (
    <Card
      p={'xs'}
      radius="lg"
      style={{
        overflow: 'hidden',
        zIndex: 3,
        backgroundColor: 'rgb(26, 27, 30)',
        border: '1px solid oklch(0.4676 0 0)',
        gap: '0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <UnstyledButton
        onClick={() => {
          vibrate('tap');
          setIsExpanded(!isExpanded);
        }}
        p={{ base: 'xs', sm: 'sm' }}
        style={{ width: '100%' }}
      >
        <Group gap="sm" justify="space-between" wrap="nowrap">
          <Group gap="xs" style={{ minWidth: 0, flex: 1 }} wrap="nowrap">
            <ThemeIcon
              color={status.color}
              radius="xl"
              size={28}
              style={{
                background: gradientColor.background,
                border: gradientColor.border,
                boxShadow: gradientColor.boxShadow,
                flexShrink: 0,
              }}
              variant="light"
            >
              {status.icon}
            </ThemeIcon>

            <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
              <Text
                c="white"
                fw={600}
                size="sm"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.username}
              </Text>
              <Text c="dimmed" size="xs" style={{ whiteSpace: 'nowrap' }}>
                {getExpirationTextUtil(user.expiresAt, currentLang, baseTranslations)}
              </Text>
            </Stack>
          </Group>

          <Group gap="xs" style={{ flexShrink: 0 }} wrap="nowrap">
            <IconChevronDown
              color="var(--mantine-color-dimmed)"
              size={18}
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
              }}
            />
          </Group>
        </Group>
      </UnstyledButton>

      <Collapse in={isExpanded} keepMounted>
        <Stack gap="xs" pb={{ base: 'xs', sm: 'sm' }} px={{ base: 'xs', sm: 'sm' }}>
          <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
            <InfoBlock
              color="blue"
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
              color="red"
              icon={<IconCalendar size={16} />}
              title={t(baseTranslations.expires)}
              value={formatDate(user.expiresAt, currentLang, baseTranslations)}
            />

            <InfoBlock
              color="yellow"
              icon={<IconArrowsUpDown size={16} />}
              title={t(baseTranslations.bandwidth)}
              value={`${user.trafficUsed} / ${user.trafficLimit === '0' ? '∞' : user.trafficLimit}`}
            />
          </SimpleGrid>
        </Stack>
      </Collapse>
    </Card>
  );
};
