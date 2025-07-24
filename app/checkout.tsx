import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Type local des adresses (basé sur ta table Supabase)
type Adresse = {
  id: string;
  user_id: string;
  prenom: string;
  nom: string;
  pays: string;
  ville: string;
  numero: string;
};

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();

  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [selectedAdresse, setSelectedAdresse] = useState<Adresse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money'>('card');
  const [loading, setLoading] = useState(true);

  // Recharge les adresses à chaque retour sur la page
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchAdresses();
      }
    }, [user])
  );

  const fetchAdresses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('adresses')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur chargement adresses :', error);
    } else {
      setAdresses((data ?? []) as Adresse[]);
      if (data && data.length > 0) setSelectedAdresse(data[0]);
    }

    setLoading(false);
  };

  const handleContinue = () => {
    if (!selectedAdresse) {
      alert('Veuillez sélectionner une adresse de livraison.');
      return;
    }

    router.push({
      pathname: '/paiement',
      params: {
        adresseId: selectedAdresse.id,
        method: paymentMethod,
      },
    });
  };

  const handleAddAdresse = () => {
    router.push('/ajouter-adresse');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Adresse de livraison</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : adresses.length === 0 ? (
        <View>
          <Text>Aucune adresse enregistrée.</Text>
          <TouchableOpacity style={styles.button} onPress={handleAddAdresse}>
            <Text style={styles.buttonText}>Ajouter une adresse</Text>
          </TouchableOpacity>
        </View>
      ) : (
        adresses.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.adresseItem,
              selectedAdresse?.id === item.id && styles.selected,
            ]}
            onPress={() => setSelectedAdresse(item)}
          >
            <Text>{item.prenom} {item.nom}</Text>
            <Text>{item.ville}, {item.pays}</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.title}>Méthode de paiement</Text>
      {['card', 'mobile_money'].map((method) => (
        <TouchableOpacity
          key={method}
          style={[
            styles.paymentItem,
            paymentMethod === method && styles.selected,
          ]}
          onPress={() => setPaymentMethod(method as 'card' | 'mobile_money')}
        >
          <Text>{method === 'card' ? 'Carte bancaire' : 'Mobile Money'}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Payer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  adresseItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  selected: {
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
