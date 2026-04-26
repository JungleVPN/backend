import { Tabs } from '@heroui/react';
import { IconWallet } from '@tabler/icons-react';
import { useCallback } from 'react';
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

const tabs: TabDef[] = [
  { id: 'subscription', label: 'Subscription', icon: <IconWallet className='size-4' /> },
  { id: 'payment', label: 'Payment', icon: <IconWallet className='size-4' /> },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = getActiveTab(pathname);

  const handleSelectionChange = useCallback(
    (key: string | number | null) => {
      if (key != null) {
        navigate(`/profile/${key}`);
      }
    },
    [navigate],
  );

  return (
    <Tabs
      className={css.root}
      selectedKey={activeTab}
      // variant='secondary'
      onSelectionChange={handleSelectionChange}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label='Profile sections'>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.id} id={tab.id}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
};
