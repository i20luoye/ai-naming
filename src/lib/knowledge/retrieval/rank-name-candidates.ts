import type { ClassicQuoteCard, HanziKnowledgeCard } from '../schema';

export interface RankedNameCandidate {
  givenName: string;
  chars: HanziKnowledgeCard[];
  quote?: ClassicQuoteCard;
  score: number;
  reasons: string[];
}

export function rankNameCandidates(
  chars: HanziKnowledgeCard[],
  quotes: ClassicQuoteCard[],
  limit = 20,
): RankedNameCandidate[] {
  const candidates: RankedNameCandidate[] = [];

  for (const first of chars) {
    for (const second of chars) {
      if (first.char === second.char) continue;
      const givenName = first.char + second.char;
      const quote = quotes.find((item) => item.usableChars.includes(first.char) || item.usableChars.includes(second.char));
      const sourceBonus = quote ? 10 : 0;
      const riskPenalty = first.riskTags.length + second.riskTags.length;

      candidates.push({
        givenName,
        chars: [first, second],
        quote,
        score: 70 + sourceBonus - riskPenalty,
        reasons: [
          `${first.char}/${second.char}匹配候选字池`,
          quote ? `可参考${quote.source.title}` : '无匹配出处，仅作字义候选',
        ],
      });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
