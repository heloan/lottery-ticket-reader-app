/**
 * ReviewScreen — Runs OCR on the captured image, extracts multi-game
 * ticket data, and lets the user review/correct each game before confirming.
 *
 * Flow:
 *  1. Receive image URI from CameraScreen
 *  2. Run tesseract.js OCR on the image
 *  3. Parse multi-game text using parser utility
 *  4. Display editable cards for each game (A, B, C…)
 *  5. Allow add/remove numbers, remove games, add games
 *  6. On confirm → validate all → navigate to Result
 */
import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File as ExpoFile } from 'expo-file-system';
import OcrWebView from '../components/OcrWebView';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { parseTicketText } from '../utils/parser';
import type { GameEntry } from '../utils/parser';
import { validateNumbers } from '../utils/checker';
import { useI18n } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

/** Editable game: numbers stored as strings for text input */
interface EditableGame {
  game: string;
  numbers: string[];
}

export default function ReviewScreen({ route, navigation }: Props) {
  const { imageUri } = route.params;
  const { t } = useI18n();

  // Set translated header title
  useLayoutEffect(() => {
    navigation.setOptions({ title: t('nav_review') });
  }, [navigation, t]);

  const [games, setGames] = useState<EditableGame[]>([]);
  const [contest, setContest] = useState('');
  const [date, setDate] = useState('');
  const [rawText, setRawText] = useState('');

  const [ocrLoading, setOcrLoading] = useState(true);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  // Read image as base64, then let the OcrWebView process it
  useEffect(() => {
    loadImageBase64();
  }, []);

  const loadImageBase64 = async () => {
    try {
      // SDK 54: use new File API to read image as ArrayBuffer, then convert to base64
      const file = new ExpoFile(imageUri);
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      setBase64Image(b64);
    } catch (err) {
      console.warn('Failed to read image:', err);
      setOcrLoading(false);
      setOcrError(
        t('review_image_failed')
      );
      setGames([{ game: 'A', numbers: ['', '', '', '', '', ''] }]);
    }
  };

  // Called by OcrWebView when OCR completes
  const handleOcrResult = (text: string) => {
    const parsed = parseTicketText(text);
    setRawText(parsed.rawText);
    setContest(parsed.contest);
    setDate(parsed.date);

    if (parsed.games.length > 0) {
      setGames(
        parsed.games.map((g) => ({
          game: g.game,
          numbers: g.numbers.map((n) => String(n).padStart(2, '0')),
        }))
      );
    } else {
      setGames([{ game: 'A', numbers: ['', '', '', '', '', ''] }]);
      setOcrError(
        t('review_no_games')
      );
    }
    setOcrLoading(false);
  };

  // Called by OcrWebView on error
  const handleOcrError = (error: string) => {
    console.warn('OCR Error:', error);
    setOcrError(
      t('review_ocr_failed')
    );
    setGames([{ game: 'A', numbers: ['', '', '', '', '', ''] }]);
    setOcrLoading(false);
  };

  // --- Game editing helpers ---

  const updateNumber = (gameIdx: number, numIdx: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 2);
    setGames((prev) => {
      const updated = [...prev];
      const nums = [...updated[gameIdx].numbers];
      nums[numIdx] = cleaned;
      updated[gameIdx] = { ...updated[gameIdx], numbers: nums };
      return updated;
    });
  };

  const addNumberToGame = (gameIdx: number) => {
    setGames((prev) => {
      const updated = [...prev];
      if (updated[gameIdx].numbers.length >= 15) {
        Alert.alert(t('review_limit'), t('review_limit_msg'));
        return prev;
      }
      const nums = [...updated[gameIdx].numbers, ''];
      updated[gameIdx] = { ...updated[gameIdx], numbers: nums };
      return updated;
    });
  };

  const removeNumberFromGame = (gameIdx: number, numIdx: number) => {
    setGames((prev) => {
      const updated = [...prev];
      if (updated[gameIdx].numbers.length <= 6) {
        Alert.alert(t('review_minimum'), t('review_minimum_msg'));
        return prev;
      }
      const nums = updated[gameIdx].numbers.filter((_, i) => i !== numIdx);
      updated[gameIdx] = { ...updated[gameIdx], numbers: nums };
      return updated;
    });
  };

  const removeGame = (gameIdx: number) => {
    if (games.length <= 1) {
      Alert.alert(t('review_cannot_remove'), t('review_cannot_remove_msg'));
      return;
    }
    Alert.alert(t('review_remove_game'), t('review_remove_game_msg', { letter: games[gameIdx].game }), [
      { text: t('history_clear_cancel'), style: 'cancel' },
      {
        text: t('review_remove_game'),
        style: 'destructive',
        onPress: () =>
          setGames((prev) => prev.filter((_, i) => i !== gameIdx)),
      },
    ]);
  };

  const addGame = () => {
    const nextLetter = String.fromCharCode(
      65 + games.length // A=65
    );
    setGames((prev) => [
      ...prev,
      { game: nextLetter, numbers: ['', '', '', '', '', ''] },
    ]);
  };

  // --- Validation & confirm ---

  const handleConfirm = () => {
    if (!contest.trim()) {
      Alert.alert(t('review_missing_contest'), t('review_missing_contest_msg'));
      return;
    }

    // Validate each game
    const validatedGames: GameEntry[] = [];
    for (let i = 0; i < games.length; i++) {
      const g = games[i];
      const parsed = g.numbers
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));

      const validation = validateNumbers(parsed, t as any);
      if (!validation.valid) {
        Alert.alert(
          t('review_game_invalid', { letter: g.game }),
          validation.error || t('review_check_numbers')
        );
        return;
      }
      validatedGames.push({ game: g.game, numbers: parsed });
    }

    navigation.navigate('Result', {
      games: validatedGames,
      contest: contest.trim(),
      date: date.trim(),
    });
  };

  // --- Loading state ---
  if (ocrLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#5588cc" />
        <Text style={styles.loadingText}>{t('review_loading')}</Text>
        <Text style={styles.loadingHint}>
          {t('review_loading_hint')}
        </Text>
        {/* Hidden WebView that performs the actual OCR */}
        {base64Image && (
          <OcrWebView
            base64Image={base64Image}
            onResult={handleOcrResult}
            onError={handleOcrError}
          />
        )}
      </SafeAreaView>
    );
  }

  // --- Main UI ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t('review_title')}</Text>
          <Text style={styles.subtitle}>
            {t(games.length !== 1 ? 'review_subtitle_other' : 'review_subtitle_one', { count: games.length })}
          </Text>

          {ocrError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{ocrError}</Text>
            </View>
          )}

          {/* Contest & Date */}
          <View style={styles.metaRow}>
            <View style={styles.metaField}>
              <Text style={styles.metaLabel}>{t('review_contest')}</Text>
              <TextInput
                style={styles.metaInput}
                value={contest}
                onChangeText={(v) => setContest(v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                placeholder={t('review_contest_placeholder')}
                placeholderTextColor="#555"
              />
            </View>
            <View style={styles.metaField}>
              <Text style={styles.metaLabel}>{t('review_date')}</Text>
              <TextInput
                style={styles.metaInput}
                value={date}
                onChangeText={setDate}
                placeholder={t('review_date_placeholder')}
                placeholderTextColor="#555"
              />
            </View>
          </View>

          {/* Game cards */}
          {games.map((game, gIdx) => (
            <View key={gIdx} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <View style={styles.gameBadge}>
                  <Text style={styles.gameBadgeText}>{game.game}</Text>
                </View>
                <Text style={styles.gameTitle}>
                  {t('review_game_title', { letter: game.game, count: game.numbers.length })}
                </Text>
                <TouchableOpacity
                  onPress={() => removeGame(gIdx)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.removeGameText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.numbersGrid}>
                {game.numbers.map((num, nIdx) => (
                  <View key={nIdx} style={styles.numberCell}>
                    <TextInput
                      style={styles.numberInput}
                      value={num}
                      onChangeText={(v) => updateNumber(gIdx, nIdx, v)}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder={`#${nIdx + 1}`}
                      placeholderTextColor="#555"
                      textAlign="center"
                    />
                    {game.numbers.length > 6 && (
                      <TouchableOpacity
                        style={styles.removeNumBtn}
                        onPress={() => removeNumberFromGame(gIdx, nIdx)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={styles.removeNumText}>−</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Add number button */}
                {game.numbers.length < 15 && (
                  <TouchableOpacity
                    style={styles.addNumBtn}
                    onPress={() => addNumberToGame(gIdx)}
                  >
                    <Text style={styles.addNumText}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Add a new game */}
          <TouchableOpacity style={styles.addGameBtn} onPress={addGame}>
            <Text style={styles.addGameText}>{t('review_add_game')}</Text>
          </TouchableOpacity>

          {/* Confirm */}
          <TouchableOpacity
            style={styles.confirmBtn}
            activeOpacity={0.8}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>{t('review_confirm')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#e0e0e0',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  loadingHint: {
    color: '#666',
    fontSize: 13,
    marginTop: 8,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#e0e0e0',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 80, 80, 0.15)',
    borderColor: '#ff5050',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff8888',
    fontSize: 14,
  },

  // Meta fields (contest & date)
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metaField: {
    flex: 1,
  },
  metaLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  metaInput: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
  },

  // Game card
  gameCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gameBadgeText: {
    color: '#5588cc',
    fontSize: 16,
    fontWeight: '900',
  },
  gameTitle: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  removeGameText: {
    color: '#ff6666',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 8,
  },

  // Numbers grid
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  numberCell: {
    position: 'relative',
  },
  numberInput: {
    width: 52,
    height: 48,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
  },
  removeNumBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeNumText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  addNumBtn: {
    width: 52,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNumText: {
    color: '#5588cc',
    fontSize: 24,
    fontWeight: '600',
  },

  // Add game
  addGameBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0f3460',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 8,
  },
  addGameText: {
    color: '#5588cc',
    fontSize: 16,
    fontWeight: '600',
  },

  // Confirm
  confirmBtn: {
    backgroundColor: '#0f3460',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
