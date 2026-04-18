/**
 * api.ts — Service layer for fetching official Mega-Sena results.
 *
 * Uses the public Loterias Caixa API.
 */

const BASE_URL = 'https://loteriascaixa-api.herokuapp.com/api/megasena';

export interface MegaSenaResult {
  concurso: number;
  data: string;
  dezenas: string[];
  // Additional fields from API (not all used)
  [key: string]: unknown;
}

/**
 * Fetches the official result for a given Mega-Sena contest number.
 * Throws descriptive errors on network or API failures.
 */
export async function fetchMegaSenaResult(
  contest: string | number
): Promise<MegaSenaResult> {
  const url = `${BASE_URL}/${contest}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Contest ${contest} not found. It may not have been drawn yet.`
        );
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: MegaSenaResult = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
