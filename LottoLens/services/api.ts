/**
 * api.ts — Service layer for fetching official Mega-Sena results.
 *
 * Uses the public Loterias Caixa API.
 * Accepts an optional translate function for localized error messages.
 */

const BASE_URL = 'https://loteriascaixa-api.herokuapp.com/api/megasena';

export interface MegaSenaResult {
  concurso: number;
  data: string;
  dezenas: string[];
  [key: string]: unknown;
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

// Fallback translator that returns English messages
const defaultT: TranslateFn = (key, params) => {
  const msgs: Record<string, string> = {
    api_not_found: `Contest ${params?.contest} not found. It may not have been drawn yet.`,
    api_error: `API error: ${params?.status} ${params?.statusText}`,
    api_timeout: 'Request timed out. Please check your connection.',
  };
  return msgs[key] ?? key;
};

/**
 * Fetches the official result for a given Mega-Sena contest number.
 * Pass a t() function for localized error messages.
 */
export async function fetchMegaSenaResult(
  contest: string | number,
  t: TranslateFn = defaultT
): Promise<MegaSenaResult> {
  const url = `${BASE_URL}/${contest}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(t('api_not_found', { contest }));
      }
      throw new Error(
        t('api_error', { status: response.status, statusText: response.statusText })
      );
    }

    const data: MegaSenaResult = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(t('api_timeout'));
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
