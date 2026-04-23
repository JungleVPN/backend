import { FloatingIndicator, Tabs, ThemeIcon } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import css from './Tabs.module.css';

type TabValue = 'subscription' | 'payment';
interface Tab {
  id: TabValue;
  label: string;
  icon: React.ReactNode;
}

const TAB_VALUES: TabValue[] = ['subscription', 'payment'];

function getActiveTab(pathname: string): TabValue {
  const segment = pathname.split('/').pop() as TabValue;
  return TAB_VALUES.includes(segment) ? segment : 'subscription';
}

const tabs: Array<Tab> = [
  {
    id: 'subscription',
    label: 'Subscription',
    icon: <IconWallet />,
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: <IconWallet />,
  },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeTab = getActiveTab(pathname);

  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [controlsRefs, setControlsRefs] = useState<Record<TabValue, HTMLButtonElement | null>>({
    subscription: null,
    payment: null,
  });

  const handleChange = useCallback(
    (value: string | null) => {
      if (value) {
        navigate(`/profile/${value}`);
      }
    },
    [navigate],
  );

  const setControlRef = (val: TabValue) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  return (
    <Tabs classNames={css} variant='none' value={activeTab} onChange={handleChange}>
      <Tabs.List ref={setRootRef}>
        {tabs.map((tab) => {
          return (
            <Tabs.Tab
              key={tab.id}
              value={tab.id}
              ref={setControlRef(tab.id)}
              leftSection={
                <ThemeIcon className={css.tabIcon} variant='white' size={'sm'}>
                  {tab.icon}
                </ThemeIcon>
              }
            >
              {tab.label}
            </Tabs.Tab>
          );
        })}

        <FloatingIndicator
          target={controlsRefs[activeTab] ?? null}
          parent={rootRef}
          className={css.indicator}
        />
      </Tabs.List>
    </Tabs>
  );
};
