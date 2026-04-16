import { Box, Button, Flex, PinInput, Text, Title } from '@mantine/core';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Block } from '@/ui/Block/Block';

export default function ConfirmPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState<string | undefined>(undefined);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value: string) => {
    setOtp(value);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) return;

    setError(null);
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      setError(t('confirm.error_invalid_code', { defaultValue: 'The code is incorrect. Please try again.' }));
    } else {
      navigate('/profile/subscription');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    if (!email) return;

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (resendError) {
      setError(resendError.message);
    }

    setTimer(60);
  };

  return (
    <Box w={'fit-content'} m={'100px auto'}>
      <form onSubmit={handleConfirm}>
        <Block>
          <Flex direction={'column'} gap={'md'}>
            <Title order={1} ta="center">
              {t('confirm.title')}
            </Title>

            {error && (
              <Text c="red" ta="center" size="sm">
                {error}
              </Text>
            )}

            <PinInput
              size="md"
              gap={'xs'}
              length={6}
              m={'auto'}
              type="number"
              value={otp}
              onChange={handleChange}
              oneTimeCode
            />
            <Button
              size={'md'}
              type={'submit'}
              w={'100%'}
              maw={300}
              m={'auto'}
              disabled={!otp || otp.length < 6}
            >
              {t('confirm.submit')}
            </Button>
            <Button
              variant="subtle"
              size="sm"
              maw={300}
              m={'auto'}
              c={'oklch(0.6009 0.043 129.98)'}
              onClick={handleResend}
              disabled={timer > 0}
              w="100%"
            >
              {timer > 0 ? t('confirm.resend_in', { timer }) : t('confirm.resend_otp')}
            </Button>
            <Text c="dimmed" size="xs" ta="center">
              {t('confirm.hint')}
            </Text>
          </Flex>
        </Block>
      </form>
    </Box>
  );
}
