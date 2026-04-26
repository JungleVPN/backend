import { Surface } from '@heroui/react';
import { useParams } from 'react-router';
import { SubscriptionView } from '@/components/SubscriptionView/SubscriptionView';

export default function SubscriptionPage() {
  const { shortUuid } = useParams<{ shortUuid: string }>();

  if (!shortUuid) {
    return null;
  }

  return (
    <Surface variant='transparent'>
      <SubscriptionView shortUuid={shortUuid} />
    </Surface>
  );
}
