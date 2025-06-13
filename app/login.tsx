import { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      console.log('Erreur de connexion Supabase :', err);
      setErrorMsg(err.message || 'Erreur de connexion');
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Connexion</Text>

      {errorMsg ? (
        <Text style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</Text>
      ) : null}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 20, padding: 8 }}
      />

      <Button title="Se connecter" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 20 }}>
        <Text style={{ color: 'blue', textAlign: 'center' }}>
          Pas encore de compte ? S’inscrire
        </Text>
      </TouchableOpacity>
    </View>
  );
}
