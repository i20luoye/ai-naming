'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Scale,
  Gem,
  Target,
  SlidersHorizontal,
  Info,
  AlertCircle,
} from 'lucide-react';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import { loadInput, saveBazi } from '@/lib/storage';
import type { BaziData } from '@/lib/storage';

// ===== 常量 =====
const WUXING_COLORS: Record<string, string> = {
  '金': '#e8d09a',
  '木': '#81c784',
  '水': '#64b5f6',
  '火': '#d4726a',
  '土': '#d4c4a0',
};

const WUXING_TAILWIND: Record<string, string> = {
  '金': 'text-wuxing-jin',
  '木': 'text-wuxing-mu',
  '水': 'text-wuxing-shui',
  '火': 'text-wuxing-huo',
  '土': 'text-wuxing-tu',
};

const WUXING_BAR: Record<string, string> = {
  '金': 'wx-bar-jin',
  '木': 'wx-bar-mu',
  '水': 'wx-bar-shui',
  '火': 'wx-bar-huo',
  '土': 'wx-bar-tu',
};

const WUXING_RGB: Record<string, string> = {
  '金': '232,208,154',
  '木': '129,199,132',
  '水': '100,181,246',
  '火': '212,114,106',
  '土': '212,196,160',
};

const NAYIN_TABLE: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂石金', '乙未': '砂石金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙辰': '沙中土', '丁巳': '沙中土',
  '戊午': '天上火', '己未': '天上火', '庚申': '石榴木', '辛酉': '石榴木',
  '壬戌': '大海水', '癸亥': '大海水',
};

const WUXING_SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const WUXING_KE: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
const WUXING_BEI_SHENG: Record<string, string> = { '火': '木', '土': '火', '金': '土', '水': '金', '木': '水' };
const WUXING_BEI_KE: Record<string, string> = { '土': '木', '金': '火', '水': '土', '木': '金', '火': '水' };

const SURNAMES_WX: Record<string, string> = {
  '王': '土', '李': '木', '张': '火', '刘': '金', '陈': '土', '杨': '木', '黄': '土', '赵': '火',
  '周': '金', '吴': '木', '徐': '金', '孙': '水', '马': '火', '朱': '火', '胡': '土', '郭': '木',
  '何': '木', '林': '木', '罗': '火', '梁': '火', '宋': '金', '郑': '土', '谢': '金', '韩': '水',
  '唐': '土', '冯': '水', '董': '木', '萧': '木', '程': '火', '曹': '金', '袁': '土', '邓': '火',
};

function guessWuxing(c: string): string {
  const codes = ['金', '木', '水', '火', '土'];
  let h = 0;
  for (let i = 0; i < c.length; i++) h = c.charCodeAt(i) + ((h << 5) - h);
  return codes[Math.abs(h) % 5];
}

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

// ===== 类型 =====
interface ApiPillar {
  pillar: string;
  gan: string;
  zhi: string;
  ganWuxing: string;
  zhiWuxing: string;
  cangGan: string[];
}

interface ApiBaziResult {
  pillars: ApiPillar[];
  wuxingCount: Record<string, number>;
  wuxingPercent: Record<string, number>;
  dayMaster: string;
  dayMasterWuxing: string;
  strength: '旺' | '弱';
  xiYong: string[];
  jiShen: string[];
  pattern: string;
}

// ===== 主组件 =====
export default function NameBaziPage() {
  const router = useRouter();
  const [bazi, setBazi] = useState<ApiBaziResult | null>(null);
  const [inputData, setInputData] = useState<ReturnType<typeof loadInput>>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [pillarRevealed, setPillarRevealed] = useState([false, false, false, false]);
  const [barAnimated, setBarAnimated] = useState(false);
  const [strengthAnimated, setStrengthAnimated] = useState(false);
  const [xiAnimated, setXiAnimated] = useState(false);
  const loadAttempted = useRef(false);

  // Load data on mount
  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    async function load() {
      const input = loadInput();
      if (!input) {
        setLoadError('未找到输入数据');
        setLoading(false);
        return;
      }
      setInputData(input);

      // Try to load cached bazi data from localStorage
      const cachedRaw = localStorage.getItem('tianyan_bazi');
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw) as ApiBaziResult;
          if (cached.pillars && cached.pillars.length === 4) {
            setBazi(cached);
            setLoading(false);
            return;
          }
        } catch { /* ignore */ }
      }

      // Call API
      try {
        const res = await fetch('/api/bazi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate: input.birthDate, birthTime: input.birthTime }),
        });
        const data = await res.json();
        if (data.success) {
          setBazi(data.data);
          localStorage.setItem('tianyan_bazi', JSON.stringify(data.data));
        } else {
          setLoadError(data.error || '排盘计算失败');
        }
      } catch {
        setLoadError('网络错误，请检查连接后重试');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Staggered reveal after loading
  useEffect(() => {
    if (loading || !bazi) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    // Main sections fade in
    timers.push(setTimeout(() => setRevealed(true), 100));
    // Pillars stagger
    [0, 1, 2, 3].forEach(i => {
      timers.push(setTimeout(() => {
        setPillarRevealed(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 700 + i * 150));
    });
    // Bar chart
    timers.push(setTimeout(() => setBarAnimated(true), 1600));
    // Strength meter
    timers.push(setTimeout(() => setStrengthAnimated(true), 2300));
    // Xi tags
    timers.push(setTimeout(() => setXiAnimated(true), 2600));

    return () => timers.forEach(clearTimeout);
  }, [loading, bazi]);

  // ===== Loading state =====
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-ink-900 flex flex-col items-center justify-center">
        <div className="relative w-[100px] h-[100px]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ animation: 'astrolabe-spin 150s linear infinite, astrolabe-breathe 6s ease-in-out infinite' }}>
            <circle cx="50" cy="50" r="46" fill="none" stroke="#c8a45c" strokeWidth="0.5" opacity="0.15" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#c8a45c" strokeWidth="0.4" opacity="0.1" strokeDasharray="2 4" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="#c8a45c" strokeWidth="0.3" opacity="0.08" strokeDasharray="1.5 5" />
            <line x1="50" y1="4" x2="50" y2="96" stroke="#c8a45c" strokeWidth="0.3" opacity="0.08" strokeDasharray="2 4" />
            <line x1="50" y1="4" x2="50" y2="96" stroke="#c8a45c" strokeWidth="0.3" opacity="0.08" strokeDasharray="2 4" transform="rotate(45 50 50)" />
            <line x1="50" y1="4" x2="50" y2="96" stroke="#c8a45c" strokeWidth="0.3" opacity="0.08" strokeDasharray="2 4" transform="rotate(90 50 50)" />
            <line x1="50" y1="4" x2="50" y2="96" stroke="#c8a45c" strokeWidth="0.3" opacity="0.08" strokeDasharray="2 4" transform="rotate(135 50 50)" />
          </svg>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-35" style={{ animation: 'taiji-spin 8s linear infinite' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(200,164,92,0.2)" strokeWidth="0.5" />
            <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2" fill="rgba(200,164,92,0.5)" />
            <path d="M50 2 A48 48 0 0 0 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2" fill="rgba(232,224,212,0.1)" />
            <circle cx="50" cy="26" r="5" fill="rgba(232,224,212,0.1)" />
            <circle cx="50" cy="74" r="5" fill="rgba(200,164,92,0.5)" />
          </svg>
        </div>
        <div className="font-serif text-lg tracking-[0.3em] mt-8 mb-3 text-gold-200" style={{ animation: 'loading-pulse 1.8s ease-in-out infinite' }}>
          正在推演命盘
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-300">
          <span style={{ animation: 'dot-blink 1.2s ease-in-out infinite' }}>排四柱</span>
          <span>·</span>
          <span style={{ animation: 'dot-blink 1.2s ease-in-out infinite 0.2s' }}>析五行</span>
          <span>·</span>
          <span style={{ animation: 'dot-blink 1.2s ease-in-out infinite 0.4s' }}>定喜用</span>
        </div>
      </div>
    );
  }

  // ===== Error state =====
  if (loadError || !bazi) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ink-900 px-6">
        <AlertCircle className="w-10 h-10 text-vermilion-light mb-4" />
        <p className="text-ink-200 text-sm mb-4">{loadError || '未找到排盘数据，请重新输入信息'}</p>
        <Link href="/name/input" className="btn-outline-gold px-6 py-2.5 rounded-lg font-serif text-sm tracking-wider">
          返回输入
        </Link>
      </div>
    );
  }

  // ===== Derived data =====
  const isUnknownTime = inputData?.unknownTime ?? false;
  const isStrong = bazi.strength === '旺';

  // Count wuxing from pillars (simplified raw count for display)
  const wxRawCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  for (const p of bazi.pillars) {
    wxRawCount[p.ganWuxing]++;
    wxRawCount[p.zhiWuxing]++;
  }

  // Strength calculation for meter (using wuxingCount from API)
  const totalWxCount = Object.values(bazi.wuxingCount).reduce((a, b) => a + b, 0);
  const dayWx = bazi.dayMasterWuxing;
  const shengWx = WUXING_BEI_SHENG[dayWx];
  const helpCount = (bazi.wuxingCount[dayWx] || 0) + (bazi.wuxingCount[shengWx] || 0);
  const restrainCount = totalWxCount - helpCount;
  const strengthRatio = totalWxCount > 0 ? helpCount / totalWxCount : 0.5;
  const strengthPct = Math.round(strengthRatio * 100);

  const surnameWx = SURNAMES_WX[inputData?.surname ?? ''] || guessWuxing(inputData?.surname ?? '张');

  // Nayin
  const nayinList = bazi.pillars.map(p => NAYIN_TABLE[p.gan + p.zhi] || '—');

  // Wuxing sorted for bar chart
  const wxList = ['金', '木', '水', '火', '土'];
  const maxWxCount = Math.max(...wxList.map(w => wxRawCount[w]), 1);

  // ===== Helpers =====
  function getGenderText(g?: string) {
    if (g === 'male') return '男';
    if (g === 'female') return '女';
    return '';
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y}年${m}月${d}日`;
  }

  function formatTime(timeStr?: string) {
    if (!timeStr) return '';
    const hour = parseInt(timeStr.split(':')[0]);
    const shiNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
    const idx = Math.floor(((hour + 1) % 24) / 2);
    return shiNames[idx] || '';
  }

  // ===== Sections visibility =====
  const sectionBase = 'transition-all duration-700 ease-out';
  const sectionHidden = 'opacity-0 translate-y-6';
  const sectionVisible = 'opacity-100 translate-y-0';

  // ===== Save bazi to storage helper =====
  const handleGoPreference = () => {
    // Convert API result to BaziData format for storage
    const baziData: BaziData = {
      pillars: bazi.pillars.map(p => ({
        pillar: p.pillar,
        gan: p.gan,
        zhi: p.zhi,
        ganWuxing: p.ganWuxing,
        zhiWuxing: p.zhiWuxing,
        cangGan: p.cangGan,
      })),
      wuxingPercent: bazi.wuxingPercent,
      dayMaster: bazi.dayMaster,
      dayMasterWuxing: bazi.dayMasterWuxing,
      strength: bazi.strength,
      xiYong: bazi.xiYong,
      jiShen: bazi.jiShen,
      pattern: bazi.pattern,
    };
    saveBazi(baziData);
    router.push('/name/preference');
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <style>{`
        @keyframes astrolabe-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes astrolabe-breathe { 0%,100% { opacity: 0.08; } 50% { opacity: 0.14; } }
        @keyframes taiji-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes loading-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes dot-blink { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes scan-line { 0% { top: -2px; opacity: 0; } 8% { opacity: 0.8; } 92% { opacity: 0.8; } 100% { top: calc(100% + 2px); opacity: 0; } }
        @keyframes pulse-border { 0%,100% { border-color: rgba(200,164,92,0.22); box-shadow: 0 0 0 rgba(200,164,92,0); } 50% { border-color: rgba(200,164,92,0.55); box-shadow: 0 0 20px rgba(200,164,92,0.06); } }
        @keyframes shimmer { 0%,100% { opacity: 0; } 50% { opacity: 1; } }
        @keyframes node-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(200,164,92,0.35); } 50% { box-shadow: 0 0 0 10px rgba(200,164,92,0); } }

        .wx-bar-jin { background: linear-gradient(90deg, rgba(232,208,154,0.3), rgba(232,208,154,0.7)); }
        .wx-bar-mu { background: linear-gradient(90deg, rgba(129,199,132,0.3), rgba(129,199,132,0.7)); }
        .wx-bar-shui { background: linear-gradient(90deg, rgba(100,181,246,0.3), rgba(100,181,246,0.7)); }
        .wx-bar-huo { background: linear-gradient(90deg, rgba(212,114,106,0.3), rgba(212,114,106,0.7)); }
        .wx-bar-tu { background: linear-gradient(90deg, rgba(212,196,160,0.3), rgba(212,196,160,0.7)); }

        .tech-corners { position: relative; }
        .corner { position: absolute; width: 18px; height: 18px; pointer-events: none; z-index: 2; }
        .corner-tl { top: 8px; left: 8px; border-top: 2px solid rgba(200,164,92,0.5); border-left: 2px solid rgba(200,164,92,0.5); }
        .corner-tr { top: 8px; right: 8px; border-top: 2px solid rgba(200,164,92,0.5); border-right: 2px solid rgba(200,164,92,0.5); }
        .corner-bl { bottom: 8px; left: 8px; border-bottom: 2px solid rgba(200,164,92,0.5); border-left: 2px solid rgba(200,164,92,0.5); }
        .corner-br { bottom: 8px; right: 8px; border-bottom: 2px solid rgba(200,164,92,0.5); border-right: 2px solid rgba(200,164,92,0.5); }

        .tech-scan::after {
          content: ''; position: absolute; left: 12px; right: 12px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.6), rgba(200,164,92,0.6), transparent);
          animation: scan-line 3.5s ease-in-out infinite; pointer-events: none; z-index: 2;
        }
      `}</style>

      <SubHeader title="八字排盘" stepLabel="[2/4]" backHref="/name/input" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-6 pb-16">
        <StepIndicator steps={steps} currentStep={1} />

        {/* ====== 信息回显 ====== */}
        <div
          className={`mt-8 mb-10 rounded-sm px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}
          style={{ background: 'rgba(200,164,92,0.03)', border: '1px solid rgba(200,164,92,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gold-600">●</span>
            <span className="font-serif text-gold-200">{inputData?.surname}</span>
          </div>
          <span className="text-gold-400/15">|</span>
          <span>{getGenderText(inputData?.gender)}</span>
          <span className="text-gold-400/15">|</span>
          <div>
            <span className="text-[10px] text-gold-600 mr-1">◉</span>
            {formatDate(inputData?.birthDate)}
            {!isUnknownTime && inputData?.birthTime && (
              <span className="ml-1">{formatTime(inputData.birthTime)}</span>
            )}
          </div>
          {inputData?.birthCity && (
            <>
              <span className="text-gold-400/15">|</span>
              <div>
                <span className="text-[10px] text-gold-600 mr-1">◎</span>
                {inputData.birthCity}
              </div>
            </>
          )}
          {isUnknownTime && (
            <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-sans bg-gold-400/10 border border-dashed border-gold-400/30 text-gold-400">
              时辰未定
            </span>
          )}
        </div>

        {/* ====== 壹 · 八字命盘 ====== */}
        <section className="mb-12">
          <div className={`text-center mb-8 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}>
            <div className="font-serif text-4xl font-bold tracking-[0.15em] mb-2 glow-gold text-gold-200">壹</div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wider mb-2 text-ink-100">八字命盘</h2>
            <p className="text-xs text-ink-300">年柱根、月柱苗、日柱花、时柱果</p>
          </div>

          <div
            className={`tech-corners tech-scan rounded-sm p-6 md:p-8 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}
            style={{
              background: 'linear-gradient(160deg, rgba(200,164,92,0.05) 0%, rgba(200,164,92,0.01) 100%)',
              border: '1px solid rgba(200,164,92,0.22)',
              animation: 'pulse-border 2.5s ease-in-out infinite',
            }}
          >
            <span className="corner corner-tl" />
            <span className="corner corner-tr" />
            <span className="corner corner-bl" />
            <span className="corner corner-br" />

            {/* 日主高亮提示 */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-[11px] tracking-wider text-ink-300">日主</span>
              <span className="font-serif text-lg font-bold glow-gold text-gold-200">{bazi.dayMaster}</span>
              <WuxingTag wuxing={bazi.dayMasterWuxing} />
            </div>

            {/* 四柱：居中 grid */}
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {bazi.pillars.map((p, idx) => {
                  const isDay = idx === 2;
                  const isEst = idx === 3 && isUnknownTime;
                  return (
                    <div
                      key={p.pillar}
                      className={`rounded-sm p-4 md:p-5 text-center transition-all duration-600 ${pillarRevealed[idx] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                      style={{
                        background: isDay
                          ? 'rgba(200,164,92,0.09)'
                          : 'linear-gradient(160deg, rgba(200,164,92,0.07) 0%, rgba(200,164,92,0.01) 100%)',
                        border: `1px solid ${isDay ? 'rgba(200,164,92,0.35)' : 'rgba(200,164,92,0.15)'}`,
                        borderStyle: isEst ? 'dashed' : 'solid',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top gold line */}
                      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #c8a45c, transparent)' }} />

                      <div className="text-[10px] tracking-wider mb-3 text-ink-300">{p.pillar}</div>

                      {/* 天干地支字块 */}
                      <div className="flex justify-center mb-3">
                        <div>
                          <div
                            className="w-11 h-11 flex items-center justify-center font-serif text-lg font-semibold text-gold-200 transition-all"
                            style={{
                              border: `1px solid rgba(200,164,92,${isEst ? 0.12 : 0.2})`,
                              background: 'rgba(200,164,92,0.05)',
                              borderStyle: isEst ? 'dashed' : 'solid',
                              opacity: isEst ? 0.7 : 1,
                              borderRadius: '5px 5px 0 0',
                              borderBottom: 'none',
                            }}
                          >
                            {p.gan}
                          </div>
                          <div
                            className="w-11 h-11 flex items-center justify-center font-serif text-lg font-semibold text-gold-200 transition-all"
                            style={{
                              border: `1px solid rgba(200,164,92,${isEst ? 0.12 : 0.2})`,
                              background: 'rgba(200,164,92,0.05)',
                              borderStyle: isEst ? 'dashed' : 'solid',
                              opacity: isEst ? 0.7 : 1,
                              borderRadius: '0 0 5px 5px',
                            }}
                          >
                            {p.zhi}
                          </div>
                        </div>
                      </div>

                      {/* 五行标签 */}
                      <div className="flex justify-center gap-1.5">
                        <WuxingTag wuxing={p.ganWuxing}>
                          <span style={{ fontSize: 10 }}>{p.ganWuxing}</span>
                        </WuxingTag>
                        <WuxingTag wuxing={p.zhiWuxing}>
                          <span style={{ fontSize: 10 }}>{p.zhiWuxing}</span>
                        </WuxingTag>
                      </div>

                      {/* 日主标记 */}
                      {isDay && (
                        <div className="mt-2 text-[9px] tracking-wider text-gold-400">★ 日主</div>
                      )}
                      {/* 预估标记 */}
                      {isEst && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-sans bg-gold-400/10 border border-dashed border-gold-400/30 text-gold-400">
                            预估
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 纳音行 */}
            <div className="flex justify-center mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {nayinList.map((ny, i) => (
                  <div key={i} className="text-center">
                    <span className="font-serif text-[11px] text-ink-300">{ny}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 时辰不确定标注 */}
            {isUnknownTime && (
              <div className="text-center mt-5">
                <span className="inline-block px-2 py-1 rounded text-[10px] font-sans bg-gold-400/10 border border-dashed border-gold-400/30 text-gold-400">
                  <Info className="inline w-3 h-3 mr-1" />
                  时辰未定，时柱以午时推算，仅供参考
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ====== 贰 · 五行分布 ====== */}
        <section className="mb-12">
          <div className={`text-center mb-8 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}>
            <div className="font-serif text-4xl font-bold tracking-[0.15em] mb-2 glow-gold text-gold-200">贰</div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wider mb-2 text-ink-100">五行分布</h2>
            <p className="text-xs text-ink-300">金木水火土，生克有定数</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 条形图 */}
            <div
              className={`jinming-card rounded-sm p-6 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="font-serif text-base font-semibold tracking-wider text-gold-200">五行力量</span>
                <span className="text-xs text-ink-300">共 8 字</span>
              </div>

              {wxList.map((wx, wxIdx) => {
                const count = wxRawCount[wx];
                const pct = Math.round((count / 8) * 100);
                const barPct = Math.round((count / maxWxCount) * 100);
                const isLack = count <= 1;
                return (
                  <div key={wx + "-" + String(wxIdx)} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${WUXING_TAILWIND[wx]}`}>●</span>
                        <span className={`font-serif text-sm ${WUXING_TAILWIND[wx]}`}>{wx}</span>
                        {isLack && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(196,86,74,0.1)', color: '#d4726a', border: '1px solid rgba(196,86,74,0.2)' }}>
                            弱
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-serif text-ink-300">{count} 个 · {pct}%</span>
                    </div>
                    <div className="h-2 rounded bg-gold-400/[0.06] overflow-hidden relative">
                      <div
                        className={`h-full rounded transition-all duration-1000 ease-out ${WUXING_BAR[wx]} relative`}
                        style={{ width: barAnimated ? `${barPct}%` : '0%' }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', animation: 'shimmer 2.5s ease-in-out infinite' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 五行圆形分布 — 星盘网格 */}
            <div
              className={`jinming-card rounded-sm p-6 flex items-center justify-center ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}
            >
              <div className="relative w-[280px] h-[280px] mx-auto">
                {/* SVG 星盘背景 */}
                <svg viewBox="0 0 280 280" className="absolute inset-0 w-full h-full pointer-events-none" style={{ animation: 'astrolabe-breathe 6s ease-in-out infinite' }}>
                  {/* Rings */}
                  <circle cx="140" cy="140" r="135" fill="none" stroke="#c8a45c" strokeWidth="0.6" opacity="0.12" />
                  <circle cx="140" cy="140" r="122" fill="none" stroke="#c8a45c" strokeWidth="0.5" opacity="0.09" strokeDasharray="2 6" />
                  <circle cx="140" cy="140" r="108" fill="none" stroke="#c8a45c" strokeWidth="0.5" opacity="0.10" strokeDasharray="5 10" />
                  <circle cx="140" cy="140" r="90" fill="none" stroke="#c8a45c" strokeWidth="0.4" opacity="0.08" strokeDasharray="1.5 8" />
                  <circle cx="140" cy="140" r="72" fill="none" stroke="#c8a45c" strokeWidth="0.4" opacity="0.07" strokeDasharray="3 12" />
                  <circle cx="140" cy="140" r="52" fill="none" stroke="#c8a45c" strokeWidth="0.3" opacity="0.06" strokeDasharray="2 10" />
                  {/* Cross lines */}
                  {[0, 45, 90, 135].map(angle => (
                    <line key={angle} x1="140" y1="5" x2="140" y2="275" stroke="#c8a45c" strokeWidth="0.4" opacity="0.08" strokeDasharray="3 7" transform={`rotate(${angle} 140 140)`} />
                  ))}
                  {/* Outer dots */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
                    const rad = (angle * Math.PI) / 180;
                    return <circle key={`o${angle}`} cx={(140 + 128 * Math.sin(rad)).toFixed(1)} cy={(140 - 128 * Math.cos(rad)).toFixed(1)} r="2.5" fill="#c8a45c" opacity="0.2" />;
                  })}
                  {/* Inner dots */}
                  {Array.from({ length: 24 }, (_, i) => {
                    const angle = (i * 15 * Math.PI) / 180;
                    return <circle key={`i${i}`} cx={(140 + 112 * Math.sin(angle)).toFixed(1)} cy={(140 - 112 * Math.cos(angle)).toFixed(1)} r={i % 3 === 0 ? 2 : 1.5} fill="#c8a45c" opacity="0.12" />;
                  })}
                </svg>

                {/* Center node: 土 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-[2]">
                  <WuxingCircleNode wx="土" count={wxRawCount['土']} isLack={wxRawCount['土'] <= 1} />
                  <span className="text-[11px] text-ink-300 font-sans">{wxRawCount['土']}</span>
                  {wxRawCount['土'] <= 1 && <span className="text-[8px] text-vermilion-light">弱</span>}
                </div>

                {/* 金 - left */}
                <div className="absolute left-[8%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-[2]">
                  <WuxingCircleNode wx="金" count={wxRawCount['金']} isLack={wxRawCount['金'] <= 1} />
                  <span className="text-[11px] text-ink-300 font-sans">{wxRawCount['金']}</span>
                  {wxRawCount['金'] <= 1 && <span className="text-[8px] text-vermilion-light">弱</span>}
                </div>

                {/* 木 - right */}
                <div className="absolute left-[88%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-[2]">
                  <WuxingCircleNode wx="木" count={wxRawCount['木']} isLack={wxRawCount['木'] <= 1} />
                  <span className="text-[11px] text-ink-300 font-sans">{wxRawCount['木']}</span>
                  {wxRawCount['木'] <= 1 && <span className="text-[8px] text-vermilion-light">弱</span>}
                </div>

                {/* 火 - bottom */}
                <div className="absolute left-1/2 top-[88%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-[2]">
                  <WuxingCircleNode wx="火" count={wxRawCount['火']} isLack={wxRawCount['火'] <= 1} />
                  <span className="text-[11px] text-ink-300 font-sans">{wxRawCount['火']}</span>
                  {wxRawCount['火'] <= 1 && <span className="text-[8px] text-vermilion-light">弱</span>}
                </div>

                {/* 水 - top */}
                <div className="absolute left-1/2 top-[8%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-[2]">
                  <WuxingCircleNode wx="水" count={wxRawCount['水']} isLack={wxRawCount['水'] <= 1} />
                  <span className="text-[11px] text-ink-300 font-sans">{wxRawCount['水']}</span>
                  {wxRawCount['水'] <= 1 && <span className="text-[8px] text-vermilion-light">弱</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== 叁 · 命理分析 ====== */}
        <section className="mb-12">
          <div className={`text-center mb-8 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}>
            <div className="font-serif text-4xl font-bold tracking-[0.15em] mb-2 glow-gold text-gold-200">叁</div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wider mb-2 text-ink-100">命理分析</h2>
            <p className="text-xs text-ink-300">日主强弱，喜忌分明</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 日主强弱 */}
            <div
              className={`jinming-card rounded-sm p-6 md:p-7 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,164,92,0.1)', border: '1px solid rgba(200,164,92,0.2)' }}>
                  <Scale className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <div className="font-serif text-base font-semibold tracking-wider text-gold-200">日主强弱</div>
                  <div className="text-[11px] text-ink-300">生助与克泄的力量对比</div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-2 text-ink-300">
                  <span>身弱</span>
                  <span className={`font-serif font-bold text-sm ${isStrong ? 'text-gold-200' : 'text-vermilion-light'}`}>
                    {isStrong ? '身强' : '身弱'}
                  </span>
                  <span>身强</span>
                </div>
                <div className="relative h-1.5 rounded-full overflow-visible" style={{ background: 'rgba(200,164,92,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: strengthAnimated ? `${strengthPct}%` : '0%',
                      background: 'linear-gradient(90deg, #c4564a, #c8a45c)',
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-gold-400 bg-ink-900 transition-all duration-1000 ease-out z-[2]"
                    style={{ left: strengthAnimated ? `${strengthPct}%` : '0%', transform: 'translate(-50%, -50%)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-sm py-3" style={{ background: 'rgba(200,164,92,0.04)', border: '1px solid rgba(200,164,92,0.08)' }}>
                  <div className="font-serif text-lg font-bold glow-score text-gold-200">{helpCount.toFixed(1)}</div>
                  <div className="text-[10px] tracking-wider text-ink-300">生助力量</div>
                </div>
                <div className="rounded-sm py-3" style={{ background: 'rgba(196,86,74,0.04)', border: '1px solid rgba(196,86,74,0.08)' }}>
                  <div className="font-serif text-lg font-bold text-vermilion-light">{restrainCount.toFixed(1)}</div>
                  <div className="text-[10px] tracking-wider text-ink-300">克泄力量</div>
                </div>
              </div>

              <p className="text-xs mt-4 leading-relaxed text-ink-300">
                {isStrong
                  ? `日主${bazi.dayMaster}属${dayWx}，生助力量(${helpCount.toFixed(1)})大于克泄力量(${restrainCount.toFixed(1)})，命局偏强。身强宜克泄耗，取名宜用${WUXING_KE[dayWx]}、${WUXING_SHENG[dayWx]}属性之字以平衡命局。`
                  : `日主${bazi.dayMaster}属${dayWx}，生助力量(${helpCount.toFixed(1)})小于克泄力量(${restrainCount.toFixed(1)})，命局偏弱。身弱宜生助，取名宜用${dayWx}、${WUXING_BEI_SHENG[dayWx]}属性之字以扶助日主。`
                }
              </p>
            </div>

            {/* 喜用神 */}
            <div
              className={`jinming-card rounded-sm p-6 md:p-7 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,164,92,0.1)', border: '1px solid rgba(200,164,92,0.2)' }}>
                  <Gem className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <div className="font-serif text-base font-semibold tracking-wider text-gold-200">喜用神</div>
                  <div className="text-[11px] text-ink-300">起名取字的核心依据</div>
                </div>
              </div>

              {/* 喜用神（宜补） */}
              <div className="mb-5">
                <div className="text-xs mb-3 text-ink-300">喜用神（宜补）</div>
                <div className="flex flex-wrap gap-2">
                  {bazi.xiYong.map((wx, i) => (
                    <span
                      key={wx + "-" + String(i)}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded font-serif text-[13px] transition-all duration-400 ${xiAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-80'}`}
                      style={{
                        transitionDelay: `${i * 150}ms`,
                        background: 'rgba(200,164,92,0.12)',
                        border: '1px solid rgba(200,164,92,0.35)',
                        color: '#e8d09a',
                      }}
                    >
                      <span className={`text-[10px] ${WUXING_TAILWIND[wx]}`}>●</span>
                      {wx}
                    </span>
                  ))}
                </div>
              </div>

              {/* 忌神（宜避） */}
              <div className="mb-5">
                <div className="text-xs mb-3 text-ink-300">忌神（宜避）</div>
                <div className="flex flex-wrap gap-2">
                  {bazi.jiShen.map((wx, i) => (
                    <span
                      key={wx + "-" + String(i)}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded font-serif text-[13px] transition-all duration-400 ${xiAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-80'}`}
                      style={{
                        transitionDelay: `${(bazi.xiYong.length + i) * 150}ms`,
                        background: 'rgba(196,86,74,0.08)',
                        border: '1px solid rgba(196,86,74,0.25)',
                        color: '#d4726a',
                      }}
                    >
                      <span className="text-[10px] text-vermilion-light">●</span>
                      {wx}
                    </span>
                  ))}
                </div>
              </div>

              <GoldLine className="mb-4" />

              <div className="text-xs leading-relaxed text-ink-300">
                日主{bazi.dayMaster}属{dayWx}，{isStrong ? '身强喜克泄耗' : '身弱喜生助'}。
                喜用神为{bazi.xiYong.join('、')}，起名宜优先选用此五行属性之字；
                忌神为{bazi.jiShen.join('、')}，起名宜尽量避免。
              </div>
            </div>
          </div>
        </section>

        {/* ====== 肆 · 起名方向 ====== */}
        <section className="mb-12">
          <div className={`text-center mb-8 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}>
            <div className="font-serif text-4xl font-bold tracking-[0.15em] mb-2 glow-gold text-gold-200">肆</div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wider mb-2 text-ink-100">起名方向</h2>
            <p className="text-xs text-ink-300">命理定基调，偏好留下一步</p>
          </div>

          <div className={`jinming-card rounded-sm p-6 md:p-8 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,164,92,0.1)', border: '1px solid rgba(200,164,92,0.2)' }}>
                <Compass className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <div className="font-serif text-base font-semibold tracking-wider text-gold-200">核心结论</div>
                <div className="text-[11px] text-ink-300">基于命理分析的取字纲要</div>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-ink-100">
              {/* 五行补益 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(200,164,92,0.1)', border: '1px solid rgba(200,164,92,0.2)' }}>
                  <Target className="w-2.5 h-2.5 text-gold-400" />
                </div>
                <div>
                  <span className="font-serif text-sm font-semibold text-gold-200">五行补益</span>
                  <p className="text-xs mt-1 text-ink-300">
                    命局喜{bazi.xiYong.join('、')}，起名宜取{bazi.xiYong[0]}、{bazi.xiYong[1]}属性之字。
                    {bazi.xiYong.includes(surnameWx)
                      ? `姓氏「${inputData?.surname}」属${surnameWx}，与喜用神相合，格局顺畅。`
                      : `姓氏「${inputData?.surname}」属${surnameWx}，名字需着重补益${bazi.xiYong[0]}以调和。`
                    }
                  </p>
                </div>
              </div>

              {/* 下一步 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(200,164,92,0.1)', border: '1px solid rgba(200,164,92,0.2)' }}>
                  <SlidersHorizontal className="w-2.5 h-2.5 text-gold-400" />
                </div>
                <div>
                  <span className="font-serif text-sm font-semibold text-gold-200">下一步</span>
                  <p className="text-xs mt-1 text-ink-300">
                    在偏好设置中，您可进一步指定字数、风格、诗词出处等，AI将结合命理方向与您的偏好，为您推演良名。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== 合规标识 ====== */}
        <p className={`text-ink-500 text-xs text-center mt-4 mb-6 ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}>
          以上内容由AI生成，仅供传统文化参考
        </p>

        {/* ====== 底部操作按钮 ====== */}
        <div className={`flex items-center justify-between ${sectionBase} ${revealed ? sectionVisible : sectionHidden}`}>
          <Link
            href="/name/input"
            className="btn-outline-gold px-6 py-3 rounded-sm text-[12px] font-serif tracking-wider inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            重新输入
          </Link>
          <button
            onClick={handleGoPreference}
            className="btn-gold px-10 py-3.5 rounded-sm font-serif text-[13px] tracking-[0.2em] inline-flex items-center gap-2"
            style={{ animation: 'node-pulse 2s ease-in-out infinite' }}
          >
            设置偏好
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </main>
    </div>
  );
}

// ===== 五行圆形节点子组件 =====
function WuxingCircleNode({ wx, count, isLack }: { wx: string; count: number; isLack: boolean }) {
  const opacity = Math.max(0.4, Math.min(1, count / 3));
  const dotSize = wx === '土' ? Math.max(40, 40 + count * 3) : Math.max(38, 38 + count * 3);
  const rgb = WUXING_RGB[wx];
  const color = WUXING_COLORS[wx];

  return (
    <div
      className="rounded-full flex items-center justify-center font-serif font-bold transition-all duration-500 hover:scale-110 cursor-default"
      style={{
        width: dotSize,
        height: dotSize,
        background: `rgba(${rgb}, ${opacity * 0.15})`,
        border: `1.5px solid rgba(${rgb}, ${opacity * 0.4})`,
        color,
        fontSize: 15,
      }}
    >
      {wx}
    </div>
  );
}
