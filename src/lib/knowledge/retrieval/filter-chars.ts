import { HANZI_SAMPLE } from '../characters/hanzi-sample';
import type { GenderFit, HanziKnowledgeCard } from '../schema';

export interface FilterCharsInput {
  xiYong: string[];
  gender?: string;
  styleTags?: string[];
  excludeChars?: string[] | string;
  riskTags?: string[];
  blockedRiskTags?: string[];
  limit?: number;
}

export function filterChars(input: FilterCharsInput): HanziKnowledgeCard[] {
  const xiYong = new Set(input.xiYong || []);
  const styles = normalizeList(input.styleTags);
  const exclude = new Set(normalizeList(input.excludeChars));
  const blockedRiskTags = new Set(input.blockedRiskTags || input.riskTags || ['negative', 'hard-to-read']);
  const gender = normalizeGender(input.gender);

  return HANZI_SAMPLE
    .filter((card) => xiYong.size === 0 || xiYong.has(card.wuxing))
    .filter((card) => !exclude.has(card.char))
    .filter((card) => !card.riskTags.some((tag) => blockedRiskTags.has(tag)))
    .filter((card) => !gender || card.genderFit.includes('neutral') || card.genderFit.includes(gender))
    .filter((card) => styles.length === 0 || card.styleTags.some((tag) => styles.includes(tag)))
    .slice(0, input.limit || 30);
}

function normalizeGender(gender?: string): GenderFit | undefined {
  if (gender === 'male' || gender === '男') return 'male';
  if (gender === 'female' || gender === '女') return 'female';
  return undefined;
}

function normalizeList(value?: string[] | string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(/[\s,，、/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
