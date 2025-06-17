import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function DefaultWebview({ url }: { url: string }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ textAlign: 'center', padding: 10 }}>
        ⚠️ Ce site n’est pas encore supporté automatiquement.
      </Text>
      <WebView
        source={{ uri: url }}
        javaScriptEnabled
        startInLoadingState
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}
