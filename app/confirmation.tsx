import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
        <CheckCircle2 size={72} color="#28a745" style={styles.icon} />

        <Text style={styles.title}>Commande confirmée</Text>
        <Text style={styles.message}>
          Merci pour votre achat !{"\n"}
          Vous recevrez un e-mail dès que votre commande sera traitée.
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

        <TouchableOpacity onPress={() => router.push('/home')} style={styles.returnButton}>
          <Text style={styles.returnText}>Retour à l'accueil</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 12,
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
    gap: 12,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    margin: 8,
  },
  returnButton: {
    marginTop: 32,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  returnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});