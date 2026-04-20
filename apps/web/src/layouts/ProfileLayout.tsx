import { Outlet } from 'react-router';
import { Navbar } from '@/components/Tabs/Tabs';

export function ProfileLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
