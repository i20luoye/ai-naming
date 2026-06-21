import type { ClassicQuoteCard } from '../schema';
import { SHIJING_SOURCE } from '../sources';

export const SHIJING_QUOTES: ClassicQuoteCard[] = [
  {
    id: 'shijing-qingyang',
    quote: '有美一人，清扬婉兮',
    source: { ...SHIJING_SOURCE, title: '《诗经·郑风·野有蔓草》', chapter: '郑风' },
    usableChars: ['清', '扬', '婉'],
    styleTags: ['清雅', '诗意', '温润'],
    note: '可取清、扬等字，表达清朗舒展的气质。',
  },
  {
    id: 'shijing-rugui',
    quote: '如月之恒，如日之升',
    source: { ...SHIJING_SOURCE, title: '《诗经·小雅·天保》', chapter: '小雅' },
    usableChars: ['如', '恒', '升'],
    styleTags: ['明朗', '大气'],
    note: '偏向开阔、上升的积极寓意。',
  },
  {
    id: 'shijing-tong',
    quote: '梧桐生矣，于彼朝阳',
    source: { ...SHIJING_SOURCE, title: '《诗经·大雅·卷阿》', chapter: '大雅' },
    usableChars: ['桐', '阳'],
    styleTags: ['自然', '大气', '明朗'],
    note: '可取桐字，强调挺秀与朝气。',
  },
];
