import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase'; 

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '192527813561-pslstj0mbc043742s2ht1o0d9gnl95vp.apps.googleusercontent.com',
  }) as ReturnType<typeof Google.useAuthRequest>;

  useEffect(() => {
    const signInWithGoogle = async () => {
      if (response?.type === 'success' && response.authentication?.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.authentication.idToken,
        });

        if (error) {
          console.error('Erreur Google Supabase :', error.message);
          setErrorMsg('Erreur de connexion Google');
        }
      }
    };

    signInWithGoogle();
  }, [response]);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Connexion</Text>

          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="exemple@mail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="•••••••"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => promptAsync()}
            style={[styles.loginButton, { backgroundColor: '#DB4437' }]}
          >
            <Text style={styles.loginButtonText}>Se connecter avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
            <Text style={styles.registerLinkText}>Pas encore de compte ? S’inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  container: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 24,
  },
  label: {
    marginBottom: 6,
    marginTop: 12,
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    color: '#000',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eye: {
    position: 'absolute',
    right: 12,
  },
  loginButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 10,
    marginTop: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  registerLinkText: {
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
