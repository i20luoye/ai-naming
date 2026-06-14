'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Cpu,
  SkipForward,
  CheckCircle,
  Heart,
  Copy,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Search,
  Lock,
  Unlock,
  Users,
  Star,
  Fingerprint,
  CircleDot,
  SlidersHorizontal,
  Filter,
} from 'lucide-react';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { GoldLine } from '@/components/tianyan/GoldLine';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import {
  loadInput,
  loadBazi,
  loadPreference,
  saveNames,
  type BaziData,
  type InputData,
  type PreferenceData,
  type NameItem,
} from '@/lib/storage';

/* ================================================================
   常量
   ================================================================ */
const STEPS = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

const WX_LUCIDE_ICON: Record<string, string> = {
  金: 'gem',
  木: 'leaf',
  水: 'droplets',
  火: 'flame',
  土: 'mountain',
};

const SHICHEN_MAP = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时',
];

/* 重名率配色 */
const RARITY_COLOR: Record<string, { bg: string; text: string; border: string; fill: string }> = {
  极低: { bg: 'rgba(129,199,132,0.1)', text: '#81c784', border: 'rgba(129,199,132,0.25)', fill: 'rgba(129,199,132,0.7)' },
  低:   { bg: 'rgba(100,181,246,0.1)', text: '#64b5f6', border: 'rgba(100,181,246,0.25)', fill: 'rgba(100,181,246,0.7)' },
  中:   { bg: 'rgba(232,208,154,0.1)', text: '#e8d09a', border: 'rgba(232,208,154,0.25)', fill: 'rgba(232,208,154,0.7)' },
  较高: { bg: 'rgba(212,114,106,0.1)', text: '#d4726a', border: 'rgba(212,114,106,0.25)', fill: 'rgba(212,114,106,0.7)' },
  极高: { bg: 'rgba(196,86,74,0.12)', text: '#c4564a', border: 'rgba(196,86,74,0.25)', fill: 'rgba(196,86,74,0.7)' },
};

/* ================================================================
   工具函数
   ================================================================ */
function getGenderText(g: string) {
  if (g === 'male' || g === '男') return '男';
  return '女';
}

function calcRarity(given: string, surname: string) {
  const charFreq: Record<string, number> = {
    涵: 0.55, 泽: 0.60, 清: 0.50, 源: 0.40, 沁: 0.20, 兰: 0.45, 潆: 0.04, 月: 0.55, 澄: 0.25, 宁: 0.40,
    梓: 0.35, 桐: 0.22, 栩: 0.15, 然: 0.45, 芷: 0.22, 萱: 0.30, 柯: 0.18, 远: 0.40, 荟: 0.08, 蔚: 0.15,
    瑾: 0.28, 瑜: 0.30, 锦: 0.40, 瑞: 0.50, 钰: 0.30, 铭: 0.35, 钦: 0.12, 铮: 0.15, 书: 0.40, 晏: 0.10,
    毓: 0.12, 辰: 0.50, 煜: 0.35, 昕: 0.30, 晖: 0.22, 煦: 0.08, 风: 0.55, 宇: 0.60, 坤: 0.30, 垣: 0.03,
    培: 0.25, 均: 0.30, 平: 0.50, 如: 0.35,
  };
  const surnameFreq: Record<string, number> = { 张: 0.9, 王: 0.9, 李: 0.85, 刘: 0.8, 陈: 0.8, 杨: 0.7, 赵: 0.7, 黄: 0.65, 周: 0.65, 吴: 0.6 };

  const f1 = charFreq[given.charAt(0)] ?? 0.3;
  const f2 = charFreq[given.charAt(1)] ?? 0.3;
  const combined = (f1 + f2) / 2;
  const sf = surnameFreq[surname] || 0.5;
  const rate = combined * sf;

  let level: string, count: number, barPct: number;
  if (rate < 0.1)       { level = '极低'; count = Math.round(rate * 500) + 10; barPct = 8; }
  else if (rate < 0.2)  { level = '低';   count = Math.round(rate * 3000) + 50; barPct = 20; }
  else if (rate < 0.35) { level = '中';   count = Math.round(rate * 12000) + 200; barPct = 40; }
  else if (rate < 0.5)  { level = '较高'; count = Math.round(rate * 35000) + 1000; barPct = 65; }
  else                   { level = '极高'; count = Math.round(rate * 80000) + 5000; barPct = 88; }

  return { level, count, barPct };
}

/* 简易哈希 */
function simpleHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

/* ================================================================
   内部名字池（Mock 数据，与设计稿一致）
   ================================================================ */
interface NamePoolEntry {
  given: string; wx: string[]; style: string; source: string; meaning: string;
  poem: string; pinyin: string; baseScore: number; advantage: string; wxBenefit: string;
}

const NAME_POOL: NamePoolEntry[] = [
  { given:'涵泽', wx:['水','水'], style:'大气', source:'楚辞', meaning:'涵润泽被，水利万物而不争', poem:'《楚辞》意象', pinyin:'hán zé', baseScore:94, advantage:'三才五格大吉 · 音韵上扬', wxBenefit:'双水补弱，水利万物' },
  { given:'清源', wx:['水','水'], style:'沉稳', source:'周易', meaning:'正本清源，源头活水来', poem:'《周易》：浚其源而流长', pinyin:'qīng yuán', baseScore:92, advantage:'三才吉 · 寓意深远', wxBenefit:'双水助势，源远流长' },
  { given:'沁兰', wx:['水','木'], style:'清新', source:'诗经', meaning:'沁人心脾，兰心蕙质', poem:'《诗经》：沅有芷兮澧有兰', pinyin:'qìn lán', baseScore:90, advantage:'水木相生 · 诗意盎然', wxBenefit:'水生木，木得润而秀' },
  { given:'潆月', wx:['水','水'], style:'文雅', source:'宋词', meaning:'水月交辉，温婉柔美', poem:'宋词水月意境', pinyin:'yíng yuè', baseScore:91, advantage:'极低重名 · 意境绝佳', wxBenefit:'双水润局，柔美合度' },
  { given:'澄宁', wx:['水','火'], style:'温润', source:'唐诗', meaning:'澄澈宁静，清明安和', poem:'唐诗澄明意境', pinyin:'chéng níng', baseScore:89, advantage:'水火既济 · 刚柔并济', wxBenefit:'水火相济，平衡中和' },
  { given:'梓桐', wx:['木','木'], style:'文雅', source:'诗经', meaning:'梓桐双秀，良木美材', poem:'《诗经》：梧桐生矣，于彼朝阳', pinyin:'zǐ tóng', baseScore:92, advantage:'双木成林 · 格局清朗', wxBenefit:'双木助势，秀木成林' },
  { given:'栩然', wx:['木','金'], style:'灵动', source:'庄子', meaning:'栩栩然蝴蝶也，自在逍遥', poem:'《庄子·齐物论》', pinyin:'xǔ rán', baseScore:88, advantage:'金木相制 · 逍遥自在', wxBenefit:'木得金修，器宇不凡' },
  { given:'芷萱', wx:['木','木'], style:'清新', source:'诗经', meaning:'芷兰萱草，芳华自若', poem:'《诗经》：焉得谖草', pinyin:'zhǐ xuān', baseScore:91, advantage:'双木芳华 · 诗经出处', wxBenefit:'双木逢春，芳华自若' },
  { given:'晏如', wx:['火','金'], style:'温润', source:'诗经', meaning:'言笑晏晏，安然自若', poem:'《诗经·卫风》：言笑晏晏', pinyin:'yàn rú', baseScore:96, advantage:'喜用双匹配 · 音韵极佳', wxBenefit:'火金相照，光彩照人' },
  { given:'毓辰', wx:['火','土'], style:'大气', source:'唐诗', meaning:'钟灵毓秀，灿若星辰', poem:'典故毓秀意象', pinyin:'yù chén', baseScore:93, advantage:'火土相生 · 格局宏大', wxBenefit:'火生土，毓秀凝辉' },
  { given:'瑾瑜', wx:['火','金'], style:'沉稳', source:'楚辞', meaning:'怀瑾握瑜，美玉品德', poem:'《楚辞·九章》：怀瑾握瑜', pinyin:'jǐn yú', baseScore:95, advantage:'双金美玉 · 品德高洁', wxBenefit:'火炼真金，玉质天成' },
  { given:'锦瑞', wx:['金','金'], style:'大气', source:'周易', meaning:'锦程瑞气，福泽绵长', poem:'《周易》吉祥意象', pinyin:'jǐn ruì', baseScore:92, advantage:'双金瑞气 · 五格吉数', wxBenefit:'双金助势，瑞气盈门' },
  { given:'煜然', wx:['火','金'], style:'大气', source:'楚辞', meaning:'煜煜生辉，自然光华', poem:'《楚辞》光辉意象', pinyin:'yù rán', baseScore:91, advantage:'火金交辉 · 光明磊落', wxBenefit:'火金相映，光华自显' },
  { given:'昕晖', wx:['火','火'], style:'温润', source:'唐诗', meaning:'晨昕晖映，光明坦荡', poem:'唐诗晨光意境', pinyin:'xīn huī', baseScore:89, advantage:'双火齐明 · 前程光明', wxBenefit:'双火补弱，暖照命局' },
  { given:'煦风', wx:['火','水'], style:'清新', source:'宋词', meaning:'和煦春风，温暖如煦', poem:'宋词春风意境', pinyin:'xù fēng', baseScore:88, advantage:'水火既济 · 温润和畅', wxBenefit:'火暖水温，和风化雨' },
  { given:'辰宇', wx:['土','土'], style:'大气', source:'唐诗', meaning:'星辰宇宙，胸襟辽阔', poem:'唐诗星宇意境', pinyin:'chén yǔ', baseScore:91, advantage:'双土厚载 · 格局开阔', wxBenefit:'双土培根，厚德载物' },
  { given:'培风', wx:['土','水'], style:'灵动', source:'庄子', meaning:'培风而上，扶摇万里', poem:'《庄子·逍遥游》', pinyin:'péi fēng', baseScore:90, advantage:'土水相济 · 志存高远', wxBenefit:'土得水润，厚积薄发' },
  { given:'锦书', wx:['金','金'], style:'文雅', source:'宋词', meaning:'云中谁寄锦书来', poem:'李清照《一剪梅》', pinyin:'jǐn shū', baseScore:91, advantage:'诗韵悠长 · 金声玉振', wxBenefit:'双金清越，文采斐然' },
  { given:'钰铭', wx:['金','金'], style:'沉稳', source:'唐诗', meaning:'钰石铭心，坚毅不屈', poem:'唐诗金石意境', pinyin:'yù míng', baseScore:90, advantage:'金坚玉润 · 铭记初心', wxBenefit:'双金铸器，坚毅可成' },
  { given:'坤垣', wx:['土','土'], style:'沉稳', source:'周易', meaning:'厚德坤垣，稳如磐石', poem:'《周易》：地势坤', pinyin:'kūn yuán', baseScore:89, advantage:'极低重名 · 稳如磐石', wxBenefit:'双土筑基，厚德稳固' },
];

/* ================================================================
   生成名字（从名字池筛选 + 排序）
   ================================================================ */
interface EnrichedName {
  surname: string;
  given: string;
  fullName: string;
  wx: string[];
  style: string;
  source: string;
  meaning: string;
  poem: string;
  pinyin: string;
  score: number;
  matchCount: number;
  advantage: string;
  wxBenefit: string;
  rarity: { level: string; count: number; barPct: number };
}

function generateVisibleAndLocked(surname: string, xiList: string[]) {
  const scored = NAME_POOL.map((e) => {
    const mc = e.wx.filter((w) => xiList.includes(w)).length;
    const hash = simpleHash(surname + e.given) % 7;
    const fs = Math.min(99, Math.max(82, e.baseScore + mc - (hash > 4 ? 1 : 0)));
    return { entry: e, matchCount: mc, score: fs };
  });
  scored.sort((a, b) => b.matchCount !== a.matchCount ? b.matchCount - a.matchCount : b.score - a.score);

  const toEnriched = (s: { entry: NamePoolEntry; matchCount: number; score: number }): EnrichedName => ({
    surname,
    given: s.entry.given,
    fullName: surname + s.entry.given,
    wx: s.entry.wx,
    style: s.entry.style,
    source: s.entry.source,
    meaning: s.entry.meaning,
    poem: s.entry.poem,
    pinyin: s.entry.pinyin,
    score: s.score,
    matchCount: s.matchCount,
    advantage: s.entry.advantage,
    wxBenefit: s.entry.wxBenefit,
    rarity: calcRarity(s.entry.given, surname),
  });

  const visible = scored.slice(0, 5).map(toEnriched);
  const locked = scored.slice(5, 10).map(toEnriched);
  return { visible, locked };
}

/* ================================================================
   AI 前奏步骤
   ================================================================ */
interface AIStep {
  text: string;
  icon: React.ReactNode;
}

/* ================================================================
   主组件
   ================================================================ */
export default function NameResultPage() {
  const router = useRouter();

  /* ---- 基础数据 ---- */
  const [input, setInput] = useState<InputData | null>(null);
  const [bazi, setBazi] = useState<BaziData | null>(null);

  /* ---- 名字数据 ---- */
  const [visibleNames, setVisibleNames] = useState<EnrichedName[]>([]);
  const [lockedNames, setLockedNames] = useState<EnrichedName[]>([]);

  /* ---- AI 流程 ---- */
  const [aiSteps, setAiSteps] = useState<AIStep[]>([]);
  const [aiStepDone, setAiStepDone] = useState<boolean[]>([]);
  const [aiDone, setAiDone] = useState(false);
  const [aiCompact, setAiCompact] = useState(false);

  /* ---- 流式分析文本 ---- */
  const [analysisText, setAnalysisText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /* ---- 卡片显隐 ---- */
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [unlockRevealed, setUnlockRevealed] = useState(false);
  const [compareBarVisible, setCompareBarVisible] = useState(false);

  /* ---- 收藏 ---- */
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  /* ---- Toast ---- */
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  /* ---- 活跃对比条 ---- */
  const [activeCompare, setActiveCompare] = useState<number | null>(null);

  /* ---- 派生数据 ---- */
  const surname = input?.surname || '张';
  const xiList = bazi?.xiYong || ['木', '水'];
  const dayGan = bazi?.dayMaster || '壬';
  const dayWx = bazi?.dayMasterWuxing || '水';
  const isStrong = bazi?.strength === 'strong';
  const genderText = input ? getGenderText(input.gender) : '男';

  /* ================================================================
     初始化
     ================================================================ */
  useEffect(() => {
    const inputData = loadInput();
    const baziData = loadBazi();
    const prefData = loadPreference();

    if (!inputData || !baziData) {
      router.push('/name/input');
      return;
    }

    setInput(inputData);
    setBazi(baziData);

    // 生成名字
    const { visible, locked } = generateVisibleAndLocked(inputData.surname, baziData.xiYong);
    setVisibleNames(visible);
    setLockedNames(locked);

    // 构建 AI 步骤
    const steps: AIStep[] = [
      {
        text: `日主${baziData.dayMaster}属${baziData.dayMasterWuxing}，${baziData.strength === 'strong' ? '身强宜克泄' : '身弱宜生助'}，喜用${baziData.xiYong.join('、')}`,
        icon: <CircleDot className="w-2.5 h-2.5" />,
      },
      {
        text: `偏好：${prefData?.charCount === 'single' ? '2' : '3'}字名 · ${prefData?.styles?.length ? prefData.styles.join('·') : '不限'} · ${prefData?.poemSources?.length ? prefData.poemSources.join('·') : '不限'}`,
        icon: <SlidersHorizontal className="w-2.5 h-2.5" />,
      },
      {
        text: '从12,800字筛选...五行校验 · 三才五格 · 音韵匹配 · 重名过滤',
        icon: <Filter className="w-2.5 h-2.5" />,
      },
      {
        text: '命理契合度排序完成，生成5个良名',
        icon: <CheckCircle className="w-2.5 h-2.5" />,
      },
    ];
    setAiSteps(steps);
    setAiStepDone(new Array(steps.length).fill(false));

    // 检查缓存
    const cached = localStorage.getItem('tianyan_names');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.names && parsed.names.length > 0) {
          // 有缓存：直接跳过 AI 前奏
          setAiDone(true);
          setAiStepDone(steps.map(() => true));
          setAiCompact(true);
          setAnalysisText(parsed.analysis || '');
          setCardsRevealed(true);
          setCompareBarVisible(true);
          setUnlockRevealed(true);
          return;
        }
      } catch { /* ignore */ }
    }

    // 启动 AI 前奏动画
    runAIPrologue(steps);

    // 调用 API 流式分析
    generateAnalysis(inputData, baziData, prefData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================
     AI 前奏动画
     ================================================================ */
  const runAIPrologue = useCallback((steps: AIStep[]) => {
    let idx = 0;
    const tick = () => {
      if (idx >= steps.length) {
        setAiDone(true);
        setTimeout(() => setAiCompact(true), 400);
        setTimeout(() => {
          setCompareBarVisible(true);
          setCardsRevealed(true);
        }, 700);
        setTimeout(() => setUnlockRevealed(true), 1400);
        return;
      }
      setAiStepDone((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
      idx++;
      setTimeout(tick, 800 + Math.random() * 600);
    };
    setTimeout(tick, 500);
  }, []);

  /* ================================================================
     跳过 AI 前奏
     ================================================================ */
  const skipAI = useCallback(() => {
    if (aiDone) return;
    setAiStepDone(aiSteps.map(() => true));
    setAiDone(true);
    setTimeout(() => setAiCompact(true), 150);
    setTimeout(() => {
      setCompareBarVisible(true);
      setCardsRevealed(true);
    }, 400);
    setTimeout(() => setUnlockRevealed(true), 800);
  }, [aiDone, aiSteps]);

  /* ================================================================
     流式 AI 分析
     ================================================================ */
  const generateAnalysis = async (
    inputData: InputData,
    baziData: BaziData,
    prefData: PreferenceData | null,
  ) => {
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surname: inputData.surname,
          birthDate: inputData.birthDate,
          birthTime: inputData.birthTime,
          gender: inputData.gender,
          xiYong: baziData.xiYong,
          pattern: baziData.pattern,
          preference: prefData
            ? {
                charCount: prefData.charCount,
                styles: prefData.styles,
                poemSources: prefData.poemSources,
                excludeChars: prefData.excludeChars,
                avoidHotNames: prefData.avoidHotNames,
                avoidHomophone: prefData.avoidHomophone,
              }
            : undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'analysis') {
                fullText += parsed.content;
                setAnalysisText(fullText);
              } else if (parsed.type === 'names') {
                // names 已在前端生成，忽略
              }
            } catch {
              fullText += data;
              setAnalysisText(fullText);
            }
          }
        }
      }

      saveNames({ analysis: fullText, names: [] });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setAnalysisText('AI分析暂时不可用，请稍后重试');
      }
    } finally {
      setIsStreaming(false);
    }
  };

  /* ================================================================
     收藏 / 复制 / Toast
     ================================================================ */
  const toggleFavorite = (given: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(given)) next.delete(given);
      else next.add(given);
      return next;
    });
  };

  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      showToast(`已复制「${name}」`);
    } catch {
      showToast('复制失败');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const restartFlow = () => {
    localStorage.removeItem('tianyan_input');
    localStorage.removeItem('tianyan_bazi');
    localStorage.removeItem('tianyan_preference');
    localStorage.removeItem('tianyan_names');
    router.push('/name/input');
  };

  /* ================================================================
     评分圆环
     ================================================================ */
  const ScoreRing = ({ score }: { score: number }) => {
    const r = 30;
    const circ = 2 * Math.PI * r;
    const filled = (score / 100) * circ;
    const strokeColor = score >= 93 ? '#c8a45c' : score >= 88 ? '#e8d09a' : '#a89e8e';

    return (
      <div className="relative w-[56px] h-[56px] md:w-[76px] md:h-[76px] flex-shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(200,164,92,0.08)" strokeWidth="3" />
          <circle
            cx="38" cy="38" r={r} fill="none"
            stroke={strokeColor} strokeWidth="3"
            strokeDasharray={`${filled.toFixed(1)} ${circ.toFixed(1)}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-serif font-bold text-sm md:text-xl glow-score" style={{ color: '#e8d09a' }}>
          {score}
        </span>
      </div>
    );
  };

  /* ================================================================
     重名率标签
     ================================================================ */
  const RarityBadge = ({ level, small }: { level: string; small?: boolean }) => {
    const c = RARITY_COLOR[level] || RARITY_COLOR['中'];
    return (
      <span
        className="inline-flex items-center gap-1 rounded"
        style={{
          padding: small ? '1px 5px' : '2px 10px',
          fontSize: small ? '8px' : '10px',
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
        }}
      >
        <Fingerprint className="w-1.5 h-1.5" />
        重名{level}
      </span>
    );
  };

  /* ================================================================
     重名率进度条
     ================================================================ */
  const RarityBar = ({ level, barPct }: { level: string; barPct: number }) => {
    const c = RARITY_COLOR[level] || RARITY_COLOR['中'];
    return (
      <div className="h-1 rounded-[2px] w-[72px] max-w-[72px] overflow-hidden" style={{ background: 'rgba(200,164,92,0.06)' }}>
        <div
          className="h-full rounded-[2px] transition-all duration-1000 ease-out"
          style={{ width: cardsRevealed ? `${barPct}%` : '0%', background: `linear-gradient(90deg, ${c.fill}44, ${c.fill})` }}
        />
      </div>
    );
  };

  /* ================================================================
     信息回显条
     ================================================================ */
  const InfoRecap = () => {
    if (!input || !bazi) return null;
    const isUnknown = !input.birthTime || input.unknownTime;
    const shiIdx = parseInt(input.birthTime || '0');
    const shiText = !isUnknown && !isNaN(shiIdx) ? SHICHEN_MAP[shiIdx] : '';

    return (
      <div
        className="rounded-sm px-6 py-3 mb-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] animate-fade-in-up"
        style={{ background: 'rgba(200,164,92,0.03)', border: '1px solid rgba(200,164,92,0.08)' }}
      >
        {/* 姓氏 */}
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold" style={{ color: '#e8d09a' }}>{surname}</span>
        </div>
        <span style={{ color: 'rgba(200,164,92,0.15)' }}>|</span>
        {/* 性别 */}
        <span>{genderText}</span>
        <span style={{ color: 'rgba(200,164,92,0.15)' }}>|</span>
        {/* 日期 */}
        <div>
          {input.birthDate.replace(/-/g, (m, i) => {
            if (i === 4) return '年';
            if (i === 7) return '月';
            return m;
          })}
          日{shiText ? ` ${shiText}` : ''}
        </div>
        <span style={{ color: 'rgba(200,164,92,0.15)' }}>|</span>
        {/* 日主 */}
        <div>
          日主<span className="font-serif font-bold ml-1" style={{ color: '#e8d09a' }}>{dayGan}</span>属{dayWx}
        </div>
        <span style={{ color: 'rgba(200,164,92,0.15)' }}>|</span>
        {/* 喜用 */}
        <div className="flex items-center gap-1">
          喜用{' '}
          {xiList.map((wx, i) => (
            <WuxingTag key={wx + "-" + i} wuxing={wx} />
          ))}
        </div>
      </div>
    );
  };

  /* ================================================================
     名字卡片
     ================================================================ */
  const NameCard = ({ n, idx, isTop }: { n: EnrichedName; idx: number; isTop: boolean }) => {
    const isFav = favorites.has(n.given);

    return (
      <div
        id={`nameCard-${idx}`}
        className={`name-card rounded-sm p-5 md:p-6 transition-all duration-500 cursor-pointer ${
          isTop ? 'is-top' : ''
        } ${cardsRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.97]'}`}
        style={{ transitionDelay: cardsRevealed ? `${idx * 180}ms` : '0ms' }}
        onClick={() => router.push(`/name/detail?id=${idx}`)}
      >
        <div className="flex items-start gap-4 md:gap-6">
          {/* 评分环 */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <ScoreRing score={n.score} />
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            {/* 名字 + 标签 */}
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.15em]" style={{ color: '#e8d09a' }}>
                {n.fullName}
              </span>
              {isTop && (
                <span
                  className="inline-flex items-center gap-1 rounded px-2.5 py-0.5"
                  style={{ fontSize: '10px', background: 'rgba(200,164,92,0.12)', color: '#c8a45c', border: '1px solid rgba(200,164,92,0.3)' }}
                >
                  <Star className="w-2 h-2" /> 命理最优
                </span>
              )}
              <RarityBadge level={n.rarity.level} />
            </div>

            {isTop && (
              <div className="text-[10px] mt-0.5" style={{ color: '#a89e8e' }}>
                喜用神{n.matchCount >= 2 ? '双匹配' : '匹配'} · 五行补益最强
              </div>
            )}

            <div className="text-[11px] mb-2.5 mt-1" style={{ color: '#a89e8e' }}>
              {n.pinyin} · {n.style} · 出{n.source}
            </div>

            {/* 释义 */}
            <p className="text-[13px] mb-3 font-serif leading-[1.85]" style={{ color: '#e8e0d4' }}>
              &ldquo;{n.meaning}&rdquo;
            </p>

            {/* 五行补益 + 优势 */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px]" style={{ color: '#a89e8e' }}>五行补益</span>
                {n.wx.map((w, i) => (
                  <WuxingTag key={w + "-" + String(i)} wuxing={w} />
                ))}
                {n.matchCount > 0 && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(129,199,132,0.1)', color: '#81c784', border: '1px solid rgba(129,199,132,0.2)' }}
                  >
                    喜用匹配
                  </span>
                )}
                <span className="text-[10px]" style={{ color: '#a89e8e' }}>{n.wxBenefit}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: '#a89e8e' }}>核心优势</span>
                <span className="text-[10px]" style={{ color: '#e8e0d4' }}>{n.advantage}</span>
              </div>
            </div>

            {/* 重名率 */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px]" style={{ color: '#a89e8e' }}>重名率</span>
              <RarityBar level={n.rarity.level} barPct={n.rarity.barPct} />
              <RarityBadge level={n.rarity.level} small />
              <span className="text-[10px]" style={{ color: '#a89e8e' }}>
                全国约 {n.rarity.count.toLocaleString()} 人
              </span>
            </div>

            {/* 操作 */}
            <div className="flex items-center gap-5">
              <Link
                href={`/name/detail?id=${idx}`}
                className="text-[11px] font-serif tracking-wider flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: '#c8a45c' }}
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowRight className="w-2.5 h-2.5" /> 查看详情
              </Link>
              <button
                className="text-[11px] flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: '#a89e8e' }}
                onClick={(e) => { e.stopPropagation(); copyName(n.fullName); }}
              >
                <Copy className="w-2.5 h-2.5" /> 复制
              </button>
              <button
                className={`text-[11px] flex items-center gap-1 transition-colors ${
                  isFav ? '' : 'hover:text-gold-400'
                }`}
                style={{ color: isFav ? '#c4564a' : '#a89e8e' }}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(n.given); }}
              >
                <Heart className={`w-2.5 h-2.5 ${isFav ? 'fill-current' : ''}`} />
                {isFav ? '已收藏' : '收藏'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ================================================================
     名字卡片样式（局部 CSS-in-JS）
     ================================================================ */
  const nameCardCSS = `
    .name-card {
      background: linear-gradient(155deg, rgba(200,164,92,0.07) 0%, rgba(200,164,92,0.01) 100%);
      border: 1px solid rgba(200,164,92,0.16);
      position: relative;
      overflow: hidden;
    }
    .name-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c8a45c, transparent);
    }
    .name-card:hover {
      border-color: rgba(200,164,92,0.3);
      background: rgba(200,164,92,0.07);
      box-shadow: 0 16px 48px rgba(200,164,92,0.05);
    }
    .name-card.is-top {
      border-color: rgba(200,164,92,0.28);
      background: linear-gradient(155deg, rgba(200,164,92,0.1) 0%, rgba(200,164,92,0.02) 100%);
    }
    .name-card.is-top::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(200,164,92,0.12), transparent);
    }
    /* AI 步骤样式 */
    .ai-step {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      opacity: 0;
      transform: translateY(6px);
      transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
    }
    .ai-step.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .ai-step-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #8c6c24;
      margin-top: 7px;
      flex-shrink: 0;
      transition: background 0.3s;
    }
    .ai-step.done .ai-step-dot { background: #c8a45c; }
    .ai-step-text {
      flex: 1;
      font-size: 12px;
      line-height: 1.8;
      color: #a89e8e;
    }
    .ai-step.done .ai-step-text { color: #e8e0d4; }
    .ai-step-check {
      color: #c8a45c;
      font-size: 10px;
      margin-left: 3px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .ai-step.done .ai-step-check { opacity: 1; }
    /* 前奏卡片 */
    .prelude-card {
      transition: max-height 0.5s cubic-bezier(0.23,1,0.32,1), padding 0.4s ease, border-color 0.4s ease;
      max-height: 400px;
      overflow: hidden;
    }
    .prelude-card.compact {
      max-height: 42px;
      padding-top: 10px !important;
      padding-bottom: 10px !important;
      border-color: rgba(200,164,92,0.1) !important;
    }
    .prelude-card.compact .prelude-steps { display: none; }
    .prelude-card.compact .prelude-scan { display: none; }
    .prelude-card.compact .prelude-corners { display: none; }
    .prelude-summary {
      display: none;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #a89e8e;
    }
    .prelude-card.compact .prelude-summary { display: flex; }
    .prelude-card.compact .prelude-header { margin-bottom: 0; }
    /* 对比条 */
    .compare-bar {
      display: flex;
      gap: 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .compare-bar::-webkit-scrollbar { display: none; }
    .compare-item {
      flex-shrink: 0;
      padding: 10px 20px;
      border-right: 1px solid rgba(200,164,92,0.08);
      text-align: center;
      min-width: 120px;
      transition: all 0.3s;
      cursor: pointer;
    }
    .compare-item:last-child { border-right: none; }
    .compare-item:hover { background: rgba(200,164,92,0.05); }
    .compare-item.active { background: rgba(200,164,92,0.08); }
    @media (max-width: 767px) {
      .compare-item { min-width: 90px; padding: 8px 12px; }
    }
    /* 解锁区 */
    .unlock-blur-area {
      filter: blur(1.5px);
      transition: filter 0.3s;
      pointer-events: none;
      user-select: none;
    }
    .unlock-overlay {
      position: absolute;
      inset: 0;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 36px;
      background: linear-gradient(180deg, rgba(10,8,6,0) 0%, rgba(10,8,6,0.45) 35%, rgba(10,8,6,0.92) 100%);
    }
    /* Toast */
    .toast {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      padding: 14px 22px;
      background: rgba(200,164,92,0.12);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(200,164,92,0.22);
      color: #e8e0d4;
      font-size: 13px;
      border-radius: 6px;
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.23,1,0.32,1);
    }
    .toast.show { transform: translateX(0); }
  `;

  /* ================================================================
     渲染
     ================================================================ */
  if (!bazi) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0806' }}>
      <style dangerouslySetInnerHTML={{ __html: nameCardCSS }} />

      <SubHeader title="AI起名结果" stepLabel="[4/4]" backHref="/name/preference" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        {/* 进度条 */}
        <div className="animate-fade-in-up">
          <StepIndicator steps={STEPS} currentStep={3} />
        </div>

        {/* 信息回显条 */}
        <InfoRecap />

        {/* 章节标题：柒·良名推荐 */}
        <div className="text-center mb-8 animate-fade-in-up stagger-2">
          <div
            className="font-serif text-4xl md:text-5xl font-bold tracking-[0.15em] mb-3 glow-gold-strong"
            style={{ color: '#e8d09a' }}
          >
            柒
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wider mb-2" style={{ color: '#e8e0d4' }}>
            良名推荐
          </h2>
          <p className="font-serif text-sm tracking-wider mb-3" style={{ color: '#a89e8e', fontWeight: 300 }}>
            天机衍万象，一名定乾坤
          </p>
          <GoldLine className="max-w-[60px] mx-auto mb-3" />
          <p className="text-xs" style={{ color: '#a89e8e' }}>
            AI基于八字命盘与您的偏好推演而得，重名率越低越独特
          </p>
        </div>

        {/* AI 前奏卡片 */}
        <div
          className={`relative rounded-sm p-4 md:p-5 mb-5 animate-fade-in-up stagger-3 prelude-card ${
            aiCompact ? 'compact' : ''
          }`}
          style={{
            border: '1px solid rgba(200,164,92,0.22)',
            background: 'linear-gradient(160deg, rgba(200,164,92,0.05) 0%, rgba(200,164,92,0.01) 100%)',
            animation: !aiDone ? 'border-pulse 2.5s ease-in-out infinite' : 'none',
          }}
        >
          {/* 科技感装饰角 */}
          {!aiCompact && (
            <div className="prelude-corners">
              <span className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 pointer-events-none z-10" style={{ borderColor: 'rgba(200,164,92,0.45)' }} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 pointer-events-none z-10" style={{ borderColor: 'rgba(200,164,92,0.45)' }} />
              <span className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 pointer-events-none z-10" style={{ borderColor: 'rgba(200,164,92,0.45)' }} />
              <span className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 pointer-events-none z-10" style={{ borderColor: 'rgba(200,164,92,0.45)' }} />
            </div>
          )}

          {/* 扫描线 */}
          {!aiCompact && (
            <div
              className="prelude-scan absolute left-2.5 right-2.5 h-px pointer-events-none z-10"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(200,164,92,0.55), rgba(200,164,92,0.55), transparent)',
                animation: 'scan-line 3.5s ease-in-out infinite',
              }}
            />
          )}

          {/* 头部 */}
          <div className="prelude-header flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(200,164,92,0.1)', border: '1px solid rgba(200,164,92,0.2)' }}
              >
                <Cpu className="w-3 h-3" style={{ color: '#c8a45c' }} />
              </div>
              <span className="font-serif text-xs font-semibold tracking-wider" style={{ color: '#e8d09a' }}>
                AI 推衍过程
              </span>
              <span className="text-[10px] tracking-wider" style={{ color: aiDone ? '#c8a45c' : '#a89e8e' }}>
                {aiDone ? '完成' : '分析中...'}
              </span>
            </div>
            {!aiDone && (
              <button
                className="text-[11px] px-3 py-1 rounded-sm transition-colors hover:text-gold-400"
                style={{ color: '#a89e8e' }}
                onClick={skipAI}
              >
                <SkipForward className="w-2.5 h-2.5 inline mr-1" />
                跳过
              </button>
            )}
          </div>

          {/* 步骤列表 */}
          <div className="prelude-steps space-y-2">
            {aiSteps.map((step, idx) => (
              <div
                key={idx}
                className={`ai-step ${aiStepDone[idx] ? 'visible' : ''} ${aiStepDone[idx] && idx < aiSteps.length - 1 || (aiDone && aiStepDone[idx]) ? 'done' : ''}`}
              >
                <div className="ai-step-dot" />
                <div className="ai-step-text flex items-center gap-1">
                  <span style={{ color: '#8c6c24' }}>{step.icon}</span>
                  <span>{step.text}</span>
                </div>
                <span className="ai-step-check">
                  <CheckCircle className="w-2.5 h-2.5" />
                </span>
              </div>
            ))}
          </div>

          {/* 折叠后摘要 */}
          <div className="prelude-summary">
            <CheckCircle className="w-2.5 h-2.5" style={{ color: '#c8a45c' }} />
            <span>喜用{xiList.join('、')} · 筛选自12,800字 · 排序完成</span>
          </div>
        </div>

        {/* 对比摘要条 */}
        {compareBarVisible && visibleNames.length > 0 && (
          <div
            className="rounded-sm mb-5 overflow-hidden animate-fade-in-up"
            style={{ border: '1px solid rgba(200,164,92,0.08)', background: 'rgba(200,164,92,0.02)' }}
          >
            <div className="compare-bar">
              {visibleNames.map((n, idx) => (
                <div
                  key={n.given}
                  className={`compare-item ${activeCompare === idx ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCompare(idx);
                    const el = document.getElementById(`nameCard-${idx}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <div className="font-serif text-sm font-bold tracking-wider mb-1" style={{ color: '#e8d09a' }}>
                    {n.fullName}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {n.wx.map((w, i) => (
                      <WuxingTag key={w + "-" + String(i)} wuxing={w} />
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-serif text-xs font-bold glow-score" style={{ color: '#e8d09a' }}>
                      {n.score}
                    </span>
                    <RarityBadge level={n.rarity.level} small />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 名字卡片列表 */}
        <div className="space-y-4">
          {visibleNames.map((n, idx) => (
            <NameCard key={n.given + idx} n={n} idx={idx} isTop={idx === 0} />
          ))}
        </div>

        {/* AI 分析文字区域（流式打字机效果） */}
        {analysisText && (
          <div className="mt-8 jinming-card rounded-sm p-5">
            <h2 className="text-sm font-serif flex items-center gap-2 mb-3" style={{ color: '#c8a45c' }}>
              <Cpu className="w-3.5 h-3.5" />
              AI 命理深度解析
            </h2>
            <div className="text-sm leading-relaxed min-h-[60px]" style={{ color: '#e8e0d4' }}>
              {analysisText}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: '#c8a45c' }} />
              )}
            </div>
            <p className="text-[10px] mt-3" style={{ color: '#a89e8e' }}>
              以上内容由AI生成，仅供传统文化参考
            </p>
          </div>
        )}

        {/* 捌·解锁区 */}
        <section
          className="mt-12 mb-10"
          style={{
            opacity: unlockRevealed ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          <div className="text-center mb-6">
            <div
              className="font-serif text-3xl font-bold tracking-[0.15em] mb-1.5 glow-gold"
              style={{ color: '#e8d09a' }}
            >
              捌
            </div>
            <h3 className="font-serif text-xl font-bold tracking-wider mb-1" style={{ color: '#e8e0d4' }}>
              更多良名
            </h3>
            <p className="text-[11px]" style={{ color: '#a89e8e' }}>
              解锁完整方案，获取深度解析与专家点评
            </p>
          </div>

          <div className="relative overflow-hidden rounded-md" style={{ border: '1px solid rgba(200,164,92,0.12)' }}>
            {/* 模糊遮罩内容 */}
            <div className="unlock-blur-area p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lockedNames.map((n) => (
                  <div
                    key={n.given}
                    className="rounded-sm p-4"
                    style={{ background: 'rgba(200,164,92,0.04)', border: '1px solid rgba(200,164,92,0.1)' }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-serif text-lg font-bold tracking-wider" style={{ color: '#e8d09a' }}>
                        {n.fullName}
                      </span>
                      <RarityBadge level={n.rarity.level} small />
                    </div>
                    <div className="text-[10px] mb-2" style={{ color: '#a89e8e' }}>
                      {n.pinyin} · {n.style}
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      {n.wx.map((w, i) => (
                        <WuxingTag key={w + "-" + String(i)} wuxing={w} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 rounded-[2px] w-[50px] overflow-hidden" style={{ background: 'rgba(200,164,92,0.06)' }}>
                        <div
                          className="h-full rounded-[2px]"
                          style={{
                            width: `${n.rarity.barPct}%`,
                            background: `linear-gradient(90deg, ${RARITY_COLOR[n.rarity.level]?.fill || '#e8d09a'}44, ${RARITY_COLOR[n.rarity.level]?.fill || '#e8d09a'})`,
                          }}
                        />
                      </div>
                      <span className="text-[9px]" style={{ color: '#a89e8e' }}>
                        约{n.rarity.count}人
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 解锁遮罩 */}
            <div className="unlock-overlay">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3.5 h-3.5" style={{ color: '#c8a45c' }} />
                <span className="font-serif text-sm tracking-wider" style={{ color: '#e8d09a' }}>
                  解锁完整起名方案
                </span>
              </div>
              <p className="text-[11px] mb-3 text-center max-w-xs" style={{ color: '#a89e8e' }}>
                解锁后查看全部名字、详细五行分析、专家点评及三才五格完整报告
              </p>
              <div className="flex items-center gap-3 mb-3">
                <button className="btn-vermilion px-7 py-2.5 rounded-sm font-serif text-[12px] tracking-[0.15em] flex items-center gap-2" disabled style={{ opacity: 0.7 }}>
                  <Unlock className="w-2.5 h-2.5" />
                  即将上线
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 合规标识 */}
        <div className="text-center mb-6">
          <p className="text-[10px]" style={{ color: '#5c5347' }}>
            以上内容由AI生成，仅供传统文化参考
          </p>
        </div>

        {/* 底部操作 */}
        <div style={{ opacity: unlockRevealed ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          <GoldLine className="mb-6" />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/name/preference"
                className="btn-outline-gold px-5 py-2.5 rounded-sm text-[11px] font-serif tracking-wider flex items-center gap-1.5"
              >
                <ArrowLeft className="w-2.5 h-2.5" /> 修改偏好
              </Link>
              <button
                className="btn-outline-gold px-5 py-2.5 rounded-sm text-[11px] font-serif tracking-wider flex items-center gap-1.5"
                onClick={restartFlow}
              >
                <RotateCcw className="w-2.5 h-2.5" /> 重新起名
              </button>
            </div>
            <Link
              href="/test-name"
              className="px-4 py-2 rounded-sm font-serif tracking-wider text-[11px] flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{ color: '#c4564a' }}
            >
              <Search className="w-2.5 h-2.5" /> 测名评分
            </Link>
          </div>
        </div>
      </main>

      {/* Toast */}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        {toastMsg}
      </div>
    </div>
  );
}
