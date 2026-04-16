import { Box } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { SubscriptionView } from '@/components/SubscriptionView/SubscriptionView';

export default function SubscriptionPage() {
  const { shortUuid } = useParams<{ shortUuid: string }>();

  if (!shortUuid) {
    return null;
  }

  return (
    <Box mt={36}>
      <SubscriptionView shortUuid={shortUuid} />
    </Box>
  );
}
