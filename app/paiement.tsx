import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaiementScreen() {
  const router = useRouter();
  const { adresseId, method } = useLocalSearchParams();

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    const createCheckout = async () => {
      try {
        const response = await fetch("https://stripe-backend-qzpz.onrender.com/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 5000, // 💶 montant à adapter dynamiquement si besoin
            adresseId,
            method,
          }),
        });

        const data = await response.json();

        if (!data.url) {
          Alert.alert("Erreur", "URL de paiement introuvable.");
          return;
        }

        setCheckoutUrl(data.url);
      } catch (error) {
        console.error("Erreur Stripe Checkout :", error);
        Alert.alert("Erreur", "Impossible de lancer le paiement.");
      }
    };

    createCheckout();
  }, [adresseId, method]);

  if (!checkoutUrl) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: checkoutUrl }}
      style={{ flex: 1 }}
      onNavigationStateChange={(navState) => {
        if (navState.url.includes('/success')) {
          router.replace('/confirmation');
        }
      }}
    />
  );
}
