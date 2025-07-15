import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const shops = [
  {
    name: "Shein",
    url: "https://fr.shein.com/",
    logo: "https://seeklogo.com/images/S/shein-logo-8B29214E0D-seeklogo.com.png",
  },
  {
    name: "H&M",
    url: "https://www2.hm.com/fr_fr/index.html",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
  },
  {
    name: "Asos",
    url: "https://www.asos.com/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/ASOS_logo.svg",
  },
  {
    name: "Zara",
    url: "https://www.zara.com/fr/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Zara_Logo_2.svg",
  },
  {
    name: "Amazon",
    url: "https://www.amazon.fr/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  {
    name: "Zalando",
    url: "https://www.zalando.fr/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Zalando-Logo.svg",
  },
];

const categories = [
  { title: "Mode", image: "https://cdn.pixabay.com/photo/2016/11/19/17/36/woman-1838411_1280.jpg" },
  { title: "Électronique", image: "https://cdn.pixabay.com/photo/2017/01/06/19/15/music-1950557_1280.jpg" },
  { title: "Beauté", image: "https://cdn.pixabay.com/photo/2016/11/29/12/54/makeup-1869036_1280.jpg" },
];

export default function HomeScreen() {
  const router = useRouter();

  const openSite = (url: string) => {
    router.push({ pathname: '/webviews', params: { url } });
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TextInput
        placeholder="Rechercher"
        placeholderTextColor="#999"
        style={styles.search}
      />

      <Image
        source={{
          uri: "https://www.shein.com/images/banner/hp-active-banner-fr.webp",
        }}
        style={styles.banner}
        resizeMode="cover"
      />

      <Text style={styles.sectionTitle}>Boutiques</Text>
      <View style={styles.grid}>
        {shops.map((shop, index) => (
          <TouchableOpacity key={index} style={styles.shopCard} onPress={() => openSite(shop.url)}>
            <Image source={{ uri: shop.logo }} style={styles.shopLogo} resizeMode="contain" />
            <Text style={styles.shopText}>{shop.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Catégories de boutiques</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat, i) => (
          <View key={i} style={styles.categoryCard}>
            <Image source={{ uri: cat.image }} style={styles.categoryImage} />
            <Text style={styles.categoryText}>{cat.title}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  search: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shopCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shopLogo: {
    width: 50,
    height: 50,
    marginBottom: 6,
  },
  shopText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  categoryImage: {
    width: '100%',
    height: 100,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    padding: 8,
  },
});
