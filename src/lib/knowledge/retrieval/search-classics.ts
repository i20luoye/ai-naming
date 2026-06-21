import { CLASSIC_QUOTES } from '../classics/poetry-sample';
import type { ClassicQuoteCard } from '../schema';

export interface SearchClassicsInput {
  sourcePreferences?: string[];
  styleTags?: string[];
  usableChars?: string[];
  limit?: number;
}

export function searchClassics(input: SearchClassicsInput): ClassicQuoteCard[] {
  const sources = normalizePreferences(input.sourcePreferences);
  const styles = normalizePreferences(input.styleTags);
  const usable = new Set(input.usableChars || []);

  return CLASSIC_QUOTES
    .filter((quote) => sources.length === 0 || sources.some((source) => sourceMatches(quote, source)))
    .filter((quote) => styles.length === 0 || quote.styleTags.some((tag) => styles.includes(tag)))
    .filter((quote) => usable.size === 0 || quote.usableChars.some((char) => usable.has(char)))
    .slice(0, input.limit || 8);
}

function normalizePreferences(value?: string[]): string[] {
  return (value || []).filter((item) => item && item !== '不限');
}

function sourceMatches(quote: ClassicQuoteCard, preference: string): boolean {
  if (quote.source.title.includes(preference) || quote.source.id.includes(preference)) {
    return true;
  }
  if (preference === '唐诗') return quote.source.dynasty === '唐';
  if (preference === '宋词') return quote.source.dynasty === '宋';
  if (preference === '诗经') return quote.source.id === 'shijing' || quote.source.title.includes('诗经');
  if (preference === '楚辞') return quote.source.id === 'chuci' || quote.source.title.includes('楚辞');
  return false;
}
