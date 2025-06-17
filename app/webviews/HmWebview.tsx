import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import ProductModal from '../../components/ProductModal';

export default function HmWebview({ url }: { url: string }) {
  const { addToCart, cartItems } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const siteName = new URL(url).hostname.replace('www.', '');

  const injectedHmScript = `
    (function() {
      try {
        const title = document.title || '';

        let price = '';
        const allSpans = document.querySelectorAll('span');
        for (const el of allSpans) {
          const txt = el.textContent?.trim();
          if (txt && txt.match(/[0-9]+[.,][0-9]{2}/)) {
            price = txt.match(/[0-9]+[.,][0-9]{2}/)[0];
            break;
          }
        }

        const image = document.querySelector('img[src*="image.hm.com"]')?.src ||
                      document.querySelector('meta[property="og:image"]')?.content ||
                      document.querySelector('img')?.src || '';

        const button = document.createElement('button');
        button.innerText = "Ajouter au panier";
        button.style.position = "fixed";
        button.style.bottom = "20px";
        button.style.left = "50%";
        button.style.transform = "translateX(-50%)";
        button.style.padding = "14px 24px";
        button.style.backgroundColor = "#ffc107";
        button.style.color = "black";
        button.style.border = "none";
        button.style.borderRadius = "8px";
        button.style.fontSize = "16px";
        button.style.zIndex = "9999";
        button.onclick = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            url: window.location.href,
            title,
            price,
            image
          }));
        };
        document.body.appendChild(button);
      } catch (e) {
        console.log('❌ Erreur JS H&M:', e);
      }
    })();
    true;
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setSelectedProduct({ ...data, site: siteName });
      setModalVisible(true);
    } catch (error) {
      console.log('❌ Erreur parsing WebView → React Native :', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text numberOfLines={1} style={styles.urlText}>{url}</Text>

        <TouchableOpacity onPress={() => router.push('/panier')} style={styles.cartWrapper}>
          <Ionicons name="cart-outline" size={24} color="black" />
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <WebView
        source={{ uri: url }}
        injectedJavaScript={injectedHmScript}
        onMessage={handleMessage}
        javaScriptEnabled
        startInLoadingState
        style={{ flex: 1 }}
      />

      <ProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        product={selectedProduct}
        onAdd={async (product: any) => {
          await addToCart(product);
          setShowSuccess(true);

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();

          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => setShowSuccess(false));
          }, 3000);
        }}
      />

      {showSuccess && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>✅ Article ajouté au panier avec succès</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  urlText: {
    flex: 1,
    fontSize: 13,
    color: 'blue',
    marginHorizontal: 8,
    textAlign: 'center',
  },
  cartWrapper: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  toastText: {
    color: '#333',
    fontWeight: 'bold',
  },
});
