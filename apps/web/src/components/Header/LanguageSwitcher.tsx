import { Menu, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useSubscriptionConfigStoreActions } from '@workspace/core/stores';
import type { TSubscriptionPageLanguageCode } from '@remnawave/subscription-page-types';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { setLanguage } = useSubscriptionConfigStoreActions();

  const handleLanguageChange = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    setLanguage(newLocale as TSubscriptionPageLanguageCode);
  };

  return (
    <Menu shadow="md" width={100}>
      <Menu.Target>
        <UnstyledButton style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '14px' }}>
          {i18n.language?.split('-')[0] || 'ru'}
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={() => handleLanguageChange('ru')}>Русский</Menu.Item>
        <Menu.Item onClick={() => handleLanguageChange('en')}>English</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
