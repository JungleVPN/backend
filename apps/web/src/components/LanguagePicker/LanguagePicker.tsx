import { Button, Dropdown, Label } from '@heroui/react';
import {
  getLanguageInfo,
  type TSubscriptionPageLanguageCode,
} from '@remnawave/subscription-page-types';
import { IconLanguage } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { vibrate } from '@/utils/vibrate';

interface IProps {
  currentLang: TSubscriptionPageLanguageCode;
  locales: TSubscriptionPageLanguageCode[] | [];
  onLanguageChange: (lang: TSubscriptionPageLanguageCode) => void;
}

export function LanguagePicker(props: IProps) {
  const { locales, currentLang, onLanguageChange } = props;
  const { i18n } = useTranslation();

  useEffect(() => {
    const nextDir = currentLang === 'fa' ? 'rtl' : 'ltr';
    if (document.documentElement.dir !== nextDir) {
      document.documentElement.dir = nextDir;
    }
  }, [currentLang]);

  useEffect(() => {
    i18n.changeLanguage(currentLang);
  }, [currentLang, i18n]);

  const changeLanguage = (value: TSubscriptionPageLanguageCode) => {
    onLanguageChange(value);
    i18n.changeLanguage(value);
  };

  if (locales.length === 1) return null;

  return (
    <Dropdown>
      <Button
        aria-label='Language'
        className='border border-white/10 bg-white/[0.02]'
        isIconOnly
        variant='secondary'
      >
        <IconLanguage size={22} />
      </Button>
      <Dropdown.Popover className='max-h-64 overflow-y-auto'>
        <Dropdown.Menu
          onAction={(key) => {
            vibrate('doubleTap');
            changeLanguage(key as TSubscriptionPageLanguageCode);
          }}
        >
          {locales.map((item) => {
            const localeInfo = getLanguageInfo(item);
            if (!localeInfo) return null;
            return (
              <Dropdown.Item key={item} id={item} textValue={localeInfo.nativeName}>
                <span className='text-base'>{localeInfo.emoji}</span>
                <Label>{localeInfo.nativeName}</Label>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
