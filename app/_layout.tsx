import { StripeProvider } from '@stripe/stripe-react-native';
import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Kr6XgCIEsnEbzHK5Xu6YJrLlGwbMSNdfk3GM9aZ6yX3PvVpSsm04A84dwtRYras7fCd8N26eLY7PTmd39JOJeMl00B8b9JiT8';

export default function Layout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <AuthProvider>
        <CartProvider>
          <Slot />
        </CartProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
