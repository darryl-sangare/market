import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

export default function ConfirmationCommande() {
  const router = useRouter();
  const { images } = useLocalSearchParams();
  const insets = useSafeAreaInsets(); 
  const imageList = typeof images === 'string' ? JSON.parse(images) : [];

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <TouchableOpacity
        onPress={() => router.push('/home')}
        style={[styles.closeBtn, { top: insets.top + 10 }]} 
      >
        <Ionicons name="close-outline" size={32} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🎉 Commande effectuée !</Text>

        <Text style={styles.message}>
          Votre commande a bien été enregistrée.{"\n"}
          Un e-mail vous sera envoyé dès qu’elle sera traitée ou validée.{"\n\n"}
          Merci pour votre fidélité 🙏
        </Text>

        <View style={styles.imageList}>
          {imageList.map((img: string, index: number) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 24,
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
});
