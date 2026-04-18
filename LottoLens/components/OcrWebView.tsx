/**
 * OcrWebView.tsx — Runs tesseract.js OCR inside a hidden WebView.
 *
 * React Native doesn't have Web Workers, so tesseract.js can't run directly.
 * This component creates a hidden WebView that loads tesseract.js from CDN,
 * receives the image as base64, performs OCR, and sends the result back
 * via postMessage.
 *
 * Usage:
 *   <OcrWebView
 *     base64Image={base64String}
 *     onResult={(text) => { ... }}
 *     onError={(err) => { ... }}
 *   />
 */
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface OcrWebViewProps {
  /** Base64-encoded image data (without the data:image prefix) */
  base64Image: string;
  /** Called with the extracted text when OCR completes */
  onResult: (text: string) => void;
  /** Called if OCR fails */
  onError: (error: string) => void;
}

export default function OcrWebView({
  base64Image,
  onResult,
  onError,
}: OcrWebViewProps) {
  const webViewRef = useRef<WebView>(null);

  // HTML page that runs tesseract.js OCR
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
</head>
<body>
<script>
  async function runOCR(base64) {
    try {
      const imageUrl = 'data:image/jpeg;base64,' + base64;
      const result = await Tesseract.recognize(imageUrl, 'por', {
        logger: () => {},
      });
      window.ReactNativeWebView.postMessage(JSON.stringify({
        success: true,
        text: result.data.text,
      }));
    } catch (err) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        success: false,
        error: err.message || 'OCR failed',
      }));
    }
  }

  // Wait for the base64 image to be injected
  window.addEventListener('message', function(event) {
    runOCR(event.data);
  });

  // Signal that the WebView is ready
  window.ReactNativeWebView.postMessage(JSON.stringify({ ready: true }));
</script>
</body>
</html>
  `.trim();

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.ready) {
        // WebView is loaded — inject the base64 image
        webViewRef.current?.injectJavaScript(
          `runOCR(${JSON.stringify(base64Image)}); true;`
        );
        return;
      }

      if (data.success) {
        onResult(data.text);
      } else {
        onError(data.error || 'OCR failed');
      }
    } catch {
      onError('Failed to parse OCR response');
    }
  };

  return (
    <View style={styles.hidden}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        onMessage={handleMessage}
        onError={() => onError('WebView failed to load')}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    overflow: 'hidden',
    position: 'absolute',
  },
  webview: {
    width: 1,
    height: 1,
  },
});
