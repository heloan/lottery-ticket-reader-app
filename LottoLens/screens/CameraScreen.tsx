/**
 * CameraScreen — Captures a photo of the lottery ticket.
 *
 * Flow:
 *  1. Request camera permission
 *  2. Show live camera preview
 *  3. User takes a photo
 *  4. Show photo preview with Confirm / Retake buttons
 *  5. On confirm → navigate to Review with the image URI
 */
import React, { useState, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useI18n } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [taking, setTaking] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Set translated header title
  useLayoutEffect(() => {
    navigation.setOptions({ title: t('nav_scan_ticket') });
  }, [navigation, t]);

  // Permission still loading
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5588cc" />
      </View>
    );
  }

  // Permission not granted — show request button
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permText}>
          {t('camera_permission')}
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>{t('camera_grant')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Take a photo
  const handleCapture = async () => {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo) {
        setPhotoUri(photo.uri);
      }
    } catch (err) {
      Alert.alert('Error', t('camera_error'));
    } finally {
      setTaking(false);
    }
  };

  // Preview mode — show captured image
  if (photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.previewTitle}>{t('camera_preview')}</Text>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => setPhotoUri(null)}
          >
            <Text style={styles.retakeBtnText}>{t('camera_retake')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() =>
              navigation.navigate('Review', { imageUri: photoUri })
            }
          >
            <Text style={styles.confirmBtnText}>{t('camera_confirm')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Camera mode — overlay positioned absolutely on top of CameraView
  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.overlay}>
        <Text style={styles.hint}>
          {t('camera_hint')}
        </Text>
        <View style={styles.frame} />
        <TouchableOpacity
          style={[styles.captureBtn, taking && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={taking}
        >
          {taking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.captureBtnText}>📸</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  grantBtn: {
    backgroundColor: '#0f3460',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  grantBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  hint: {
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  frame: {
    width: '85%',
    height: '55%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureBtnText: {
    fontSize: 30,
  },
  previewTitle: {
    color: '#e0e0e0',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  preview: {
    flex: 1,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#555',
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#0f3460',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
