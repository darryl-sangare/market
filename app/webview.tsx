// ✅ webview.tsx avec extraction améliorée du prix
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import ProductModal from '../components/ProductModal';

export default function Webview() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { addToCart, cartItems } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  if (!url) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>URL invalide</Text>
      </SafeAreaView>
    );
  }

  const siteName = new URL(url).hostname.replace('www.', '');

  const injectedScript = `
    (function() {
      function getText(selector) {
        const el = document.querySelector(selector);
        return el ? el.innerText || el.textContent : '';
      }
      function getMetaContent(selector) {
        const el = document.querySelector(selector);
        return el ? el.content || el.innerText : '';
      }

      const title = document.title || getMetaContent('meta[property="og:title"]') || getText('h1');
      const priceCandidates = [
        '[itemprop="price"]',
        '[class*="price"]',
        '.a-price-whole',
        'meta[property="product:price:amount"]',
        '.product-price',
        '.price-tag',
        '.product-price-value',
        '.pdp-price',
        '.current-price',
        '.product-price__price',
        '.sales-price'
      ];
      let price = '';
      for (const selector of priceCandidates) {
        const txt = getText(selector);
        if (txt && txt.match(/[0-9]/)) {
          price = txt.replace(/[^0-9.,]/g, '').trim();
          break;
        }
      }

      const image =
        document.querySelector('meta[property="og:image"]')?.content ||
        document.querySelector('img[src*="product"]')?.src ||
        document.querySelector('img')?.src || '';

      var button = document.createElement('button');
      button.innerText = "Ajouter sur AfrikZone";
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
    })();
    true;
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setSelectedProduct({ ...data, site: siteName });
      setModalVisible(true);
    } catch (error) {
      console.log('Erreur WebView onMessage:', error);
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
        injectedJavaScript={injectedScript}
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
          console.log('Ajout au panier :', product);
          await addToCart(product);
        }}
      />
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
});
