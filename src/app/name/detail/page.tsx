'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  ArrowRight,
  Orbit,
  ChartNetwork,
  LayoutGrid,
  BookOpen,
  Music,
  Feather,
  Fingerprint,
  AlertTriangle,
  Lightbulb,
  Info,
  Copy,
  Heart,
  Gem,
  Leaf,
  Droplets,
  Flame,
  Mountain,
  Share2,
} from 'lucide-react';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import type { NameItem, BaziData } from '@/lib/storage';

/* ================================================================
   Constants & Helpers
   ================================================================ */

const WUXING_HEX: Record<string, string> = {
  '金': '#e8d09a', '木': '#81c784', '水': '#64b5f6', '火': '#d4726a', '土': '#d4c4a0',
};

const WUXING_RGB: Record<string, string> = {
  '金': '232,208,154', '木': '129,199,132', '水': '100,181,246', '火': '212,114,106', '土': '212,196,160',
};

const WUXING_ICON: Record<string, React.ReactNode> = {
  '金': <Gem size={10} />, '木': <Leaf size={10} />, '水': <Droplets size={10} />, '火': <Flame size={10} />, '土': <Mountain size={10} />,
};

const SHENG_MAP: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
const KE_MAP: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

type RelationType = 'sheng' | 'ke' | 'same' | 'beisheng' | 'neutral';

function getRelation(a: string, b: string): RelationType {
  if (a === b) return 'same';
  if (SHENG_MAP[a] === b) return 'sheng';
  if (KE_MAP[a] === b) return 'ke';
  if (SHENG_MAP[b] === a) return 'beisheng';
  return 'neutral';
}

const REL_LABELS: Record<RelationType, string> = {
  sheng: '生', ke: '克', same: '比和', beisheng: '被生', neutral: '泄',
};

const REL_COLORS: Record<RelationType, string> = {
  sheng: 'text-green-400', ke: 'text-red-400', same: 'text-ink-300', beisheng: 'text-green-400', neutral: 'text-ink-400',
};

const REL_SYMBOLS: Record<RelationType, string> = {
  sheng: '↑', ke: '✕', same: '≡', beisheng: '↑', neutral: '↓',
};

const SURNAME_WX: Record<string, string> = {
  '王': '土', '李': '木', '张': '火', '刘': '金', '陈': '土', '杨': '木', '黄': '土', '赵': '火',
  '周': '金', '吴': '木', '徐': '金', '孙': '水', '马': '火', '朱': '火', '胡': '土', '郭': '木',
  '何': '木', '林': '木', '罗': '火', '梁': '火',
};

const STROKE_MAP: Record<string, number> = {
  '张': 7, '王': 4, '李': 7, '刘': 6, '陈': 7, '杨': 7, '黄': 11, '赵': 9, '周': 8, '吴': 7,
  '徐': 10, '孙': 6, '马': 3, '朱': 6, '胡': 9, '郭': 10, '何': 7, '林': 8, '罗': 8, '梁': 11,
  '涵': 11, '泽': 8, '清': 11, '源': 13, '沁': 7, '兰': 5, '潆': 14, '月': 4, '澄': 15, '宁': 5,
  '梓': 11, '桐': 10, '栩': 10, '然': 12, '芷': 7, '萱': 12, '柯': 9, '远': 7, '荟': 9, '蔚': 14,
  '瑾': 15, '瑜': 13, '锦': 13, '瑞': 13, '钰': 10, '铭': 11, '钦': 9, '铮': 11, '书': 4, '晏': 10,
  '毓': 14, '辰': 7, '煜': 13, '昕': 8, '晖': 10, '煦': 13, '风': 4, '宇': 6, '坤': 8, '垣': 9,
  '培': 11, '均': 7, '平': 5, '如': 6,
};

const CHAR_WX_DATA: Record<string, { wx: string; pinyin: string; meaning: string; tone: number }> = {
  '涵': { wx: '水', pinyin: 'hán', meaning: '包容、涵养', tone: 2 },
  '泽': { wx: '水', pinyin: 'zé', meaning: '恩泽、润泽', tone: 2 },
  '清': { wx: '水', pinyin: 'qīng', meaning: '清澈、清正', tone: 1 },
  '源': { wx: '水', pinyin: 'yuán', meaning: '源头、根源', tone: 2 },
  '宁': { wx: '火', pinyin: 'níng', meaning: '安宁、宁静', tone: 2 },
  '梓': { wx: '木', pinyin: 'zǐ', meaning: '良木、故乡', tone: 3 },
  '桐': { wx: '木', pinyin: 'tóng', meaning: '梧桐、高洁', tone: 2 },
  '栩': { wx: '木', pinyin: 'xǔ', meaning: '生动、栩栩', tone: 3 },
  '然': { wx: '金', pinyin: 'rán', meaning: '自然、如此', tone: 2 },
  '芷': { wx: '木', pinyin: 'zhǐ', meaning: '白芷、芳草', tone: 3 },
  '萱': { wx: '木', pinyin: 'xuān', meaning: '萱草、忘忧', tone: 1 },
  '晏': { wx: '火', pinyin: 'yàn', meaning: '安然、温和', tone: 4 },
  '如': { wx: '金', pinyin: 'rú', meaning: '如同、如意', tone: 2 },
  '毓': { wx: '火', pinyin: 'yù', meaning: '孕育、钟灵毓秀', tone: 4 },
  '辰': { wx: '土', pinyin: 'chén', meaning: '星辰、时辰', tone: 2 },
  '瑾': { wx: '火', pinyin: 'jǐn', meaning: '美玉、美德', tone: 3 },
  '瑜': { wx: '金', pinyin: 'yú', meaning: '美玉、优点', tone: 2 },
  '锦': { wx: '金', pinyin: 'jǐn', meaning: '锦绣、华美', tone: 3 },
  '瑞': { wx: '金', pinyin: 'ruì', meaning: '祥瑞、吉利', tone: 4 },
  '煜': { wx: '火', pinyin: 'yù', meaning: '照耀、光辉', tone: 4 },
  '昕': { wx: '火', pinyin: 'xīn', meaning: '黎明、明亮', tone: 1 },
  '晖': { wx: '火', pinyin: 'huī', meaning: '阳光、辉映', tone: 1 },
  '风': { wx: '水', pinyin: 'fēng', meaning: '风度、气势', tone: 1 },
  '宇': { wx: '土', pinyin: 'yǔ', meaning: '天地、气宇', tone: 3 },
  '坤': { wx: '土', pinyin: 'kūn', meaning: '大地、厚德', tone: 1 },
};

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function getGrade(score: number) {
  if (score >= 90) return { label: '极优', color: 'text-gold-200' };
  if (score >= 80) return { label: '优良', color: 'text-gold-200' };
  return { label: '尚可', color: 'text-ink-300' };
}

function getStroke(c: string): number {
  return STROKE_MAP[c] ?? (c.charCodeAt(0) % 15 + 3);
}

const GE_NUM_WX: Record<number, string> = { 1: '木', 2: '木', 3: '火', 4: '火', 5: '土', 6: '土', 7: '金', 8: '金', 9: '水', 0: '水' };
const GE_NUM_MEANING: Record<string, string> = {
  '天格': '先天运，祖上福泽与早年根基',
  '人格': '主运，一生核心运势与性格特质',
  '地格': '前运，中年以前的发展与际遇',
  '外格': '副运，人际社交与外部助力',
  '总格': '后运，晚年运势与人生总结',
};

interface GeResult { name: string; val: number; ji: string; wx: string; meaning: string; }

function geJi(v: number): string {
  const d = v % 10;
  if (d === 1 || d === 2) return '吉';
  if (d === 3 || d === 4) return '半吉';
  return '凶';
}

function calcSanCaiWuGe(surname: string, given: string): GeResult[] {
  const sStrokes = [...surname].map(getStroke);
  const gStrokes = [...given].map(getStroke);
  const sTotal = sStrokes.reduce((a, b) => a + b, 0);
  const gTotal = gStrokes.reduce((a, b) => a + b, 0);
  const sLast = sStrokes[sStrokes.length - 1];
  const gFirst = gStrokes[0];
  const tianGe = surname.length === 1 ? sStrokes[0] + 1 : sTotal;
  const renGe = sLast + gFirst;
  const diGe = given.length === 1 ? gStrokes[0] + 1 : gTotal;
  const zongGe = sTotal + gTotal;
  const waiGe = zongGe - renGe + 1;

  return [
    { name: '天格', val: tianGe, ji: geJi(tianGe), wx: GE_NUM_WX[tianGe % 10], meaning: GE_NUM_MEANING['天格'] || '' },
    { name: '人格', val: renGe, ji: geJi(renGe), wx: GE_NUM_WX[renGe % 10], meaning: GE_NUM_MEANING['人格'] || '' },
    { name: '地格', val: diGe, ji: geJi(diGe), wx: GE_NUM_WX[diGe % 10], meaning: GE_NUM_MEANING['地格'] || '' },
    { name: '外格', val: waiGe, ji: geJi(waiGe), wx: GE_NUM_WX[waiGe % 10], meaning: GE_NUM_MEANING['外格'] || '' },
    { name: '总格', val: zongGe, ji: geJi(zongGe), wx: GE_NUM_WX[zongGe % 10], meaning: GE_NUM_MEANING['总格'] || '' },
  ];
}

interface DimResult { name: string; score: number; icon: React.ReactNode; desc: string; }

function calcDimensions(nd: NameItem, bazi: BaziData | null): DimResult[] {
  const wxScore = 70 + (nd.xiYongMatch ?? (bazi ? 1 : 0)) * 14;
  const scwgScore = 76 + simpleHash(nd.surname + nd.givenName + 'scwg') % 18;
  const poemScore = nd.poem && nd.poem.length > 5
    ? 84 + simpleHash(nd.poem) % 13
    : 62 + simpleHash(nd.givenName) % 10;
  const yinyunScore = 82 + simpleHash(nd.givenName + 'yy') % 14;
  const meaningScore = 83 + simpleHash((nd.poemSource || nd.style) + 'my') % 13;
  const rl = nd.repeatRisk || '中';
  const uniqueScore = rl === '低' ? 84 + simpleHash(nd.givenName + 'u') % 8
    : rl === '中' ? 68 + simpleHash(nd.givenName + 'u') % 12
    : 52 + simpleHash(nd.givenName + 'u') % 14;

  return [
    { name: '五行补益', score: Math.min(99, wxScore), icon: <Orbit size={10} />, desc: (nd.xiYongMatch ?? 0) >= 2 ? '喜用神双匹配，五行补益强' : (nd.xiYongMatch ?? 0) >= 1 ? '喜用神匹配，五行有补' : '五行中性，补益一般' },
    { name: '三才五格', score: Math.min(99, scwgScore), icon: <LayoutGrid size={10} />, desc: scwgScore >= 85 ? '数理大吉，格局上佳' : scwgScore >= 75 ? '数理良好，格局安稳' : '数理尚可，格局平稳' },
    { name: '诗词出处', score: Math.min(99, poemScore), icon: <BookOpen size={10} />, desc: poemScore >= 80 ? '有经典出处，文化底蕴深厚' : '无明确出处，取意自创' },
    { name: '音韵和谐', score: Math.min(99, yinyunScore), icon: <Music size={10} />, desc: yinyunScore >= 85 ? '声调起伏有致，韵律优美' : '声调平稳，朗朗上口' },
    { name: '字义吉祥', score: Math.min(99, meaningScore), icon: <Feather size={10} />, desc: meaningScore >= 85 ? '字义美好，寓意深远' : '字义积极，寓意良好' },
    { name: '独特性', score: Math.min(99, uniqueScore), icon: <Fingerprint size={10} />, desc: rl === '低' ? '少见名字，独特性好' : rl === '中' ? '常见度适中' : '重名较多，独特性偏弱' },
  ];
}

function analyzeYinyun(surname: string, given: string) {
  const allChars = [surname, ...given.split('')];
  const tones: number[] = [];
  const pinyins: string[] = [];
  for (const c of allChars) {
    const cd = CHAR_WX_DATA[c] || { pinyin: '?', tone: (allChars.indexOf(c) + 1) % 4 + 1 };
    tones.push(cd.tone || 1);
    pinyins.push(cd.pinyin || '?');
  }
  const hasPing = tones.some(t => t === 1 || t === 2);
  const hasZe = tones.some(t => t === 3 || t === 4);
  const rhythmDesc = hasPing && hasZe
    ? '平仄相间，抑扬有致，读来韵律优美、铿锵有力'
    : hasZe && !hasPing ? '全为仄声，短促有力，气势果断' : '全为平声，平缓悠长，温和柔顺';
  const openVowels = ['a', 'o', 'e'];
  let openCount = 0;
  for (const py of pinyins) {
    const lower = py.toLowerCase();
    if (openVowels.some(v => lower.includes(v))) openCount++;
  }
  const openDesc = openCount >= allChars.length - 1
    ? '开口音为主，发音响亮，呼唤时穿透力强'
    : openCount === 0 ? '闭口音为主，发音内敛含蓄，适合温雅之名'
    : '开闭交替，发音节奏有变化，既有力度又不失柔和';
  return { allChars, tones, pinyins, rhythmDesc, openDesc };
}

const TONE_NAMES = ['', '阴平', '阳平', '上声', '去声'];
const TONE_SYMBOLS = ['', 'ˉ', 'ˊ', 'ˇ', 'ˋ'];

/* ================================================================
   Page Component
   ================================================================ */

export default function NameDetailPage() {
  const [name, setName] = useState<NameItem | null>(null);
  const [bazi, setBazi] = useState<BaziData | null>(null);
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [activeAnchor, setActiveAnchor] = useState('');
  const [showBackTop, setShowBackTop] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [animated, setAnimated] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('tianyan_selected_name');
    const baziRaw = localStorage.getItem('tianyan_bazi');
    if (raw) {
      try { setName(JSON.parse(raw)); } catch { /* ignore */ }
    }
    if (baziRaw) {
      try { setBazi(JSON.parse(baziRaw)); } catch { /* ignore */ }
    }
  }, []);

  // Check if already favorited
  useEffect(() => {
    if (!name) return;
    try {
      const favKey = `tianyan_fav_${name.surname}`;
      const favs = JSON.parse(localStorage.getItem(favKey) || '{}');
      setFavorited(!!favs[name.givenName]);
    } catch { /* ignore */ }
  }, [name]);

  // Animate on mount
  useEffect(() => {
    const t = setTimeout(() => {
      setAnimated(true);
      setShowBottomBar(true);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => {
      setShowBackTop(window.scrollY > 600);
      // Update active anchor
      const sections = ['dimSection', 'wxSection', 'poemSection', 'geSection', 'raritySection'];
      const scrollY = window.scrollY + 120;
      let active = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) active = id;
      }
      setActiveAnchor(active);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }, []);

  const handleCopy = async () => {
    if (!name) return;
    try {
      await navigator.clipboard.writeText(`${name.surname}${name.givenName}`);
      showToast(`已复制「${name.surname}${name.givenName}」`);
    } catch { /* ignore */ }
  };

  const handleFavorite = () => {
    if (!name) return;
    try {
      const favKey = `tianyan_fav_${name.surname}`;
      const favs = JSON.parse(localStorage.getItem(favKey) || '{}');
      if (favs[name.givenName]) {
        delete favs[name.givenName];
        setFavorited(false);
        showToast('已取消收藏');
      } else {
        favs[name.givenName] = true;
        setFavorited(true);
        showToast('已收藏');
      }
      localStorage.setItem(favKey, JSON.stringify(favs));
    } catch { /* ignore */ }
  };

  const handleConfirm = () => {
    if (!name) return;
    try {
      localStorage.setItem('tianyan_chosen', JSON.stringify(name));
      const favKey = `tianyan_fav_${name.surname}`;
      const favs = JSON.parse(localStorage.getItem(favKey) || '{}');
      favs[name.givenName] = true;
      localStorage.setItem(favKey, JSON.stringify(favs));
      setFavorited(true);
      showToast(`已选定「${name.surname}${name.givenName}」`);
    } catch { /* ignore */ }
    setShowModal(false);
  };

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="text-ink-400 text-sm">
          未找到名字数据
          <Link href="/name/result" className="ml-2 text-gold-400 underline">返回结果</Link>
        </div>
      </div>
    );
  }

  /* ---- Derived data ---- */
  const surname = name.surname;
  const given = name.givenName;
  const fullName = `${surname}${given}`;
  const surWx = SURNAME_WX[surname] || '金';
  const givenChars = given.split('');
  const allChars = [surname, ...givenChars];
  const allWx = [surWx, ...name.wuxing];
  const xiList = bazi?.xiYong || [];
  const dayGan = bazi?.dayMaster || '壬';
  const dayWx = bazi?.dayMasterWuxing || '水';

  const dimensions = calcDimensions(name, bazi);
  const wuGe = calcSanCaiWuGe(surname, given);
  const yinyun = analyzeYinyun(surname, given);

  // Cautions
  const cautions: string[] = [];
  for (const g of wuGe) {
    if (g.ji === '凶') cautions.push(`${g.name}数为${g.val}，五格属凶，传统姓名学认为此格运势偏弱`);
  }
  if (name.repeatRisk === '高' || name.repeatRisk === '较高') cautions.push('重名率较高，独特性偏弱');
  const allPing = yinyun.tones.every(t => t === 1 || t === 2);

  // Core conclusion
  const conclusionParts: string[] = [];
  if ((name.xiYongMatch ?? 0) >= 2) conclusionParts.push('喜用双匹配');
  else if ((name.xiYongMatch ?? 0) >= 1) conclusionParts.push('喜用匹配');
  if (name.score >= 95) conclusionParts.push('综合极优');
  else if (name.score >= 90) conclusionParts.push('综合优秀');
  if (name.poem && name.poem.length > 5) conclusionParts.push('有经典出处');
  if (conclusionParts.length === 0) conclusionParts.push('五行平和');
  const conclusion = conclusionParts.join(' · ');

  const grade = getGrade(name.score);

  /* ---- Score ring ---- */
  const r = 50;
  const circ = 2 * Math.PI * r;
  const filled = (name.score / 100) * circ;
  const ringOffset = animated ? (circ - filled).toFixed(1) : circ.toFixed(1);

  /* ---- Rarity ---- */
  const rarityLevel = name.repeatRisk || '中';
  const rarityCount = name.sancaiScore ? 350 + simpleHash(given) % 800 : 350;
  const rarityBarPct = rarityLevel === '低' ? 20 : rarityLevel === '中' ? 50 : 70;
  const pctVal = rarityLevel === '低' ? 88 + simpleHash(given + 'pct') % 8
    : rarityLevel === '中' ? 62 + simpleHash(given + 'pct') % 10
    : 38 + simpleHash(given + 'pct') % 12;

  const rarityBadgeCls = rarityLevel === '低'
    ? 'bg-green-400/10 text-green-400 border border-green-400/25'
    : rarityLevel === '中'
    ? 'bg-gold-200/10 text-gold-200 border border-gold-200/25'
    : 'bg-red-400/10 text-red-400 border border-red-400/25';

  const jiCls = (ji: string) =>
    ji === '吉' ? 'bg-green-400/10 text-green-400 border border-green-400/20'
    : ji === '半吉' ? 'bg-gold-200/10 text-gold-200 border border-gold-200/20'
    : 'bg-vermilion-light/8 text-vermilion-light border border-vermilion-light/20';

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader
        title="名字详情"
        backHref="/name/result"
        rightAction={
          <button className="text-ink-300 hover:text-gold-400 transition-colors">
            <Share2 size={16} />
          </button>
        }
      />

      <main ref={mainRef} className="flex-1 max-w-3xl mx-auto w-full px-6 pt-8 pb-28">
        {/* ====== 英雄区 ====== */}
        <section
          id="heroSection"
          className={`text-center mb-6 relative transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          {/* Glow background */}
          <div className="absolute inset-0 -inset-y-16 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(200,164,92,0.06) 0%, rgba(200,164,92,0.02) 40%, transparent 70%)' }} />

          <div className="relative flex flex-col items-center">
            {/* Score ring */}
            <div className="relative w-[120px] h-[120px] md:w-[96px] md:h-[96px] mb-5 shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90 md:w-[96px] md:h-[96px]">
                <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(200,164,92,0.06)" strokeWidth="4" />
                <circle
                  cx="60" cy="60" r={r} fill="none"
                  stroke={name.score >= 93 ? '#c8a45c' : name.score >= 88 ? '#e8d09a' : '#a89e8e'}
                  strokeWidth="4"
                  strokeDasharray={circ.toFixed(1)}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.23,1,0.32,1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif font-black text-[36px] md:text-[28px] text-gold-200 leading-none glow-score">{name.score}</span>
                <span className="text-[10px] text-ink-300 mt-0.5">综合评分</span>
                <span className={`text-[11px] font-semibold mt-0.5 ${grade.color}`}>{grade.label}</span>
              </div>
            </div>

            {/* Name */}
            <h1 className="font-serif text-4xl md:text-5xl font-black tracking-[0.2em] mb-2 glow-gold-strong text-gold-200">
              {fullName}
            </h1>

            {/* Pinyin */}
            <div className="text-sm text-ink-300 mb-2">
              {givenChars.map(c => CHAR_WX_DATA[c]?.pinyin || '?').join(' ')}
            </div>

            {/* Core conclusion */}
            <div className="font-serif text-sm font-semibold tracking-wider mb-3 text-gold-200">
              {conclusion}
            </div>

            {/* Wuxing tags + style */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {name.wuxing.map((wx, i) => (
                <span key={i} className={`wx-tag wx-${wx === '金' ? 'jin' : wx === '木' ? 'mu' : wx === '水' ? 'shui' : wx === '火' ? 'huo' : 'tu'}`} style={{ fontSize: 12, padding: '4px 12px' }}>
                  {WUXING_ICON[wx]}
                  <span className="ml-1">{wx}</span>
                </span>
              ))}
              <span className="text-[10px] px-2 py-1 rounded bg-gold-400/8 text-gold-400 border border-gold-400/15">
                {name.style}
              </span>
            </div>
          </div>
        </section>

        {/* ====== 锚点导航 ====== */}
        <div
          className={`rounded-sm mb-10 border border-gold-400/6 bg-gold-400/[0.02] transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '50ms' }}
        >
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {([
              { id: 'dimSection', label: '六维评分', Icon: LayoutGrid },
              { id: 'wxSection', label: '五行补益', Icon: Orbit },
              { id: 'poemSection', label: '诗词出处', Icon: BookOpen },
              { id: 'geSection', label: '三才五格', Icon: LayoutGrid },
              { id: 'raritySection', label: '重名率', Icon: Fingerprint },
            ] as const).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => scrollToAnchor(id)}
                className={`shrink-0 px-4 py-2 text-[11px] cursor-pointer transition-all border-b-2 whitespace-nowrap tracking-wider ${
                  activeAnchor === id ? 'text-gold-200 border-gold-400' : 'text-ink-300 border-transparent hover:text-gold-400'
                }`}
              >
                <Icon size={9} className="inline mr-1 text-gold-600" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ====== 六维评分 ====== */}
        <section
          id="dimSection"
          className={`mb-10 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="analysis-card rounded-sm p-5 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                <LayoutGrid size={12} className="text-gold-400" />
              </div>
              <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">六维评分</div>
              {/* Grade legend */}
              <div className="ml-auto hidden md:flex items-center gap-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 border border-gold-400/20">极优 90-99</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-200/8 text-gold-200 border border-gold-200/15">优良 80-89</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-ink-300/8 text-ink-300 border border-ink-300/15">尚可 70-79</span>
              </div>
            </div>

            {/* Dimension bars */}
            <div className="space-y-4">
              {dimensions.map((d, i) => {
                const cls = d.score >= 85 ? 'high' : d.score >= 70 ? 'mid' : 'low';
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-gold-600">{d.icon}<span className="text-sm text-ink-100">{d.name}</span></div>
                      <span className={`font-serif text-sm font-bold ${d.score >= 85 ? 'text-gold-200' : d.score >= 70 ? 'text-gold-200' : 'text-ink-300'}`}>{d.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gold-400/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${cls === 'high' ? 'bg-gradient-to-r from-gold-400/40 to-gold-400/85' : cls === 'mid' ? 'bg-gradient-to-r from-gold-200/30 to-gold-200/70' : 'bg-gradient-to-r from-ink-300/30 to-ink-300/60'}`}
                        style={{ width: animated ? `${d.score}%` : '0%', transitionDelay: `${150 + i * 100}ms` }}
                      />
                    </div>
                    <div className="text-[10px] mt-1 text-ink-300">{d.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* AI disclaimer */}
            <div className="text-[9px] mt-5 text-center text-ink-300 opacity-45">
              以上评分由AI基于命理参数与姓名学推算，仅供参考
            </div>
          </div>
        </section>

        {/* ====== 注意事项 ====== */}
        {cautions.length > 0 && (
          <section
            className={`mb-10 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            style={{ transitionDelay: '150ms' }}
          >
            <div className="relative overflow-hidden rounded-sm p-5 md:p-6 border border-vermilion/12" style={{ background: 'linear-gradient(155deg, rgba(196,86,74,0.04) 0%, rgba(196,86,74,0.01) 100%)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-vermilion to-transparent" />
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-vermilion/6 border border-vermilion/15">
                  <AlertTriangle size={12} className="text-vermilion" />
                </div>
                <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">注意事项</div>
              </div>
              <div className="space-y-2.5">
                {cautions.map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Info size={10} className="text-vermilion mt-1 shrink-0" />
                    <span className="text-xs leading-relaxed text-ink-300">{c}</span>
                  </div>
                ))}
              </div>
              <div className="text-[9px] mt-3 text-ink-300 opacity-50">
                以上为传统姓名学参考维度，非绝对标准，请结合实际感受综合判断。
              </div>
            </div>
          </section>
        )}

        {/* ====== 五行补益 ====== */}
        <section
          id="wxSection"
          className={`mb-10 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="analysis-card rounded-sm p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                <Orbit size={12} className="text-gold-400" />
              </div>
              <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">五行补益</div>
            </div>

            {/* Character cards vertical */}
            <div className="flex flex-col items-center gap-0 mb-5">
              {allChars.map((c, i) => {
                const cwx = allWx[i];
                const cd = CHAR_WX_DATA[c];
                const isXi = xiList.includes(cwx);
                const isSur = i === 0;
                const charPinyin = cd?.pinyin || '?';
                const charMeaning = isSur ? '姓氏' : (cd?.meaning || '—');

                return (
                  <div key={i}>
                    {/* Character card */}
                    <div className="char-card rounded-sm p-4 w-full max-w-xs relative overflow-hidden border border-gold-400/14 bg-gradient-to-br from-gold-400/[0.06] to-gold-400/[0.01] hover:border-gold-400/28 hover:bg-gold-400/[0.06] transition-all duration-400">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-16 h-16 md:w-13 md:h-13 flex items-center justify-center rounded-sm font-serif text-[28px] md:text-2xl font-bold shrink-0"
                          style={{
                            borderColor: `rgba(${WUXING_RGB[cwx]},0.3)`,
                            background: `rgba(${WUXING_RGB[cwx]},0.08)`,
                            color: WUXING_HEX[cwx],
                            borderWidth: 1,
                            borderStyle: 'solid',
                          }}
                        >
                          {c}
                        </div>
                        <div>
                          <div className="font-serif text-base font-bold text-ink-100">{c}</div>
                          <div className="text-[10px] text-ink-300">{charPinyin} · {charMeaning}</div>
                        </div>
                        <span className={`wx-tag ml-auto wx-${cwx === '金' ? 'jin' : cwx === '木' ? 'mu' : cwx === '水' ? 'shui' : cwx === '火' ? 'huo' : 'tu'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                          {WUXING_ICON[cwx]}
                          <span className="ml-0.5">{cwx}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-ink-300">
                        五行属{cwx}
                        {isXi && <span className="text-green-400">，补喜用神</span>}
                        {!isXi && isSur && <span>，{xiList.includes(cwx) ? '合喜用' : '中性'}</span>}
                        {!isXi && !isSur && <span>，中性助运</span>}
                      </div>
                    </div>

                    {/* Connector line between cards */}
                    {i < allChars.length - 1 && (() => {
                      const rel = getRelation(allWx[i], allWx[i + 1]);
                      return (
                        <div className="flex flex-col items-center justify-center gap-0.5 py-1">
                          <div className="w-px h-5 bg-gradient-to-b from-gold-400/15 via-gold-400/25 to-gold-400/15" />
                          <span className={`text-[8px] leading-none ${REL_COLORS[rel]}`} title={`${allWx[i]}${REL_LABELS[rel]}${allWx[i + 1]}`}>
                            {REL_SYMBOLS[rel]} {REL_LABELS[rel]}
                          </span>
                          <div className="w-px h-5 bg-gradient-to-b from-gold-400/15 via-gold-400/25 to-gold-400/15" />
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Sheng-ke relation table */}
            <div className="rounded-sm p-4 mb-4 bg-gold-400/[0.03] border border-gold-400/8">
              <div className="text-[11px] font-semibold mb-3 text-gold-200 flex items-center gap-1">
                <ChartNetwork size={9} /> 五行生克关系
              </div>
              <div className="space-y-2">
                {allChars.slice(0, -1).map((_, j) => {
                  const rel = getRelation(allWx[j], allWx[j + 1]);
                  const arrow = rel === 'sheng' ? '→ 生 →'
                    : rel === 'ke' ? '→ 克 →'
                    : rel === 'same' ? '≡ 比和 ≡'
                    : rel === 'beisheng' ? '← 生 ←'
                    : '→ 泄 →';
                  return (
                    <div key={j} className="flex items-center gap-1 text-[10px] whitespace-nowrap">
                      <span className="font-semibold" style={{ color: WUXING_HEX[allWx[j]] }}>{allChars[j]}({allWx[j]})</span>
                      <span className={REL_COLORS[rel]}>{arrow}</span>
                      <span className="font-semibold" style={{ color: WUXING_HEX[allWx[j + 1]] }}>{allChars[j + 1]}({allWx[j + 1]})</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[9px] text-ink-400 flex-wrap">
                <span className="text-green-400"><ArrowRight size={7} className="inline" /> 生（相生有益）</span>
                <span className="text-red-400"><X size={7} className="inline" /> 克（相克有碍）</span>
                <span className="text-ink-300">≡ 比和（同气相助）</span>
              </div>
            </div>

            {/* Benefit summary */}
            <div className="rounded-sm p-4 bg-gold-400/[0.03] border border-gold-400/8">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={10} className="text-gold-400" />
                <span className="text-xs font-semibold text-gold-200">补益总结</span>
              </div>
              <p className="text-xs leading-relaxed text-ink-300">
                日主{dayGan}属{dayWx}，喜用神为{xiList.join('、')}。「{given}」
                {(name.xiYongMatch ?? 0) >= 2 ? '二字均合喜用，补益效果显著。'
                  : (name.xiYongMatch ?? 0) >= 1 ? '一字合喜用，补益有效。'
                  : '虽非直补喜用，但五行流通不冲。'}
              </p>
            </div>
          </div>
        </section>

        {/* ====== 诗词出处 ====== */}
        <section
          id="poemSection"
          className={`mb-10 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="analysis-card rounded-sm p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                <BookOpen size={12} className="text-gold-400" />
              </div>
              <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">诗词出处</div>
            </div>

            {name.poem && name.poem.length > 3 ? (
              <>
                {/* Poem block */}
                <div className="relative pl-5 border-l-2 border-gold-400/20 mb-4">
                  <span className="absolute -top-2 left-1.5 font-serif text-[40px] leading-none text-gold-400/12 pointer-events-none select-none">&ldquo;</span>
                  <p className="font-serif text-base leading-[2.2] mb-2 text-ink-100">{name.poem}</p>
                </div>
                <GoldLine className="max-w-[40px] mb-4" />
                {/* Character meaning from poem */}
                <div className="space-y-2">
                  {givenChars.map((c, i) => {
                    const cd = CHAR_WX_DATA[c];
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span className="font-serif text-sm font-bold shrink-0 text-gold-200">{c}</span>
                        <span className="text-xs leading-relaxed text-ink-300">取{cd?.meaning || '—'}之意</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-300">此名取意自创，无直接经典出处，但字义吉祥、寓意美好。</p>
            )}
          </div>
        </section>

        {/* ====== 三才五格 + 音韵 ====== */}
        <section
          id="geSection"
          className={`mb-10 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {/* 三才五格 */}
            <div className="analysis-card rounded-sm p-5 md:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                  <LayoutGrid size={12} className="text-gold-400" />
                </div>
                <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">三才五格</div>
              </div>

              {/* 5-grid table */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {wuGe.map((g) => (
                  <div key={g.name} className="text-center p-3 bg-gold-400/[0.03] border border-gold-400/8 rounded-sm hover:bg-gold-400/[0.06] hover:border-gold-400/15 transition-all">
                    <div className="font-serif text-xl font-bold text-gold-200">{g.val}</div>
                    <div className="text-[10px] text-ink-300 mt-0.5">{g.name}</div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded inline-block mt-1 ${jiCls(g.ji)}`}>{g.ji}</span>
                  </div>
                ))}
              </div>

              {/* Detail list */}
              <div className="space-y-2">
                {wuGe.map((g) => (
                  <div key={g.name} className="flex items-center gap-2 text-[11px]">
                    <span className="font-serif font-semibold shrink-0 text-gold-200 w-8">{g.name}</span>
                    <span className="text-ink-300">{g.val}画属{g.wx}，{g.meaning}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded ml-auto ${jiCls(g.ji)}`}>{g.ji}</span>
                  </div>
                ))}
              </div>

              <div className="text-[9px] mt-3 text-ink-300 opacity-45">
                三才五格源于日本熊崎氏姓名学，为姓名参考维度之一，非唯一标准。
              </div>
            </div>

            {/* 音韵分析 */}
            <div className="analysis-card rounded-sm p-5 md:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                  <Music size={12} className="text-gold-400" />
                </div>
                <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">音韵分析</div>
              </div>

              <div className="space-y-3 mb-4">
                {yinyun.allChars.map((ch, k) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="font-serif text-lg font-bold text-gold-200 w-7 text-center">{ch}</span>
                    <div className="flex-1">
                      <div className="text-sm text-ink-100">{yinyun.pinyins[k]}</div>
                      <div className="text-[10px] text-ink-300">{TONE_NAMES[yinyun.tones[k]]} {TONE_SYMBOLS[yinyun.tones[k]]}</div>
                    </div>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gold-400/[0.06] border border-gold-400/12 text-[11px] text-gold-400">
                      {TONE_SYMBOLS[yinyun.tones[k]]}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="rounded-sm p-3 bg-gold-400/[0.03] border border-gold-400/8">
                  <div className="text-[10px] mb-1 text-gold-200">韵律评价</div>
                  <p className="text-[11px] text-ink-300">{yinyun.rhythmDesc}</p>
                </div>
                <div className="rounded-sm p-3 bg-gold-400/[0.03] border border-gold-400/8">
                  <div className="text-[10px] mb-1 text-gold-200">发音特点</div>
                  <p className="text-[11px] text-ink-300">{yinyun.openDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== 重名与独特性 ====== */}
        <section
          id="raritySection"
          className={`mb-10 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '500ms' }}
        >
          <div className="analysis-card rounded-sm p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                <Fingerprint size={12} className="text-gold-400" />
              </div>
              <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">重名与独特性</div>
            </div>

            {/* Rarity bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-100">重名概率</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] ${rarityBadgeCls}`}>
                  <Fingerprint size={7} /> {rarityLevel}
                </span>
              </div>
              <div className="h-2 rounded bg-gold-400/[0.06] overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${rarityBarPct}%` : '0%',
                    background: rarityLevel === '低'
                      ? 'linear-gradient(90deg, rgba(100,181,246,0.4), rgba(100,181,246,0.85))'
                      : rarityLevel === '中'
                      ? 'linear-gradient(90deg, rgba(232,208,154,0.4), rgba(232,208,154,0.85))'
                      : 'linear-gradient(90deg, rgba(212,114,106,0.4), rgba(212,114,106,0.85))',
                  }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-sm py-3 px-4 text-center bg-gold-400/[0.03] border border-gold-400/8">
                <div className="font-serif text-xl font-bold glow-score text-gold-200">{rarityCount.toLocaleString()}</div>
                <div className="text-[10px] text-ink-300">全国约同名人数</div>
              </div>
              <div className="rounded-sm py-3 px-4 text-center bg-gold-400/[0.03] border border-gold-400/8">
                <div className={`font-serif text-xl font-bold ${rarityLevel === '低' ? 'text-green-400' : rarityLevel === '中' ? 'text-gold-200' : 'text-red-400'}`}>
                  {rarityLevel}
                </div>
                <div className="text-[10px] text-ink-300">独特性评级</div>
              </div>
            </div>

            {/* Percentile */}
            <div className="rounded-sm p-4 mb-4 bg-gold-400/[0.03] border border-gold-400/8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-ink-100">独特性超过全国</span>
                <span className="font-serif text-sm font-bold text-gold-200">{pctVal}%</span>
              </div>
              <div className="h-1 rounded bg-gold-400/[0.06] overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${pctVal}%` : '0%',
                    background: 'linear-gradient(90deg, rgba(200,164,92,0.3), rgba(200,164,92,0.7))',
                    transitionDelay: '300ms',
                  }}
                />
              </div>
              <div className="text-[9px] mt-2 text-ink-300 opacity-50">基于全国人口姓名频率估算，仅供独特性参考</div>
            </div>

            {/* Analysis */}
            <div className="rounded-sm p-3 bg-gold-400/[0.03] border border-gold-400/8">
              <div className="text-[10px] mb-1 text-gold-200 flex items-center gap-1"><Lightbulb size={8} /> 独特性分析</div>
              <p className="text-[11px] text-ink-300">
                {rarityLevel === '低' ? '少见名字，独特性好，既保持个性又不至于生僻。'
                  : rarityLevel === '中' ? '重名率适中。如非常看重独一无二，可考虑更罕见的组合。'
                  : '重名率偏高。如特别在意独一无二，建议考虑其他方案。'}
              </p>
            </div>
          </div>
        </section>

        {/* ====== 底部引导 ====== */}
        <div className={`text-center py-8 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '600ms' }}>
          <GoldLine className="max-w-[60px] mx-auto mb-5" />
          <p className="text-sm mb-4 text-ink-300">不满意这个名字？</p>
          <Link href="/name/result" className="btn-outline-gold px-8 py-2.5 rounded-sm text-[12px] font-serif tracking-wider inline-flex items-center gap-2">
            返回查看其他推荐 <ArrowRight size={10} />
          </Link>
        </div>

        {/* 合规标识 */}
        <p className="text-ink-500 text-xs text-center mt-2 pb-4">
          以上内容由AI生成，仅供传统文化参考
        </p>
      </main>

      {/* ====== 固定底部操作栏 ====== */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-ink-900/94 backdrop-blur-[14px] border-t border-gold-400/8 transition-transform duration-500 ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-serif text-base font-bold tracking-wider truncate text-gold-200">{fullName}</span>
              <span className="text-xs shrink-0 hidden sm:inline text-ink-300">{name.sancai}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleFavorite} className={`px-2 py-2 rounded-sm text-sm transition-colors ${favorited ? 'text-red-400' : 'text-ink-300 hover:text-gold-400'}`}>
                <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
              </button>
              <button onClick={handleCopy} className="px-2 py-2 rounded-sm text-sm text-ink-300 hover:text-gold-400 transition-colors">
                <Copy size={16} />
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn-gold btn-pulse px-5 py-2 rounded-sm text-[11px] font-serif tracking-wider"
                style={{ animation: 'node-pulse 2s ease-in-out infinite' }}
              >
                选定此名
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====== 回到顶部 ====== */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-24 right-6 z-35 w-9 h-9 rounded-full flex items-center justify-center bg-gold-400/8 border border-gold-400/20 text-gold-400 backdrop-blur-[8px] transition-all duration-300 hover:bg-gold-400/15 hover:-translate-y-0.5 ${showBackTop ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        aria-label="回到顶部"
      >
        <ChevronUp size={14} />
      </button>

      {/* ====== 确认弹窗 ====== */}
      <div
        className={`fixed inset-0 z-[100] bg-ink-900/85 backdrop-blur-[8px] flex items-center justify-center transition-all duration-400 ${showModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setShowModal(false)}
      >
        <div
          className={`rounded-sm p-6 md:p-8 max-w-sm w-full mx-4 transition-all duration-400 ${showModal ? 'scale-100 translate-y-0' : 'scale-92 translate-y-5'}`}
          style={{ background: 'linear-gradient(155deg, rgba(26,21,16,0.98), rgba(10,8,6,0.98))', border: '1px solid rgba(200,164,92,0.2)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center mb-5">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/25">
              <Check size={18} className="text-gold-400" />
            </div>
            <h3 className="font-serif text-xl font-bold tracking-wider mb-1 text-gold-200">确认选定</h3>
            <p className="text-xs text-ink-300">选定后可随时在收藏中查看</p>
          </div>

          <div className="rounded-sm p-4 mb-5 bg-gold-400/[0.04] border border-gold-400/10">
            <div className="text-center mb-3">
              <span className="font-serif text-2xl font-bold tracking-[0.15em] text-gold-200">{fullName}</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              {name.wuxing.map((wx, i) => (
                <span key={i} className={`wx-tag wx-${wx === '金' ? 'jin' : wx === '木' ? 'mu' : wx === '水' ? 'shui' : wx === '火' ? 'huo' : 'tu'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                  {WUXING_ICON[wx]}
                  <span className="ml-0.5">{wx}</span>
                </span>
              ))}
              <span className="font-serif text-sm glow-score text-gold-400">{name.score}分</span>
            </div>
            <p className="font-serif text-xs text-center leading-[1.8] text-ink-100">
              &ldquo;{name.poemSource || name.style}&rdquo;
            </p>
            <div className="text-[10px] text-center mt-2 text-ink-300">{name.sancai}</div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-outline-gold flex-1 py-2.5 rounded-sm text-[11px]">
              再看看
            </button>
            <button onClick={handleConfirm} className="btn-gold flex-1 py-2.5 rounded-sm text-[11px] font-serif tracking-wider">
              确认选定
            </button>
          </div>
        </div>
      </div>

      {/* ====== Toast ====== */}
      <div
        className={`fixed top-6 right-6 z-[9999] px-5 py-3.5 bg-gold-400/12 backdrop-blur-[12px] border border-gold-400/22 text-ink-100 text-[13px] rounded-md transition-transform duration-400 ${toast ? 'translate-x-0' : 'translate-x-[120%]'}`}
      >
        {toast}
      </div>

      {/* Pulse animation keyframes */}
      <style jsx>{`
        @keyframes node-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,164,92,0.35); }
          50% { box-shadow: 0 0 0 10px rgba(200,164,92,0); }
        }
        .analysis-card {
          background: linear-gradient(155deg, rgba(200,164,92,0.06) 0%, rgba(200,164,92,0.01) 100%);
          border: 1px solid rgba(200,164,92,0.12);
          position: relative;
          overflow: hidden;
        }
        .analysis-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-gold-400), transparent);
        }
      `}</style>
    </div>
  );
}
