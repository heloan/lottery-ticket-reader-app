/**
 * HistoryScreen — Displays all previously scanned multi-game tickets
 * stored in AsyncStorage. Users can tap an entry to re-check results.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

interface GameResultSummary {
  game: string;
  matches: number[];
  matchCount: number;
}

interface HistoryEntry {
  id: string;
  games: { game: string; numbers: number[] }[];
  drawnNumbers: number[];
  gameResults: GameResultSummary[];
  bestMatch: number;
  contest: string;
  date: string;
  scannedAt: string;
}

const HISTORY_KEY = '@lottolens_history';

export default function HistoryScreen({ navigation }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      setHistory(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(HISTORY_KEY);
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleRecheck = (entry: HistoryEntry) => {
    navigation.navigate('Result', {
      games: entry.games,
      contest: entry.contest,
      date: entry.date,
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleRecheck(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.contestText}>Contest {item.contest}</Text>
        <View
          style={[
            styles.matchBadge,
            item.bestMatch > 0
              ? styles.matchBadgeGreen
              : styles.matchBadgeGray,
          ]}
        >
          <Text style={styles.matchBadgeText}>
            Best: {item.bestMatch}
          </Text>
        </View>
      </View>

      {/* Summary per game */}
      <View style={styles.gamesPreview}>
        {(item.gameResults || []).map((gr, i) => (
          <View key={i} style={styles.gamePreviewRow}>
            <View style={styles.miniGameBadge}>
              <Text style={styles.miniGameBadgeText}>{gr.game}</Text>
            </View>
            <Text style={styles.gamePreviewText}>
              {gr.matchCount} {gr.matchCount === 1 ? 'match' : 'matches'}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.dateText}>
        {item.games.length} game{item.games.length !== 1 ? 's' : ''} •{' '}
        {formatDate(item.scannedAt)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {history.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            {history.length} {history.length === 1 ? 'Ticket' : 'Tickets'}
          </Text>
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {history.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptyHint}>
            Scan a lottery ticket to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  clearText: {
    color: '#ff6666',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contestText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchBadgeText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '700',
  },

  // Per-game preview
  gamesPreview: {
    gap: 6,
    marginBottom: 10,
  },
  gamePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniGameBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniGameBadgeText: {
    color: '#5588cc',
    fontSize: 12,
    fontWeight: '900',
  },
  gamePreviewText: {
    color: '#999',
    fontSize: 13,
  },

  dateText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#555',
    fontSize: 14,
    marginTop: 8,
  },
});
