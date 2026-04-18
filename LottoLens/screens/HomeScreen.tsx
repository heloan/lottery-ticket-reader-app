/**
 * HomeScreen — Landing screen with two main actions and language toggle.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useI18n } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { t, locale, setLocale } = useI18n();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Language toggle */}
      <TouchableOpacity
        style={styles.langToggle}
        onPress={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
        activeOpacity={0.7}
      >
        <Text style={styles.langText}>
          {locale === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.logo}>🎱</Text>
        <Text style={styles.title}>LottoLens</Text>
        <Text style={styles.subtitle}>{t('home_subtitle')}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.primaryButtonText}>{t('home_scan')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.secondaryButtonText}>{t('home_history')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  langToggle: {
    position: 'absolute',
    top: 56,
    right: 24,
    backgroundColor: '#16213e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  langText: {
    color: '#5588cc',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#e0e0e0',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#8888aa',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actions: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0f3460',
  },
  secondaryButtonText: {
    color: '#5588cc',
    fontSize: 18,
    fontWeight: '600',
  },
});
