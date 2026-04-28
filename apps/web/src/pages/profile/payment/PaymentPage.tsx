import { AlertDialog, Button, Card, Spinner, useOverlayState } from '@heroui/react';
import {
  useCreatePaymentSession,
  useDeleteSavedMethod,
  useSavedMethods,
} from '@workspace/core/hooks';
import { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentsApi } from '@/api/payments';
import PaymentPageIcon from '@/assets/icons/payment-icon.svg?url';
import { Link } from '@/components/Link/Link';
import { SavedMethodRow } from '@/components/payment/SavedMethodRow';
import { env } from '@/config/env';
import { useAuthStoreInfo } from '@/store/auth';
import { Page } from '@/ui/Page.tsx';

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
  const termsState = useOverlayState();

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
    <Page
      icon={PaymentPageIcon}
      title={t('payment.pageTitle')}
      subtitle={t('payment.pageSubtitle')}
    >
      <div className='flex flex-col gap-2 w-full'>
        <h2 className='px-4 text-xs font-semibold tracking-[0.06em] text-muted uppercase'>
          {t('payment.methodsHeading')}
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
              <p className='px-4 py-4 text-sm text-muted'>{t('payment.emptyMethods')}</p>
            )}
          </Card.Content>
        </Card>
      </div>

      {hasActiveMethod ? (
        <div className={'flex flex-col gap-2 w-full text-start mt-3'}>
          <p className='text-center text-xs text-muted'>{t('payment.autopaymentActive')}</p>
          <p className='text-start text-xs text-muted'>
            {t('terms.paymentConsentLead')}
            <button
              type='button'
              className='underline underline-offset-2 cursor-pointer'
              onClick={termsState.open}
            >
              {t('terms.paymentLinkLabel')}
            </button>
          </p>
        </div>
      ) : (
        <>
          <Button
            fullWidth
            isDisabled={!authUser?.email}
            isPending={isPaying}
            size='lg'
            className={'w-full mt-4'}
            onClick={handlePay}
          >
            {t('payment.payButton', { amount: env.priceRub })}
          </Button>
          <p className='text-start text-xs text-muted mt-1 pl-4'>
            {t('terms.paymentConsentLead')}
            <button
              type='button'
              className='underline underline-offset-2 cursor-pointer'
              onClick={termsState.open}
            >
              {t('terms.paymentLinkLabel')}
            </button>
          </p>
        </>
      )}
      <AlertDialog.Backdrop
        isDismissable
        isOpen={termsState.isOpen}
        variant='blur'
        onOpenChange={termsState.setOpen}
      >
        <AlertDialog.Container size='sm'>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header className={'mb-4'}>
              <AlertDialog.Heading>{t('terms.dialog.title')}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <div className='flex flex-col gap-4 text-sm'>
                <div>
                  <p className='font-semibold text-foreground mb-1'>
                    {t('terms.dialog.activationTitle')}
                  </p>
                  <p className='text-muted'>{t('terms.dialog.activationBody')}</p>
                </div>
                <div>
                  <p className='font-semibold text-foreground mb-1'>
                    {t('terms.dialog.autoRenewalTitle')}
                  </p>
                  <p className='text-muted'>{t('terms.dialog.autoRenewalLead')}</p>
                </div>
                <div>
                  <p className='font-semibold text-foreground mb-1'>
                    {t('terms.dialog.renewalCostTitle')}
                  </p>
                  <p className='text-muted'>
                    {t('terms.dialog.renewalCostLead')}
                    <Link
                      className='underline underline-offset-2'
                      href={import.meta.env.VITE_SUPPORT_URL}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {t('terms.dialog.supportLink')}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className='font-semibold text-foreground mb-1'>
                    {t('terms.dialog.agreementsTitle')}
                  </p>
                  <p className='text-muted'>
                    {t('terms.dialog.agreementsLead')}
                    <Link
                      className='underline underline-offset-2'
                      href='/terms'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {t('terms.dialog.termsOfServiceLink')}
                    </Link>
                    {/*{t('terms.dialog.agreementsMid')}*/}
                    {/*<Link*/}
                    {/*  className='underline underline-offset-2'*/}
                    {/*  href='/privacy-policy'*/}
                    {/*  target='_blank'*/}
                    {/*  rel='noopener noreferrer'*/}
                    {/*>*/}
                    {/*  {t('terms.dialog.privacyPolicyLink')}*/}
                    {/*</Link>*/}
                    {t('terms.dialog.agreementsTail')}
                  </p>
                </div>
              </div>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button fullWidth slot='close'>
                {t('terms.dialog.confirmButton')}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </Page>
  );
}
