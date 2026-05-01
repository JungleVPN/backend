import { AlertDialog, Button, Card, Spinner, useOverlayState } from '@heroui/react';
import {
  useCreatePaymentSession,
  useDeleteSavedMethod,
  useSavedMethods,
  useUpdateUser,
} from '@workspace/core/hooks';
import { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentsApi } from '@/api/payments';
import { remnawaveApi } from '@/api/remnawave';
import PaymentPageIcon from '@/assets/icons/payment-icon.svg?url';
import { Link } from '@/components/Link/Link';
import { ExtendCard } from '@/components/payment/ExtendCard';
import { SavedMethodRow } from '@/components/payment/SavedMethodRow';
import { env } from '@/config/env';
import { useAuthStoreActions, useAuthStoreInfo } from '@/store/auth';
import { Page } from '@/ui/Page.tsx';

// TODO: Replace with real auth-source detection once Telegram auth is wired up
const IS_TELEGRAM_USER = false;

export default function PaymentPage() {
  const { t } = useTranslation();
  const { rmnUser } = useAuthStoreInfo();
  const { setRmnUser } = useAuthStoreActions();

  const {
    data: savedMethods,
    isLoading: loadingMethods,
    execute: fetchMethods,
  } = useSavedMethods(paymentsApi);

  const { isLoading: isPaying, execute: createSession } = useCreatePaymentSession(paymentsApi);
  const { isLoading: isDeleting, execute: deleteMethod } = useDeleteSavedMethod(paymentsApi);
  const { execute: updateUser } = useUpdateUser(remnawaveApi);
  const termsState = useOverlayState();

  useEffect(() => {
    if (rmnUser?.uuid) {
      fetchMethods(rmnUser.uuid);
    }
  }, [fetchMethods, rmnUser?.uuid]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const hasActiveMethod = savedMethods?.some((m) => m.isActive) ?? false;

  /**
   * Telegram users who haven't provided an email yet need the email input.
   * Web users always have an email from Supabase auth.
   */
  const needsEmailInput = IS_TELEGRAM_USER && !rmnUser?.email;

  const handleDelete = async (id: string) => {
    if (!rmnUser?.uuid) return;
    await deleteMethod(rmnUser.uuid, id);
    await fetchMethods(rmnUser.uuid);
  };

  /**
   * Extend handler — called by ExtendCard.
   * For Telegram users without an email: saves the email first, then starts the session.
   */
  const handleExtend = async (email?: string) => {
    console.log(rmnUser);
    if (!rmnUser) return;

    // Save email for Telegram users who don't have one yet
    if (email && !rmnUser.email) {
      const updated = await updateUser({ uuid: rmnUser.uuid, email });
      if (updated) setRmnUser(updated);
    }

    const session = await createSession({
      userId: rmnUser.uuid,
      selectedPeriod: env.allowedPeriods,
      save_payment_method: true,
      amount: { value: env.allowedAmounts, currency: 'RUB' },
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
      {/* ── Scenario 3: user already has an active payment method ── */}
      {hasActiveMethod ? (
        <>
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
                ) : (
                  savedMethods?.map((method, index) => (
                    <Fragment key={method.id}>
                      <SavedMethodRow
                        isDeleting={isDeleting}
                        method={method}
                        showSeparatorAbove={index > 0}
                        onDelete={handleDelete}
                      />
                    </Fragment>
                  ))
                )}
              </Card.Content>
            </Card>
          </div>

          <div className='flex flex-col gap-1 w-full text-start mt-1 px-4'>
            <p className='text-xs text-muted '>{t('payment.autopaymentActive')}</p>
            <p className='text-xs text-muted'>
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
        </>
      ) : (
        /* ── Scenarios 1 & 2: no active method — show extend card ── */
        <ExtendCard
          isPaying={isPaying}
          showEmailInput={needsEmailInput}
          onExtend={handleExtend}
          onTermsOpen={termsState.open}
        />
      )}

      {/* ── Subscription terms dialog (shared across all scenarios) ── */}
      <AlertDialog.Backdrop
        isDismissable
        isOpen={termsState.isOpen}
        variant='blur'
        onOpenChange={termsState.setOpen}
      >
        <AlertDialog.Container size='sm'>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header className='mb-4'>
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
