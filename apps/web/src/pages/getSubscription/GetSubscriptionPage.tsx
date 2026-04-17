import { Badge, Button, Grid, Input, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowRight, IconCheck, IconMail } from '@tabler/icons-react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createTrialUser, remnawaveApi } from '@/api/instance';
import { Block } from '@/ui/Block/Block';
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
      const existingUser = await remnawaveApi.getUserByEmail(email);

      if (!existingUser) {
        const user = await createTrialUser(email);
        console.log(`Created user: ${user.email}`);
        navigate(`/subscription/${user.shortUuid}`);
        return;
      } else {
        console.log(`User already exists: ${existingUser[0].email}`);
        navigate(`/subscription/${existingUser[0].shortUuid}`);
        return;
      }
    } catch (err) {
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
    <form className={styles.form}>
      <Grid
        type='container'
        breakpoints={{
          xs: '325px',
          sm: '425px',
          md: '768px',
          lg: '1200px',
          xl: '1500px',
        }}
      >
        <Grid.Col span={{ base: 12, md: 7, lg: 3 }}>
          <Block>
            <Stack gap='xs'>
              <Text size='md' fw={500}>
                {t('getSubscription.enter_email')}
              </Text>
              <TextInput
                type='email'
                size='md'
                placeholder={t('getSubscription.email_placeholder')}
                error={error}
                value={email}
                required
                inputWrapperOrder={['label', 'input', 'error', 'description']}
                description={t('getSubscription.email_description')}
                rightSection={
                  email !== '' ? <Input.ClearButton onClick={() => setEmail('')} /> : undefined
                }
                rightSectionPointerEvents='auto'
                leftSection={<IconMail size={20} stroke={1.5} />}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                autoComplete='email'
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            </Stack>
          </Block>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5, lg: 3 }}>
          <Block>
            <Stack gap='xl'>
              <div className={styles.orderSummary}>
                <Text className={styles.summaryTitle}>{t('getSubscription.order_summary')}</Text>

                <div className={styles.itemRow}>
                  <div className={styles.itemLabel}>
                    <Stack gap={2}>
                      <Text className={styles.itemName}>{t('getSubscription.item_name')}</Text>
                      <Badge
                        size='sm'
                        variant='gradient'
                        gradient={{
                          from: 'oklch(0.6009 0.043 129.98)',
                          to: 'rgb(26, 27, 30)',
                          deg: 90,
                        }}
                      >
                        {t('getSubscription.discount')}
                      </Badge>
                    </Stack>
                  </div>
                  <div className={styles.priceColumn}>
                    <Text className={styles.currentPrice}>€0.00</Text>
                    <Text className={styles.oldPrice}>€1.99</Text>
                  </div>
                </div>

                <div className={styles.divider} />

                <Button size={'md'} type='submit' onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>
                      {t('getSubscription.submit_button')}
                      <IconArrowRight size={20} stroke={2} />
                    </>
                  )}
                </Button>

                <Stack gap='md'>
                  <Text className={styles.featuresTitle}>
                    {t('getSubscription.features_title')}
                  </Text>
                  <div className={styles.featuresList}>
                    {features.map((feature) => (
                      <div key={feature} className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                          <IconCheck size={18} stroke={3} />
                        </div>
                        <Text size='sm'>{feature}</Text>
                      </div>
                    ))}
                  </div>
                </Stack>
              </div>
            </Stack>
          </Block>
        </Grid.Col>
      </Grid>
    </form>
  );
}
