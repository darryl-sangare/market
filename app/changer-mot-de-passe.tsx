import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async () => {
    setErrorMsg('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (loginError) {
      setErrorMsg("L'ancien mot de passe est incorrect.");
      return;
    }

    
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setErrorMsg(updateError.message);
    } else {
      setSuccess('Mot de passe mis à jour avec succès.');
      setTimeout(() => router.back(), 1500);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.push('/profil')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Changer mon mot de passe</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Text style={styles.label}>Ancien mot de passe</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
          />
        </View>

        <Text style={styles.label}>Nouveau mot de passe</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
          />
        </View>

        <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Mettre à jour</Text>
        </TouchableOpacity>
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
  back: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    color: '#000',
    fontWeight: '500',
  },
  inputGroup: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#000',
  },
  eye: {
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  success: {
    color: 'green',
    marginTop: 10,
  },
});
