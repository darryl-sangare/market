// app/(tabs)/profil.tsx
import { View, Text, Button } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Profil() {
  const { user, role, logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text>Email : {user?.email}</Text>
      <Text>Rôle : {role}</Text>
      <Button title="Se déconnecter" onPress={logout} />
    </View>
  );
}
