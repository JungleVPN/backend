import { Tabs } from '@heroui/react';
import { IconPigFilled, IconWallet } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import css from './Tabs.module.css';

type TabValue = 'subscription' | 'payment';

interface TabDef {
  id: TabValue;
  label: string;
  icon: React.ReactNode;
}

const TAB_VALUES: TabValue[] = ['subscription', 'payment'];

function getActiveTab(pathname: string): TabValue {
  const segment = pathname.split('/').pop() as TabValue;
  return TAB_VALUES.includes(segment) ? segment : 'subscription';
}

export const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = getActiveTab(pathname);

  const tabs = useMemo<TabDef[]>(
    () => [
      {
        id: 'subscription',
        label: t('profileTabs.subscription'),
        icon: <IconWallet className='size-4' />,
      },
      {
        id: 'payment',
        label: t('profileTabs.payment'),
        icon: <IconPigFilled className='size-4' />,
      },
    ],
    [t],
  );

  const handleSelectionChange = useCallback(
    (key: string | number | null) => {
      if (key != null) {
        navigate(`/profile/${key}`);
      }
    },
    [navigate],
  );

  return (
    <Tabs className={css.root} selectedKey={activeTab} onSelectionChange={handleSelectionChange}>
      <Tabs.ListContainer>
        <Tabs.List aria-label={t('profileTabs.ariaLabel')} className={css.list}>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.id} id={tab.id} className={css.tab}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <Tabs.Indicator className={css.indicator} />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
};
