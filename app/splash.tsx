// app/splash.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const fadeAnim = new Animated.Value(1); 

  useEffect(() => {
    setTimeout(() => {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        if (user) {
          router.replace('/'); 
        } else {
          router.replace('/login'); 
        }
      });
    }, 1500);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.text}>AUTHENTIK EXPRESS</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1.5,
  },
});
