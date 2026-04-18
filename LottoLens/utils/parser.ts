/**
 * parser.ts — Extracts multi-game lottery ticket data from raw OCR text.
 *
 * Handles receipts with multiple games labelled A, B, C, etc.
 * Each game line: "A 10 12 13 37 50 58 60"
 *
 * Also extracts contest number and date.
 */

/** A single game entry from the ticket */
export interface GameEntry {
  game: string; // letter label: A, B, C…
  numbers: number[];
}

/** Full parsed ticket data */
export interface ParsedTicket {
  games: GameEntry[];
  contest: string;
  date: string;
  rawText: string;
}

/**
 * Common OCR character corrections.
 * OCR often confuses similar-looking chars.
 */
function fixOcrErrors(text: string): string {
  return text
    .replace(/[Oo]/g, '0')   // O → 0 in numeric contexts (handled per-number)
    .replace(/[Il|]/g, '1')  // I, l, | → 1
    .replace(/[Ss]/g, '5')   // S → 5
    .replace(/[Bb]/g, '8')   // B → 8 in numeric contexts
    .replace(/[Zz]/g, '2');  // Z → 2
}

/**
 * Cleans a raw number string from OCR: applies fixes and validates range 1–60.
 * Returns the number if valid, or null.
 */
function cleanNumber(raw: string): number | null {
  // Only apply OCR fixes to things that look like they should be digits
  let cleaned = raw.trim();
  if (/^[A-Za-z0-9|]+$/.test(cleaned)) {
    cleaned = fixOcrErrors(cleaned);
  }
  const num = parseInt(cleaned, 10);
  if (isNaN(num) || num < 1 || num > 60) return null;
  return num;
}

/**
 * Extracts multiple game entries from OCR text.
 *
 * Matches lines starting with a single letter (A–Z) followed by numbers.
 * Pattern: "A 10 12 13 37 50 58 60"
 */
function extractGames(text: string): GameEntry[] {
  const games: GameEntry[] = [];

  // Normalize: collapse multiple spaces/tabs, split by newlines
  const lines = text
    .replace(/\t/g, ' ')
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // Match a line starting with a single letter followed by numbers
    // Allow variations: "A 10 12 13" or "A: 10 12 13" or "A-10 12 13"
    const match = line.match(/^([A-Z])\s*[:\-]?\s+([\d\s]+)/i);
    if (!match) continue;

    const gameLetter = match[1].toUpperCase();
    const rawNumbers = match[2].trim().split(/\s+/);

    const numbers: number[] = [];
    for (const raw of rawNumbers) {
      const num = cleanNumber(raw);
      if (num !== null && !numbers.includes(num)) {
        numbers.push(num);
      }
    }

    // Must have at least 6 numbers to be a valid game
    if (numbers.length >= 6) {
      games.push({ game: gameLetter, numbers });
    }
  }

  return games;
}

/**
 * Fallback: if no letter-labelled games found, try to extract
 * bare number sequences (6+ numbers per line) and label them automatically.
 */
function extractFallbackGames(text: string): GameEntry[] {
  const games: GameEntry[] = [];
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  let label = 65; // ASCII 'A'

  for (const line of lines) {
    // Find lines that are just sequences of 2-digit numbers
    const rawNumbers = line.match(/\b\d{1,2}\b/g);
    if (!rawNumbers || rawNumbers.length < 6) continue;

    const numbers: number[] = [];
    for (const raw of rawNumbers) {
      const num = cleanNumber(raw);
      if (num !== null && !numbers.includes(num)) {
        numbers.push(num);
      }
    }

    if (numbers.length >= 6) {
      games.push({
        game: String.fromCharCode(label),
        numbers,
      });
      label++;
    }
  }

  return games;
}

/**
 * Extracts the contest/draw number from OCR text.
 */
function extractContest(text: string): string {
  const patterns = [
    /concurso\s*[:\-]?\s*(\d{4,5})/i,
    /contest\s*[:\-]?\s*(\d{4,5})/i,
    /conc[.\s]*(\d{4,5})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return '';
}

/**
 * Extracts a date in dd/mm/yyyy format from OCR text.
 */
function extractDate(text: string): string {
  const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : '';
}

/**
 * Main parse function — takes raw OCR text and returns structured
 * multi-game ticket data.
 */
export function parseTicketText(text: string): ParsedTicket {
  // Try letter-labelled games first
  let games = extractGames(text);

  // Fallback: if no labelled games, try bare number lines
  if (games.length === 0) {
    games = extractFallbackGames(text);
  }

  return {
    games,
    contest: extractContest(text),
    date: extractDate(text),
    rawText: text,
  };
}
