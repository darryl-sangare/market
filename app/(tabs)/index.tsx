import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const brands = [
  { name: "Amazon", url: "https://www.amazon.fr/" },
  { name: "Zalando", url: "https://www.zalando.fr/" },
  { name: "Shein", url: "https://fr.shein.com/" },
  { name: "Asos", url: "https://www.asos.com/" },
  { name: "H&M", url: "https://www2.hm.com/fr_fr/index.html" },
  { name: "Zara", url: "https://www.zara.com/fr/" },
];

export default function HomeScreen() {
  const router = useRouter();

  const openSite = (url: string, name: string) => {
    router.push({ pathname: '/webview', params: { url, title: name } });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Bienvenue sur Authentik Express 🌍
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {brands.map((brand, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: '#f1f1f1',
              borderRadius: 12,
              width: '48%',
              height: 100,
              marginBottom: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => openSite(brand.url, brand.name)}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{brand.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
