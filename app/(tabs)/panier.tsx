import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';

interface CartItem {
  id: string;
  url: string;
  site: string;
  title?: string;
  price?: string;
  image?: string;
  taille?: string;
  couleur?: string;
  quantite?: number;
}

export default function Panier() {
  const { cartItems, fetchCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getWebviewPath = (site: string) => {
    const s = site.toLowerCase();
    if (s.includes('amazon')) return '/webviews/AmazonWebview';
    if (s.includes('zara')) return '/webviews/ZaraWebview';
    if (s.includes('shein')) return '/webviews/SheinWebview';
    if (s.includes('zalando')) return '/webviews/ZalandoWebview';
    if (s.includes('asos')) return '/webviews/AsosWebview';
    if (s.includes('h&m') || s.includes('hm')) return '/webviews/HmWebview';
    return '/webviews/DefaultWebview';
  };

  const handleDelete = async (id: string) => {
    const confirm = await new Promise<boolean>((resolve) =>
      Alert.alert('Supprimer', 'Retirer cet article du panier ?', [
        { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Supprimer', style: 'destructive', onPress: () => resolve(true) },
      ])
    );
    if (!confirm) return;

    const { error } = await supabase.from('cart_items').delete().eq('id', id);
    if (!error) fetchCart();
  };

  const handleClearAll = async () => {
    const confirm = await new Promise<boolean>((resolve) =>
      Alert.alert('Tout supprimer', 'Vider le panier ?', [
        { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Oui', style: 'destructive', onPress: () => resolve(true) },
      ])
    );
    if (!confirm || !user) return;

    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
    if (!error) fetchCart();
  };

  const handleCommander = async () => {
    if (!user) {
      Alert.alert("Erreur", "Connectez-vous d'abord.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Erreur", "Votre panier est vide.");
      return;
    }

    const totalArticles = cartItems.reduce((total, item) => {
      const prix = parseFloat(item.price || '0');
      return total + (isNaN(prix) ? 0 : prix);
    }, 0);

    const totalClient = +(totalArticles * 1.05).toFixed(2);

    try {
      const res = await fetch("https://stripe-backend-qzpz.onrender.com/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(totalClient * 100) })
      });

      const { clientSecret } = await res.json();

      if (!clientSecret) {
        Alert.alert("Erreur", "Le paiement a échoué (clientSecret introuvable).");
        return;
      }

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Ma boutique",
      });

      if (initError) {
        Alert.alert("Erreur lors de l'initialisation", initError.message);
        return;
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert("Paiement annulé", paymentError.message);
        return;
      }

      const articles = cartItems.map(item => ({
        title: item.title,
        price: parseFloat(item.price || '0'),
        taille: item.taille,
        couleur: item.couleur,
        quantite: item.quantite || 1,
        site: item.site,
        url: item.url,
        image: item.image,
      }));

      const { error } = await supabase.from('commandes').insert([
        {
          user_id: user.id,
          articles,
          total_articles: totalArticles,
          total_client: totalClient,
          statut: 'en_attente',
        },
      ]);

      if (error) {
        console.error("Erreur lors de l'enregistrement de la commande :", error);
        Alert.alert("Erreur", "Commande payée mais non enregistrée.");
        return;
      }

      await supabase.from('cart_items').delete().eq('user_id', user.id);
      fetchCart();

      const images = articles.map(a => a.image).filter(Boolean);
      router.push({
        pathname: '/confirmation',
        params: { images: JSON.stringify(images) },
      });

    } catch (err) {
      console.error("Erreur générale :", err);
      Alert.alert("Erreur", "Une erreur est survenue pendant le paiement.");
    }
  };

  const toggleTitle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalGeneral = cartItems.reduce((total, item) => {
    const prix = parseFloat(item.price || '0');
    return total + (isNaN(prix) ? 0 : prix);
  }, 0).toFixed(2);

  const renderItem = ({ item }: { item: CartItem }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: getWebviewPath(item.site), params: { url: item.url } })
      }
      style={styles.card}
    >
      <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.image} />
      <View style={styles.info}>
        <TouchableOpacity onPress={() => toggleTitle(item.id)}>
          <Text style={styles.title} numberOfLines={expandedId === item.id ? undefined : 1}>
            {item.title || 'Produit sans titre'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.price}>{item.price || '-'} €</Text>
        <Text style={styles.detail}>Taille : {item.taille || '-'}</Text>
        <Text style={styles.detail}>Couleur : {item.couleur || '-'}</Text>
        <Text style={styles.detail}>Quantité : {item.quantite || 1}</Text>
        <Text numberOfLines={1} style={styles.link}>{item.site}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>🛒 Mon Panier</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearAll}>
            <Ionicons name="trash-bin" size={18} color="#fff" />
            <Text style={styles.clearAllText}>Tout supprimer</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Votre panier est vide.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {cartItems.length > 0 && (
        <>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total articles : {totalGeneral} €
            </Text>
          </View>

          <TouchableOpacity onPress={handleCommander} style={styles.commandButton}>
            <Text style={styles.commandButtonText}>
              Commander (Total +5% : {(Number(totalGeneral) * 1.05).toFixed(2)} €)
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: { fontSize: 24, fontWeight: 'bold' },
  clearAll: {
    flexDirection: 'row',
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearAllText: { color: '#fff', fontSize: 14, marginLeft: 6, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: { width: 80, height: 80, backgroundColor: '#ddd', borderRadius: 8 },
  info: { flex: 1, paddingHorizontal: 10 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  price: { color: '#007bff', marginBottom: 4 },
  detail: { fontSize: 13, color: '#444', marginBottom: 2 },
  link: { fontSize: 13, color: '#777' },
  deleteBtn: {
    backgroundColor: '#ff4d4d',
    padding: 8,
    borderRadius: 50,
    marginLeft: 8,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
  },
  totalText: { fontSize: 18, fontWeight: 'bold', textAlign: 'right' },
  commandButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  commandButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
