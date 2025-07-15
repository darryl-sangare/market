import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  user_id: string;
  url: string;
  site: string;
  title?: string;
  price?: string;
  image?: string;
  taille?: string;
  couleur?: string;
  quantite?: number;
  autre?: string;
  inserted_at?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'user_id'>) => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('inserted_at', { ascending: false });

    if (!error && data) {
      setCartItems(data as CartItem[]);
    } else {
      console.log('Erreur fetchCart:', error?.message);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id' | 'user_id'>) => {
    if (!user) return;

    console.log('Données envoyées à Supabase:', item);

    const { error } = await supabase.from('cart_items').insert({
      ...item,
      user_id: user.id,
    });

    if (!error) {
      console.log('Ajout réussi à Supabase');
      await fetchCart();
    } else {
      console.log('Erreur Supabase addToCart:', error.message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
