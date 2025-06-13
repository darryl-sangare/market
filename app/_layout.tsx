import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Slot />
      </CartProvider>
    </AuthProvider>
  );
}
