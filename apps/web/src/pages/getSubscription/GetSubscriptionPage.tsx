import { Button, Chip, Description, Form, Input, Label, TextField } from '@heroui/react';
import { IconArrowRight, IconCheck, IconMail } from '@tabler/icons-react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Block } from '@/ui/Block/Block';
import { initUser } from '@/utils/remnawave.ts';
import styles from './getSubscription.module.css';

export default function GetSubscriptionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('getSubscription.error_empty_email'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('getSubscription.error_invalid_email'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await initUser({ email });

      navigate(`/subscription/${data.shortUuid}`);
    } catch {
      setError(t('getSubscription.error_failed_to_create'));
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    t('getSubscription.feature_devices'),
    t('getSubscription.feature_traffic'),
    t('getSubscription.feature_support'),
  ];

  return (
    <Form className={styles.form} onSubmit={(ev) => void handleSubmit(ev)}>
      <div className='mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2'>
        <Block>
          <div className='flex flex-col gap-2'>
            <Label className='text-base font-medium text-foreground'>
              {t('getSubscription.enter_email')}
            </Label>
            <TextField isRequired name='email' type='email'>
              <div className='relative w-full'>
                <span className={styles.inputIcon}>
                  <IconMail size={20} stroke={1.5} />
                </span>
                <Input
                  autoComplete='email'
                  className={styles.input}
                  placeholder={t('getSubscription.email_placeholder')}
                  value={email}
                  variant='secondary'
                  onChange={(v) => {
                    setEmail(v);
                    if (error) setError('');
                  }}
                />
              </div>
              <Description>{t('getSubscription.email_description')}</Description>
              {error ? <Description className='text-danger'>{error}</Description> : null}
            </TextField>
          </div>
        </Block>

        <Block>
          <div className={styles.orderSummary}>
            <p className={styles.summaryTitle}>{t('getSubscription.order_summary')}</p>

            <div className={styles.itemRow}>
              <div className={styles.itemLabel}>
                <div className='flex flex-col gap-0.5'>
                  <p className={styles.itemName}>{t('getSubscription.item_name')}</p>
                  <Chip color='accent' size='sm' variant='soft'>
                    <Chip.Label>{t('getSubscription.discount')}</Chip.Label>
                  </Chip>
                </div>
              </div>
              <div className={styles.priceColumn}>
                <p className={styles.currentPrice}>€0.00</p>
                <p className={styles.oldPrice}>€1.99</p>
              </div>
            </div>

            <div className={styles.divider} />

            <Button className={styles.submitButton} isPending={isLoading} type='submit'>
              {t('getSubscription.submit_button')}
              <IconArrowRight size={20} stroke={2} />
            </Button>

            <div className='flex flex-col gap-4'>
              <p className={styles.featuresTitle}>{t('getSubscription.features_title')}</p>
              <div className={styles.featuresList}>
                {features.map((feature) => (
                  <div key={feature} className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <IconCheck size={18} stroke={3} />
                    </div>
                    <p className='text-sm text-foreground/80'>{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Block>
      </div>
    </Form>
  );
}
