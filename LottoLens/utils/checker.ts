/**
 * checker.ts — Compares user numbers against drawn numbers for multiple games.
 * Validates ticket data and computes per-game match results.
 * Accepts an optional translate function for localized validation errors.
 */

import type { GameEntry } from './parser';

/** Result for a single game */
export interface GameResult {
  game: string;
  userNumbers: number[];
  drawnNumbers: number[];
  matches: number[];
  matchCount: number;
}

/** Result for the entire ticket (all games) */
export interface TicketResult {
  games: GameResult[];
  drawnNumbers: number[];
  contest: string;
  date: string;
  totalMatches: number;
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

// Fallback English messages
const defaultT: TranslateFn = (key, params) => {
  const msgs: Record<string, string> = {
    validation_min_numbers: 'Each game must have at least 6 numbers.',
    validation_max_numbers: 'A game can have at most 15 numbers.',
    validation_range: `Each number must be between 1 and 60. Invalid: ${params?.n}`,
    validation_duplicates: 'Numbers must not have duplicates.',
  };
  return msgs[key] ?? key;
};

/**
 * Checks all games against the drawn numbers.
 */
export function checkAllGames(
  games: GameEntry[],
  drawnNumbers: number[]
): GameResult[] {
  return games.map((entry) => {
    const matches = entry.numbers.filter((n) => drawnNumbers.includes(n));
    return {
      game: entry.game,
      userNumbers: entry.numbers,
      drawnNumbers,
      matches,
      matchCount: matches.length,
    };
  });
}

/**
 * Validates that a set of numbers is valid for Mega-Sena.
 * Pass a t() function for localized error messages.
 */
export function validateNumbers(
  numbers: number[],
  t: TranslateFn = defaultT
): {
  valid: boolean;
  error?: string;
} {
  if (numbers.length < 6) {
    return { valid: false, error: t('validation_min_numbers') };
  }

  if (numbers.length > 15) {
    return { valid: false, error: t('validation_max_numbers') };
  }

  for (const n of numbers) {
    if (isNaN(n) || n < 1 || n > 60) {
      return {
        valid: false,
        error: t('validation_range', { n }),
      };
    }
  }

  const unique = new Set(numbers);
  if (unique.size !== numbers.length) {
    return { valid: false, error: t('validation_duplicates') };
  }

  return { valid: true };
}
