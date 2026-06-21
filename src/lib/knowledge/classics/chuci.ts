import type { ClassicQuoteCard } from '../schema';
import { CHUCI_SOURCE } from '../sources';

export const CHUCI_QUOTES: ClassicQuoteCard[] = [
  {
    id: 'chuci-zhi',
    quote: '扈江离与辟芷兮，纫秋兰以为佩',
    source: { ...CHUCI_SOURCE, title: '《楚辞·离骚》', chapter: '离骚' },
    usableChars: ['芷', '兰'],
    styleTags: ['诗意', '清雅', '典雅'],
    note: '香草意象，适合清雅、文气方向。',
  },
  {
    id: 'chuci-ruomu',
    quote: '折若木以拂日兮',
    source: { ...CHUCI_SOURCE, title: '《楚辞·离骚》', chapter: '离骚' },
    usableChars: ['若', '木'],
    styleTags: ['诗意', '大气'],
    note: '若字可作柔和又有古意的起名用字。',
  },
];
