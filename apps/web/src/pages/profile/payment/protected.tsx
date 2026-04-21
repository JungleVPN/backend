import { AuthGuard } from '@/components/AuthGuard/AuthGuard';
import PaymentPage from './PaymentPage';

export const ProtectedPaymentPage = () => (
  <AuthGuard>
    <PaymentPage />
  </AuthGuard>
);
