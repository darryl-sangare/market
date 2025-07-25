import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function Register() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState<Country | undefined>();
  const [countryCode, setCountryCode] = useState<CountryCode>('FR');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const validateEmail = (email: string) => email.includes('@') && email.includes('.');

  const handleRegister = async () => {
  setErrorMsg('');

  if (!email || !password || !country || !phoneNumber) {
    setErrorMsg('Veuillez remplir tous les champs requis.');
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

  if (!/^\d{6,15}$/.test(phoneNumber)) {
    setErrorMsg('Veuillez entrer un numéro de téléphone valide.');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data?.user?.id) {
      setErrorMsg(error?.message || 'Erreur lors de la création du compte.');
      return;
    }

    const userId = data.user.id;

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: userId, 
      country: typeof country?.name === 'object' ? country.name.common : country?.name,
      phone_number: `+${country?.callingCode?.[0] || ''} ${phoneNumber}`,
    });

    if (profileError) {
      setErrorMsg('Compte créé, mais erreur lors de l’enregistrement du profil.');
      return;
    }

    router.replace('/login');
  } catch (err: any) {
    setErrorMsg(err.message || "Erreur lors de l'inscription.");
  }
};


  const handleCountrySelect = (selectedCountry: Country) => {
    setCountry(selectedCountry);
    setCountryCode(selectedCountry.cca2);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Text style={styles.title}>Créer un compte</Text>

            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

            <Text style={styles.label}>Prénom</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="John" />

            <Text style={styles.label}>Nom</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Adore" />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="exemple@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Pays</Text>
            <View style={styles.pickerWrapper}>
              <CountryPicker
                withFilter
                withFlag
                withCountryNameButton
                countryCode={countryCode}
                onSelect={handleCountrySelect}
              />
            </View>

            <Text style={styles.label}>Téléphone</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <CountryPicker
                  withCallingCodeButton
                  withFlag
                  withCallingCode
                  countryCode={countryCode}
                  onSelect={handleCountrySelect}
                />
              </View>
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Numéro"
                keyboardType="phone-pad"
              />
            </View>

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

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Créer un compte</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
              <Text style={styles.loginButtonText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 20,
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eye: {
    position: 'absolute',
    right: 12,
  },
  registerButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 10,
    marginTop: 24,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  loginButtonText: {
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
