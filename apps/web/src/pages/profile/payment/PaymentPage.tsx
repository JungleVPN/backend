import { Button, Loader, Stack, Text } from '@mantine/core';
import { useCreatePaymentSession, useDeleteSavedMethod, useSavedMethods } from '@workspace/core/hooks';
import { SavedMethodCard } from '@workspace/ui';
import { useEffect } from 'react';
import { paymentsApi } from '@/api/payments';
import { env } from '@/config/env';
import { useAuthStoreInfo } from '@/store/auth';
import { Block } from '@/ui/Block/Block';

export default function PaymentPage() {
  const { authUser, rmnUser } = useAuthStoreInfo();

  const {
    data: savedMethods,
    isLoading: loadingMethods,
    execute: fetchMethods,
  } = useSavedMethods(paymentsApi);

  const { isLoading: isPaying, execute: createSession } = useCreatePaymentSession(paymentsApi);
  const { isLoading: isDeleting, execute: deleteMethod } = useDeleteSavedMethod(paymentsApi);

  useEffect(() => {
    if (rmnUser?.uuid) {
      fetchMethods(rmnUser.uuid);
    }
  }, [fetchMethods, rmnUser?.uuid]);

  const hasActiveMethod = savedMethods?.some((m) => m.isActive) ?? false;

  const handleDelete = async (id: string) => {
    if (!rmnUser?.uuid) return;
    await deleteMethod(rmnUser.uuid, id);
    await fetchMethods(rmnUser.uuid);
  };

  const handlePay = async () => {
    if (!authUser?.email || !rmnUser) return;

    const session = await createSession({
      userId: rmnUser.uuid,
      selectedPeriod: env.selectedPeriodMonths,
      save_payment_method: true,
      amount: { value: env.priceRub, currency: 'RUB' },
      description: env.paymentDescription,
      confirmation: {
        return_url: `${window.location.origin}/profile/subscription`,
        type: 'redirect',
      },
    });

    if (session?.url) {
      window.location.href = session.url;
    }
  };

  return (
    <Stack gap='md'>
      <Block>
        <Text size='sm' fw={600} c='dimmed'>
          Saved payment methods
        </Text>

        {loadingMethods ? (
          <Loader size='sm' />
        ) : savedMethods && savedMethods.length > 0 ? (
          <Stack gap='sm'>
            {savedMethods.map((method) => (
              <SavedMethodCard
                key={method.id}
                method={method}
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            ))}
          </Stack>
        ) : (
          <Text size='sm' c='dimmed'>
            No saved payment methods yet. Complete a payment to save one.
          </Text>
        )}
      </Block>

      {hasActiveMethod ? (
        <Text size='xs' c='dimmed' ta='center'>
          Autopayment is active. To pay manually, remove your saved card first.
        </Text>
      ) : (
        <Button
          size='md'
          fullWidth
          onClick={handlePay}
          loading={isPaying}
          disabled={!authUser?.email}
        >
          Pay {env.priceRub} ₽
        </Button>
      )}
    </Stack>
  );
}
