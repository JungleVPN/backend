import { FloatingIndicator, Tabs } from '@mantine/core';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import css from './Tabs.module.css';

type TabValue = 'subscription' | 'payment';

const TAB_VALUES: TabValue[] = ['subscription', 'payment'];

function getActiveTab(pathname: string): TabValue {
  const segment = pathname.split('/').pop() as TabValue;
  return TAB_VALUES.includes(segment) ? segment : 'subscription';
}

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
    <Tabs className={css.tabs} variant='none' value={activeTab} onChange={handleChange}>
      <Tabs.List ref={setRootRef} className={css.list}>
        <Tabs.Tab value='subscription' ref={setControlRef('subscription')} className={css.tab}>
          subscription
        </Tabs.Tab>
        <Tabs.Tab value='payment' ref={setControlRef('payment')} className={css.tab}>
          payment
        </Tabs.Tab>

        <FloatingIndicator
          target={controlsRefs[activeTab] ?? null}
          parent={rootRef}
          className={css.indicator}
        />
      </Tabs.List>
    </Tabs>
  );
};
