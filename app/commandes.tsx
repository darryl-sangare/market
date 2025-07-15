import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface Article {
  title: string;
  image?: string;
  price: number;
  quantite: number;
  url: string;
  site: string;
}

interface Commande {
  id: string;
  date_creation: string;
  articles: Article[];
  total_client: number;
  statut: 'en_attente' | 'validee' | 'refusee';
}

export default function MesCommandes() {
  const { user } = useAuth();
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchCommandes = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('commandes')
      .select('id, date_creation, articles, total_client, statut')
      .eq('user_id', user.id)
      .order('date_creation', { ascending: false });
    setLoading(false);

    if (error) {
      console.error('Erreur fetch commandes:', error);
      return;
    }
    setCommandes(data as Commande[]);
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommandes();
    setRefreshing(false);
  };

  const getWebviewPath = (site: string) => {
    const s = site.toLowerCase();
    if (s.includes('amazon')) return '/webviews/AmazonWebview';
    if (s.includes('zara')) return '/webviews/ZaraWebview';
    if (s.includes('shein')) return '/webviews/SheinWebview';
    if (s.includes('zalando')) return '/webviews/ZalandoWebview';
    if (s.includes('asos')) return '/webviews/AsosWebview';
    if (s.includes('hm') || s.includes('h&m')) return '/webviews/HmWebview';
    return '/webviews/DefaultWebview';
  };

  const handleArticlePress = (article: Article) => {
    const webviewPath = getWebviewPath(article.site);
    router.push({
      pathname: webviewPath,
      params: { url: article.url },
    });
  };

  const renderArticle = (item: Article, idx: number) => (
    <TouchableOpacity
      key={idx}
      onPress={() => handleArticlePress(item)}
      style={styles.articleRow}
    >
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.articleImage} />
      )}
      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text style={styles.articleDetail}>
          {item.quantite} × {item.price.toFixed(2)} €
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCommande = ({ item }: { item: Commande }) => {
    const date = format(new Date(item.date_creation), 'dd/MM/yyyy HH:mm');
    let statutTexte = '';
    let statutStyle = {};
    switch (item.statut) {
      case 'en_attente':
        statutTexte = 'En attente';
        statutStyle = styles.statusPending;
        break;
      case 'validee':
        statutTexte = 'Validée';
        statutStyle = styles.statusValid;
        break;
      case 'refusee':
        statutTexte = 'Refusée';
        statutStyle = styles.statusRefused;
        break;
    }

    return (
      <View style={styles.commandeCard}>
        <View style={styles.headerRow}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={[styles.statusText, statutStyle]}>{statutTexte}</Text>
        </View>
        {item.articles.map(renderArticle)}
        <View style={styles.footerRow}>
          <Text style={styles.totalText}>
            Total payé (avec 5 %) : {item.total_client.toFixed(2)} €
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profil')}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes commandes</Text>
      </View>

      <FlatList
        data={commandes}
        keyExtractor={(item) => item.id}
        renderItem={renderCommande}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Vous n’avez pas encore de commandes.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  list: {
    paddingHorizontal: 16,
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
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#000',
  },
  commandeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: { fontSize: 14, color: '#666' },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  statusPending: { color: '#d9822b' },
  statusValid: { color: '#28a745' },
  statusRefused: { color: '#c92c2c' },

  articleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  articleImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: 15, fontWeight: '500' },
  articleDetail: { fontSize: 13, color: '#555' },

  footerRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalText: { fontSize: 16, fontWeight: 'bold' },
});
