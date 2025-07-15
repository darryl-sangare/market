import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

export default function AjouterAdresse() {
  const router = useRouter();
  const { user } = useAuth();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [pays, setPays] = useState('');
  const [ville, setVille] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState<Country | undefined>();
  const [countryCode, setCountryCode] = useState<CountryCode>('FR');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCountrySelect = (selectedCountry: Country) => {
    setCountry(selectedCountry);
    setCountryCode(selectedCountry.cca2);
    setPays(typeof selectedCountry.name === 'object' ? selectedCountry.name.common : selectedCountry.name);
  };

  const handleSave = async () => {
    setError('');
    if (!prenom || !nom || !pays || !ville || !phoneNumber) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from('adresses').insert({
      user_id: user.id,
      prenom,
      nom,
      pays,
      ville,
      numero: `+${country?.callingCode?.[0] || ''} ${phoneNumber}`,
      principale: false,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      router.replace('/adresses');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ajouter une adresse</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={26} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Prénom</Text>
          <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} />

          <Text style={styles.label}>Nom</Text>
          <TextInput style={styles.input} value={nom} onChangeText={setNom} />

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

          <Text style={styles.label}>Ville</Text>
          <TextInput style={styles.input} value={ville} onChangeText={setVille} />

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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveButtonText}>
              {loading ? 'Enregistrement...' : 'Sauvegarder l’adresse'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  label: {
    marginTop: 12,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    color: '#000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    marginTop: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  phonePrefix: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
});
