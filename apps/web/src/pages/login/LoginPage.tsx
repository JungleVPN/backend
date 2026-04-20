import { Alert, Button, Container, TextInput, Title } from '@mantine/core';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { createClient } from '@/lib/supabase/client';
import { Block } from '@/ui/Block/Block';
import css from './login.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    navigate(`/login/confirm?email=${encodeURIComponent(email)}&message=Enter OTP`);
  };

  return (
    <Container size='xs' mt={100}>
      <Block radius='md' p='xl'>
        <Title order={1} className={css.title} ta='center' mb='xs'>
          {t('login.title')}
        </Title>

        {(message || error) && (
          <Alert color={message?.includes('Check email') ? 'green' : 'red'} mb='lg'>
            {error || message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label={t('login.email_label')}
            name='email'
            className={css.input}
            placeholder={t('login.email_placeholder')}
            required
            type='email'
            mb='md'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type='submit' fullWidth loading={loading}>
            {t('login.submit')}
          </Button>
        </form>
      </Block>
    </Container>
  );
}
