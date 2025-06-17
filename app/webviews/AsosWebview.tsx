import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../../context/CartContext';
import ProductModal from '../../components/ProductModal';

export default function AsosWebview({ url }: { url: string }) {
  const { addToCart, cartItems } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const siteName = new URL(url).hostname.replace('www.', '');

  const injectedAsosScript = `
    window.addEventListener('load', function () {
      try {
        const title = document.querySelector('h1')?.innerText?.trim() || document.title;

        let price = '';
        const priceEl = document.querySelector('[data-testid="product-price"]') || document.querySelector('.product-price') || document.querySelector('[class*="price"]');
        if (priceEl) {
          const raw = priceEl.textContent?.replace(/EUR|€/g, '').trim();
          const match = raw?.match(/[0-9]+[.,][0-9]{2}/);
          if (match) price = match[0];
        }

        let image = '';
        const allImgs = document.querySelectorAll('img');
        for (const img of allImgs) {
          const src = img.src || '';
          if (src.includes('asos') && src.includes('image')) {
            image = src;
            break;
          }
        }

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
        button.onclick = function () {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            url: window.location.href,
            title,
            price,
            image
          }));
        };
        document.body.appendChild(button);
      } catch (e) {
        console.log('❌ Erreur JS Asos:', e);
      }
    });
    true;
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setSelectedProduct({ ...data, site: siteName });
      setModalVisible(true);
    } catch (error) {
      console.log('❌ Erreur parsing WebView Asos:', error);
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
        injectedJavaScript={injectedAsosScript}
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
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
