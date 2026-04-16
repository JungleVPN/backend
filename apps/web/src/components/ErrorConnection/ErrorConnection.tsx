import { Button, Stack, Box } from '@mantine/core';
import { useTranslation as useI18nextTranslation } from 'react-i18next';

export function ErrorConnection() {
  const { t } = useI18nextTranslation();

  function refreshPage() {
    window.location.reload();
  }

  return (
    <Stack gap="xl" align="center">
      <Box w={200} style={{ textAlign: 'center', fontSize: '4rem' }}>
        &#x26A0;
      </Box>
      <Button onClick={refreshPage} color="cyan">
        {t('main.page.component.refresh')}
      </Button>
    </Stack>
  );
}
