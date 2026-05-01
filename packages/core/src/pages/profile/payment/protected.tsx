import { AuthGuard } from '../../../components';
import PaymentPage from './PaymentPage';

export function ProtectedPaymentPage() {
  return (
    <AuthGuard>
      <PaymentPage />
    </AuthGuard>
  );
}
