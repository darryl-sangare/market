import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const { user, loading } = useAuth(); 
  const router = useRouter();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) return; 

    const startAnimation = () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          if (user) {
            router.replace('/(tabs)/home');
          } else {
            router.replace('/login');
          }
        }, 50);
      });
    };

    const timer = setTimeout(startAnimation, 1500);
    return () => clearTimeout(timer);
  }, [loading, user]); 

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.title}>AUTHENTIK EXPRESS</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1.5,
  },
});
