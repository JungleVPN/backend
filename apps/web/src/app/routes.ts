import type { ComponentType } from 'react';

import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';

interface Route {
  path: string;
  Component: ComponentType;
  title: string;
}

export const routes: Route[] = [
  { path: '/', Component: HomePage, title: 'Home' },
  { path: '/dashboard', Component: DashboardPage, title: 'Dashboard' },
];
