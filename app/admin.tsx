import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function AdminCommandes() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'admin') {
      fetchCommandes();
    } else {
      router.replace('/'); // redirection si pas admin
    }
  }, [role]);

  const fetchCommandes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('commandes')
      .select('*')
      .eq('statut', 'en_attente')
      .order('date_creation', { ascending: false });
    setLoading(false);

    if (error) {
      console.error('Erreur fetch commandes admin:', error);
      return;
    }
    setCommandes(data || []);
  };

  const updateStatut = async (id: string, statut: 'validee' | 'refusee') => {
    const { error } = await supabase
      .from('commandes')
      .update({ statut })
      .eq('id', id);

    if (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la commande.');
      return;
    }

    fetchCommandes(); // recharge après action
  };

  const renderCommande = (commande: any) => {
    const date = format(new Date(commande.date_creation), 'dd/MM/yyyy HH:mm');
    const articles = commande.articles || [];

    return (
      <View key={commande.id} style={styles.commandeCard}>
        <View style={styles.headerRow}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.userId}>👤 {commande.user_id}</Text>
        </View>

        {articles.map((a: any, index: number) => (
          <View key={index} style={styles.articleRow}>
            {a.image ? (
              <Image source={{ uri: a.image }} style={styles.articleImage} />
            ) : null}
            <View style={styles.articleInfo}>
              <Text style={styles.articleTitle}>{a.title}</Text>
              <Text style={styles.articleDetail}>
                {a.quantite} × {a.price?.toFixed(2)} €
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.footerRow}>
          <Text style={styles.totalText}>
            Total payé (avec 5 %) : {commande.total_client.toFixed(2)} €
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => updateStatut(commande.id, 'validee')}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.btnText}>Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => updateStatut(commande.id, 'refusee')}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
              <Text style={styles.btnText}>Refuser</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes en attente</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : commandes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucune commande en attente.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {commandes.map(renderCommande)}
        </ScrollView>
      )}
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#000',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
  commandeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  userId: {
    fontSize: 13,
    color: '#999',
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  articleDetail: {
    fontSize: 13,
    color: '#555',
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 12,
    paddingTop: 10,
  },
  totalText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  acceptBtn: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  rejectBtn: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
});
