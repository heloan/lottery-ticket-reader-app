/**
 * ResultScreen — Fetches the official Mega-Sena result and compares
 * each game individually. Shows per-game match count with highlighted numbers.
 *
 * Flow:
 *  1. Receive games[], contest, date from ReviewScreen
 *  2. Fetch official result from API
 *  3. Compute matches per game using checkAllGames
 *  4. Display per-game result cards
 *  5. Save entire ticket to AsyncStorage history
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { fetchMegaSenaResult } from '../services/api';
import { checkAllGames } from '../utils/checker';
import type { GameResult } from '../utils/checker';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const HISTORY_KEY = '@lottolens_history';

export default function ResultScreen({ route, navigation }: Props) {
  const { games, contest, date } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [bestMatch, setBestMatch] = useState(0);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchMegaSenaResult(contest);
      const drawn = result.dezenas.map((d: string) => parseInt(d, 10));
      setDrawnNumbers(drawn);

      // Check all games at once
      const results = checkAllGames(games, drawn);
      setGameResults(results);

      // Best single-game match count
      const best = Math.max(...results.map((r) => r.matchCount), 0);
      setBestMatch(best);

      // Save to history
      await saveToHistory(drawn, results, best);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results.');
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (
    drawn: number[],
    results: GameResult[],
    best: number
  ) => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];

      const entry = {
        id: Date.now().toString(),
        games: games.map((g) => ({ game: g.game, numbers: g.numbers })),
        drawnNumbers: drawn,
        gameResults: results.map((r) => ({
          game: r.game,
          matches: r.matches,
          matchCount: r.matchCount,
        })),
        bestMatch: best,
        contest,
        date,
        scannedAt: new Date().toISOString(),
      };

      history.unshift(entry);
      if (history.length > 50) history.length = 50;
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.warn('Failed to save history:', err);
    }
  };

  // --- Number bubble ---
  const NumberBubble = ({
    num,
    isMatch,
    variant,
  }: {
    num: number;
    isMatch: boolean;
    variant: 'user' | 'drawn';
  }) => (
    <View
      style={[
        styles.bubble,
        isMatch && styles.bubbleMatch,
        !isMatch && variant === 'user' && styles.bubbleUser,
        !isMatch && variant === 'drawn' && styles.bubbleDrawn,
      ]}
    >
      <Text
        style={[styles.bubbleText, isMatch && styles.bubbleTextMatch]}
      >
        {String(num).padStart(2, '0')}
      </Text>
    </View>
  );

  // --- Loading ---
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#5588cc" />
        <Text style={styles.loadingText}>Fetching results...</Text>
      </SafeAreaView>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchResult}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- Result ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero summary */}
        <View style={styles.heroSection}>
          <Text style={styles.heroNumber}>{bestMatch}</Text>
          <Text style={styles.heroLabel}>
            Best Match ({games.length} game{games.length !== 1 ? 's' : ''})
          </Text>
          <Text style={styles.contestInfo}>
            Contest {contest} {date ? `• ${date}` : ''}
          </Text>
        </View>

        {/* Drawn numbers */}
        <Text style={styles.sectionLabel}>Drawn Numbers</Text>
        <View style={styles.bubblesRow}>
          {drawnNumbers.map((num) => (
            <NumberBubble
              key={`drawn-${num}`}
              num={num}
              isMatch={false}
              variant="drawn"
            />
          ))}
        </View>

        {/* Per-game results */}
        <Text style={styles.sectionLabel}>Your Games</Text>
        {gameResults.map((gr) => (
          <View key={gr.game} style={styles.gameCard}>
            <View style={styles.gameHeader}>
              <View style={styles.gameBadge}>
                <Text style={styles.gameBadgeText}>{gr.game}</Text>
              </View>
              <Text style={styles.gameTitle}>Game {gr.game}</Text>
              <View
                style={[
                  styles.matchBadge,
                  gr.matchCount > 0 ? styles.matchBadgeGreen : styles.matchBadgeGray,
                ]}
              >
                <Text
                  style={[
                    styles.matchBadgeText,
                    gr.matchCount === 0 && { color: '#888' },
                  ]}
                >
                  {gr.matchCount} {gr.matchCount === 1 ? 'match' : 'matches'}
                </Text>
              </View>
            </View>

            <View style={styles.bubblesRow}>
              {gr.userNumbers.map((num) => (
                <NumberBubble
                  key={`${gr.game}-${num}`}
                  num={num}
                  isMatch={gr.matches.includes(num)}
                  variant="user"
                />
              ))}
            </View>
          </View>
        ))}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
            <Text style={styles.legendText}>Match</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0f3460' }]} />
            <Text style={styles.legendText}>Your number</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#444' }]} />
            <Text style={styles.legendText}>Drawn</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.scanAgainText}>Scan Another Ticket</Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 16,
    marginTop: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff8888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryBtn: {
    backgroundColor: '#0f3460',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  homeBtn: {
    paddingVertical: 12,
  },
  homeBtnText: {
    color: '#5588cc',
    fontSize: 15,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 10,
  },
  heroNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#2ecc71',
  },
  heroLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2ecc71',
    marginTop: -2,
  },
  contestInfo: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  sectionLabel: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bubblesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  bubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleMatch: {
    backgroundColor: '#2ecc71',
  },
  bubbleUser: {
    backgroundColor: '#0f3460',
  },
  bubbleDrawn: {
    backgroundColor: '#333',
  },
  bubbleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bubbleTextMatch: {
    color: '#fff',
    fontWeight: '900',
  },

  // Game result card
  gameCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gameBadgeText: {
    color: '#5588cc',
    fontSize: 15,
    fontWeight: '900',
  },
  gameTitle: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchBadgeGreen: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  matchBadgeGray: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  matchBadgeText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '700',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: '#888',
    fontSize: 12,
  },
  scanAgainBtn: {
    backgroundColor: '#0f3460',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
