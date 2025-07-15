import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AdressesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [adresses, setAdresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdresses = async () => {
    const { data, error } = await supabase
      .from('adresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setAdresses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdresses();
  }, []);

  const handleSetPrincipale = async (id: string) => {
    await supabase
      .from('adresses')
      .update({ principale: false })
      .eq('user_id', user.id);

    await supabase.from('adresses').update({ principale: true }).eq('id', id);
    const updated = adresses.map((a) => ({ ...a, principale: a.id === id }));
    setAdresses(updated);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Supprimer cette adresse',
      'Êtes-vous sûr de vouloir la supprimer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('adresses').delete().eq('id', id);
            if (!error) {
              setAdresses((prev) => prev.filter((a) => a.id !== id));
            } else {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profil')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes adresses</Text>
        <TouchableOpacity onPress={() => router.push('/ajouter-adresse')}>
          <Ionicons name="add" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text>Chargement...</Text>
        ) : adresses.length === 0 ? (
          <Text style={styles.empty}>Aucune adresse enregistrée.</Text>
        ) : (
          adresses.map((adresse) => (
            <View key={adresse.id} style={styles.card}>
              <Text style={styles.line}>
                <Text style={styles.label}>Nom : </Text>
                {adresse.prenom} {adresse.nom}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Téléphone : </Text>
                {adresse.numero}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Pays : </Text>
                {adresse.pays}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Ville : </Text>
                {adresse.ville}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleSetPrincipale(adresse.id)}>
                  <Text style={{ color: adresse.principale ? 'green' : '#555' }}>
                    {adresse.principale ? 'Adresse principale' : 'Définir comme principale'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(adresse.id)}>
                  <Ionicons name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    color: '#888',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  line: {
    marginBottom: 6,
    color: '#000',
  },
  label: {
    fontWeight: 'bold',
    color: '#222',
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
