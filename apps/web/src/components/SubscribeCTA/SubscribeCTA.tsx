import { Box, Button, Stack } from '@mantine/core';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { Link } from '@/components/Link/Link';
import { useAppConfigStoreInfo } from '@workspace/core/stores';

export function SubscribeCta() {
  const { t } = useI18nextTranslation();
  const { appConfig } = useAppConfigStoreInfo();

  return (
    <Stack gap="xl" align="center">
      <Box w={200} style={{ textAlign: 'center', fontSize: '4rem' }}>
        &#x1F6AB;
      </Box>
      {appConfig?.buyLink && (
        <Button component={Link} href={appConfig.buyLink} target="_blank" color="cyan">
          {t('main.page.component.buy')}
        </Button>
      )}
    </Stack>
  );
}
