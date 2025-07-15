import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function InfosScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [commandes, setCommandes] = useState<any[]>([]);
  const [profil, setProfil] = useState<{ country?: string; phone_number?: string } | null>(null);

  useEffect(() => {
    const fetchCommandes = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('commandes')
        .select('id, articles')
        .eq('user_id', user.id)
        .order('date_creation', { ascending: false });

      if (!error && data) setCommandes(data);
    };

    const fetchProfil = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('country, phone_number')
        .eq('id', user.id)
        .single();

      if (!error && data) setProfil(data);
    };

    fetchCommandes();
    fetchProfil();
  }, [user]);

  const derniereCommande = commandes?.[0];
  const articles = derniereCommande?.articles || [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Mes informations</Text>

        <View style={styles.block}>
          <Text style={styles.label}>Adresse e-mail</Text>
          <Text style={styles.value}>{user?.email}</Text>

          <Text style={styles.label}>Date d’inscription</Text>
          <Text style={styles.value}>
            {new Date(user?.created_at).toLocaleDateString()}
          </Text>

          <Text style={styles.label}>Pays</Text>
          <Text style={styles.value}>{profil?.country || 'Non renseigné'}</Text>

          <Text style={styles.label}>Numéro de téléphone</Text>
          <Text style={styles.value}>{profil?.phone_number || 'Non renseigné'}</Text>

          <Text style={styles.label}>Nombre de commandes passées</Text>
          <Text style={styles.value}>{commandes.length}</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/commandes')}>
          <Text style={styles.subTitle}>Dernière commande</Text>
        </TouchableOpacity>

        <View style={styles.commandeContainer}>
          {articles.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {articles.map((article: any, index: number) => (
                <View key={index} style={styles.article}>
                  <Image
                    source={{ uri: article.image || 'https://via.placeholder.com/60' }}
                    style={styles.articleImage}
                  />
                  <Text numberOfLines={1} style={styles.articleName}>
                    {article.nom || `Article ${index + 1}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noCommande}>Aucune commande pour le moment.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingTop: 10,
  },
  back: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  subTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 12,
    color: '#007aff',
  },
  block: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
  },
  label: {
    color: '#777',
    fontSize: 13,
    marginTop: 12,
  },
  value: {
    color: '#111',
    fontSize: 15,
    fontWeight: '500',
  },
  commandeContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
  },
  article: {
    marginRight: 12,
    alignItems: 'center',
    width: 80,
  },
  articleImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#eee',
  },
  articleName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  noCommande: {
    color: '#666',
    fontStyle: 'italic',
  },
});
