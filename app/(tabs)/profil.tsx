import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, Entypo, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const username = user?.email?.split('@')[0] || 'Utilisateur';

  const options = [
    {
      label: role === 'admin' ? 'Commandes en attente' : 'Mes commandes',
      icon: 'bag-outline',
      onPress: () =>
        router.push(role === 'admin' ? '/admin' : '/commandes'),
    },
    { label: 'Mes informations', icon: 'person-outline', onPress: () => {} },
    { label: 'Devise', icon: 'cash-outline', right: 'XOF', onPress: () => {} },
    {
      label: 'Changer le mot de passe',
      icon: 'lock-closed-outline',
      onPress: () => {},
    },
    { label: 'Mon adresse', icon: 'home-outline', onPress: () => {} },
    {
      label: 'Nous contacter',
      icon: 'chatbubble-ellipses-outline',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Hello {username}</Text>
          {role === 'admin' && (
            <FontAwesome
              name="star"
              size={18}
              color="#f0c419"
              style={{ marginLeft: 6 }}
            />
          )}
        </View>

        <View style={styles.section}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.row}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color="#333"
                  style={styles.icon}
                />
                <Text style={styles.label}>{item.label}</Text>
              </View>
              <View style={styles.row}>
                {item.right && (
                  <Text style={styles.rightText}>{item.right}</Text>
                )}
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item} onPress={() => {}}>
            <View style={styles.row}>
              <MaterialIcons
                name="delete-outline"
                size={20}
                color="#333"
                style={styles.icon}
              />
              <Text style={styles.label}>Supprimer mon compte</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleLogout}>
            <View style={styles.row}>
              <Entypo
                name="log-out"
                size={20}
                color="red"
                style={styles.icon}
              />
              <Text style={[styles.label, { color: 'red' }]}>Déconnexion</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
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
  container: {
    flex: 1,
    padding: 16,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    color: '#111',
  },
  rightText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  version: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 13,
    marginBottom: 20,
  },
});
