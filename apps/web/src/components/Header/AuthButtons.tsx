import { Button, Group } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { useAuthStoreInfo, useAuthStoreActions } from '@/store/auth';

export function AuthButtons() {
  const { user, loading } = useAuthStoreInfo();
  const { setUser } = useAuthStoreActions();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  if (loading) {
    return null;
  }

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  if (user) {
    return (
      <Group gap="xs">
        <Button variant="outline" color="red" onClick={handleLogout}>
          {t('header.logout')}
        </Button>
      </Group>
    );
  }

  if (location.pathname.includes('login')) return null;

  return (
    <Button variant="filled" onClick={handleLogin}>
      {t('header.login')}
    </Button>
  );
}
