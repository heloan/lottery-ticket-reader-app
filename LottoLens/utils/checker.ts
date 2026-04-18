/**
 * checker.ts — Compares user numbers against drawn numbers for multiple games.
 * Validates ticket data and computes per-game match results.
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
  totalMatches: number; // best single-game match count
}

/**
 * Checks all games against the drawn numbers.
 * Returns per-game match info and overall best match.
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
 * Validates that a set of numbers is valid for Mega-Sena:
 *  - At least 6 numbers (can have up to 15 for "bolão")
 *  - Each between 1 and 60
 *  - No duplicates
 */
export function validateNumbers(numbers: number[]): {
  valid: boolean;
  error?: string;
} {
  if (numbers.length < 6) {
    return { valid: false, error: 'Each game must have at least 6 numbers.' };
  }

  if (numbers.length > 15) {
    return { valid: false, error: 'A game can have at most 15 numbers.' };
  }

  for (const n of numbers) {
    if (isNaN(n) || n < 1 || n > 60) {
      return {
        valid: false,
        error: `Each number must be between 1 and 60. Invalid: ${n}`,
      };
    }
  }

  const unique = new Set(numbers);
  if (unique.size !== numbers.length) {
    return { valid: false, error: 'Numbers must not have duplicates.' };
  }

  return { valid: true };
}
