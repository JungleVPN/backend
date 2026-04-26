import { Button, Card, Spinner } from '@heroui/react';
import {
  useCreatePaymentSession,
  useDeleteSavedMethod,
  useSavedMethods,
} from '@workspace/core/hooks';
import { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentsApi } from '@/api/payments';
import { Link } from '@/components/Link/Link';
import { SavedMethodRow } from '@/components/payment/SavedMethodRow';
import { env } from '@/config/env';
import { useAuthStoreInfo } from '@/store/auth';

export default function PaymentPage() {
  const { t } = useTranslation();
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
    console.log('Initiating payment process...');
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
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <h2 className='px-1 text-xs font-semibold tracking-[0.06em] text-muted uppercase'>
          Saved payment methods
        </h2>

        <Card className='w-full overflow-hidden p-0' variant='default'>
          <Card.Content className='flex flex-col gap-0 p-0'>
            {loadingMethods ? (
              <div className='flex min-h-[120px] items-center justify-center py-8'>
                <Spinner color='accent' size='sm' />
              </div>
            ) : savedMethods && savedMethods.length > 0 ? (
              savedMethods.map((method, index) => (
                <Fragment key={method.id}>
                  <SavedMethodRow
                    isDeleting={isDeleting}
                    method={method}
                    showSeparatorAbove={index > 0}
                    onDelete={handleDelete}
                  />
                </Fragment>
              ))
            ) : (
              <p className='px-4 py-4 text-sm text-muted'>
                No saved payment methods yet. Complete a payment to save one.
              </p>
            )}
          </Card.Content>
        </Card>
      </div>

      {hasActiveMethod ? (
        <>
          <p className='text-center text-xs text-muted'>
            Autopayment is active. To pay manually, remove your saved card first.
          </p>
          <p className='text-center text-xs text-muted'>
            {t('terms.paymentConsentLead')}
            <Link className='underline underline-offset-2' href='/terms'>
              {t('terms.paymentLinkLabel')}
            </Link>
          </p>
        </>
      ) : (
        <>
          <Button
            fullWidth
            isDisabled={!authUser?.email}
            isPending={isPaying}
            size='lg'
            onClick={handlePay}
          >
            Pay {env.priceRub} ₽
          </Button>
          <p className='text-center text-xs text-muted'>
            {t('terms.paymentConsentLead')}
            <Link className='underline underline-offset-2' href='/terms'>
              {t('terms.paymentLinkLabel')}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
