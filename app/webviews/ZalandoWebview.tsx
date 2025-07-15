import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCart } from '../../context/CartContext';
import ProductModal from '../../components/ProductModal';

export default function ZalandoWebview() {
  const { url } = useLocalSearchParams();
  const { addToCart, cartItems } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const webviewRef = useRef<any>(null);

  if (!url || typeof url !== 'string') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: 20 }}>URL invalide ou manquante</Text>
      </SafeAreaView>
    );
  }

  const siteName = new URL(url).hostname.replace('www.', '');

  const injectedZalandoScript = `
    (function() {
      try {
        const title = document.querySelector('h1[data-testid="product-title"]')?.innerText?.trim()
                    || document.title;

        let price = '';
        const allSpans = document.querySelectorAll('span, p');
        for (const el of allSpans) {
          const txt = el.textContent?.trim();
          if (txt && txt.match(/[0-9]+[.,][0-9]{2}/)) {
            price = txt.match(/[0-9]+[.,][0-9]{2}/)[0];
            break;
          }
        }

        const image =
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
        console.log('❌ Erreur JS Zalando:', e);
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

  const handleBackPress = () => {
    if (canGoBack && webviewRef.current) {
      webviewRef.current.goBack();
    } else {
      router.replace('/home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handleBackPress} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.iconBtn}>
            <Ionicons name="close" size={22} />
          </TouchableOpacity>
        </View>

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
        ref={webviewRef}
        source={{ uri: url }}
        injectedJavaScript={injectedZalandoScript}
        onMessage={handleMessage}
        javaScriptEnabled
        startInLoadingState
        style={{ flex: 1 }}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
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
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  iconBtn: { padding: 6 },
  urlText: {
    flex: 1,
    fontSize: 13,
    color: 'blue',
    marginHorizontal: 8,
    textAlign: 'center',
  },
  cartWrapper: {
    position: 'relative',
    padding: 6,
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
