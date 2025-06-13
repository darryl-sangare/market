import { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const handleRegister = async () => {
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg("L'adresse email est invalide.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      await register(email, password, 'user');
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setErrorMsg("Cet email est déjà utilisé.");
      } else {
        setErrorMsg("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Inscription</Text>

      {errorMsg ? (
        <Text style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</Text>
      ) : null}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 20, padding: 8 }}
      />

      <Button title="Créer un compte" onPress={handleRegister} />

      <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 20 }}>
        <Text style={{ color: 'blue', textAlign: 'center' }}>
          Déjà un compte ? Se connecter
        </Text>
      </TouchableOpacity>
    </View>
  );
}


