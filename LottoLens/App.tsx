/**
 * App.tsx — Root component for LottoLens.
 *
 * Sets up React Navigation with 5 screens:
 *  Home → Camera → Review → Result
 *  Home → History → Result (re-check)
 *
 * Supports multi-game lottery tickets (A, B, C, etc.)
 * Supports Portuguese (default) and English via I18nProvider.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from './i18n';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import ReviewScreen from './screens/ReviewScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';

import type { GameEntry } from './utils/parser';

/** Type definitions for navigation params */
export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Review: { imageUri: string };
  Result: { games: GameEntry[]; contest: string; date: string };
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const headerStyle = {
  headerStyle: { backgroundColor: '#16213e' },
  headerTintColor: '#e0e0e0',
  headerTitleStyle: { fontWeight: '700' as const },
};

export default function App() {
  return (
    <I18nProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              ...headerStyle,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </I18nProvider>
  );
}
