import { useStripe } from '@stripe/stripe-react-native';
import React from 'react';
import { Alert, Button, View } from 'react-native';

export default function PaiementScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePay = async () => {
    try {
      const res = await fetch("http://192.168.1.63:3000/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5000 }) // Montant en centimes (€)
      });

      const { clientSecret } = await res.json();

      if (!clientSecret) {
        Alert.alert("Erreur", "Le clientSecret est vide.");
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
        Alert.alert("Paiement refusé", paymentError.message);
      } else {
        Alert.alert("Succès", "Paiement validé !");
        // Ici tu peux ajouter l'enregistrement de la commande
      }

    } catch (err) {
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Payer 50 €" onPress={handlePay} />
    </View>
  );
}
