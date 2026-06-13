'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import { loadTestResult, type TestNameResult } from '@/lib/storage';
import {
  Orbit, BarChart3, Grid3X3, Fingerprint, Lightbulb,
  Copy, ArrowUp, PenLine, Search, Info,
  AlertTriangle, CheckCircle, XCircle, MinusCircle,
  Music, Gem, Leaf, Droplets, Flame, Mountain
} from 'lucide-react';

const WX_COLORS: Record<string, string> = { '金':'#e8d09a','木':'#81c784','水':'#64b5f6','火':'#d4726a','土':'#d4c4a0' };
const WX_RGB: Record<string, string> = { '金':'232,208,154','木':'129,199,132','水':'100,181,246','火':'212,114,106','土':'212,196,160' };

const WxIcon = ({ wx, size = 10 }: { wx: string; size?: number }) => {
  const m: Record<string, React.ReactNode> = {
    '金': <Gem size={size} />, '木': <Leaf size={size} />, '水': <Droplets size={size} />,
    '火': <Flame size={size} />, '土': <Mountain size={size} />,
  };
  return <span style={{ color: WX_COLORS[wx] }}>{m[wx] || null}</span>;
};

interface Grade { label: string; cls: string; color: string; ringColor: string }

function getGrade(score: number): Grade {
  if (score >= 90) return { label: '极优', cls: 'grade-excellent', color: 'var(--color-gold-200)', ringColor: 'var(--color-gold-400)' };
  if (score >= 80) return { label: '优良', cls: 'grade-good', color: '#e8d09a', ringColor: '#e8d09a' };
  if (score >= 65) return { label: '尚可', cls: 'grade-fair', color: 'var(--color-ink-300)', ringColor: 'var(--color-ink-300)' };
  return { label: '偏弱', cls: 'grade-poor', color: 'var(--color-vermilion-light)', ringColor: 'var(--color-vermilion-light)' };
}

function getGradeFill(score: number): string {
  if (score >= 90) return 'from-gold-400/40 to-gold-400/90';
  if (score >= 80) return 'from-gold-200/30 to-gold-200/75';
  if (score >= 65) return 'from-ink-300/30 to-ink-300/60';
  return 'from-vermilion-light/30 to-vermilion-light/70';
}

function gradeBadge(grade: Grade): string {
  if (grade.label === '极优') return 'bg-gold-400/12 text-gold-200 border-gold-400/30';
  if (grade.label === '优良') return 'bg-gold-200/10 text-gold-200 border-gold-200/25';
  if (grade.label === '尚可') return 'bg-ink-300/10 text-ink-300 border-ink-300/20';
  return 'bg-vermilion-light/8 text-vermilion-light border-vermilion-light/20';
}

function getRarityCls(level: string): string {
  if (level === '极低') return 'bg-green-400/10 text-green-400 border-green-400/25';
  if (level === '低') return 'bg-blue-400/10 text-blue-400 border-blue-400/25';
  if (level === '中') return 'bg-gold-200/10 text-gold-200 border-gold-200/25';
  if (level === '较高') return 'bg-vermilion-light/10 text-vermilion-light border-vermilion-light/25';
  return 'bg-vermilion/12 text-vermilion border-vermilion/25';
}

function getRarityBarColor(level: string): string {
  if (level === '极低') return '#81c784';
  if (level === '低') return '#64b5f6';
  if (level === '中') return '#e8d09a';
  if (level === '较高') return '#d4726a';
  return '#c4564a';
}

function getRarityDesc(level: string): string {
  const m: Record<string, string> = {
    '极低': '名字组合极为罕见，独特性极高，在人群中辨识度很强。',
    '低': '名字组合较为独特，重名可能性较低。',
    '中': '名字组合较为常见，存在一定重名概率。',
    '较高': '名字组合较常见，重名概率偏高，独特性不足。',
    '极高': '名字组合非常常见，重名概率极高，建议考虑更独特的替代方案。',
  };
  return m[level] || m['中'];
}

const SHENG_MAP: Record<string, string> = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
const KE_MAP: Record<string, string> = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
function getRelation(a: string, b: string): string {
  if (a === b) return 'same';
  if (SHENG_MAP[a] === b) return 'sheng';
  if (KE_MAP[a] === b) return 'ke';
  if (SHENG_MAP[b] === a) return 'beisheng';
  return 'neutral';
}
const REL_LABELS: Record<string, string> = { sheng: '↓ 生', ke: '✕ 克', same: '≡ 比和', beisheng: '↑ 被', neutral: '↓ 泄' };
const REL_COLORS: Record<string, string> = { sheng: '#81c784', ke: '#d4726a', same: '#a89e8e', beisheng: '#81c784', neutral: '#a89e8e' };

const ANCHOR_ITEMS = [
  { id: 'wxMatch', label: '五行匹配', Icon: Orbit },
  { id: 'score', label: '综合评分', Icon: BarChart3 },
  { id: 'ge', label: '三才五格', Icon: Grid3X3 },
  { id: 'rarity', label: '重名风险', Icon: Fingerprint },
  { id: 'advice', label: '综合建议', Icon: Lightbulb },
];

export default function TestNameResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<TestNameResult | null>(null);
  const [animScore, setAnimScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeAnchor, setActiveAnchor] = useState('');
  const [showBackTop, setShowBackTop] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [toast, setToast] = useState('');
  const barRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rarityBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('tianyan_test_result');
    if (raw) { try { setResult(JSON.parse(raw)); } catch {} }
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!result) return;
    let current = 0;
    const target = result.score || 0;
    const timer = setInterval(() => {
      current += 1;
      if (current >= target) { current = target; clearInterval(timer); }
      setAnimScore(current);
    }, 15);
    return () => clearInterval(timer);
  }, [result]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      barRefs.current.forEach(el => { const w = el.dataset.width; if (w) el.style.width = w; });
      if (rarityBarRef.current) { const w = rarityBarRef.current.dataset.width; if (w) rarityBarRef.current.style.width = w; }
    }, 800);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      setShowBottomBar(sy > 400);
      setShowBackTop(sy > 600);
      let current = '';
      ANCHOR_ITEMS.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 120) current = item.id;
      });
      setActiveAnchor(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copyResult = useCallback(() => {
    if (!result) return;
    const g = getGrade(result.score);
    const lines = ['【天衍·测名结果】', `姓名：${result.fullName}`, `综合评分：${result.score}（${g.label}）`, '', `— 五行匹配：${result.wuxingMatch}`, `— 音韵和谐：${result.yinyunScore}`, '', `名字五行：${result.nameWuxing}`, `重名风险：${result.repeatLevel || '中等'}`];
    const text = lines.join('\n');
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => setToast('结果已复制到剪贴板')).catch(() => {}); }
    setTimeout(() => setToast(''), 2500);
  }, [result]);

  const scrollToAnchor = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9998] bg-ink-900 flex flex-col items-center justify-center">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite] opacity-30">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(196,86,74,0.2)" strokeWidth="0.5" />
            <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2" fill="rgba(196,86,74,0.4)" />
            <path d="M50 2 A48 48 0 0 0 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2" fill="rgba(232,224,212,0.08)" />
          </svg>
        </div>
        <div className="font-serif text-lg tracking-[0.3em] mt-8 mb-3 text-vermilion-light animate-pulse">正在评测</div>
        <div className="flex items-center gap-2 text-xs text-ink-300">
          <span className="animate-pulse">排八字</span><span>·</span><span className="opacity-25">析五行</span><span className="opacity-25">·</span><span className="opacity-25">评分</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="text-ink-400 text-sm">未找到测名数据
          <button onClick={() => router.push('/test-name')} className="ml-2 text-gold-400 underline">返回测名</button>
        </div>
      </div>
    );
  }

  const grade = getGrade(result.score);
  const wxMatchGrade = getGrade(result.wuxingMatch);
  const yinyunGrade = getGrade(result.yinyunScore);
  const wuxingEntries = Object.entries(result.wuxing || {}).sort((a, b) => b[1] - a[1]);
  const nameChars = result.fullName?.split('') || [];
  const nameWxList = (result.nameWuxing || '').split(/[→·\-\s]+/).map(s => s.trim()).filter(Boolean);
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animScore / 100) * circumference;
  const repeatLevel = result.repeatLevel || '中等';
  const repeatRisk = result.repeatRisk || 50;
  const rarityBarPct = repeatLevel === '极低' ? 95 : repeatLevel === '低' ? 75 : repeatLevel === '中' ? 50 : repeatLevel === '较高' ? 30 : 15;
  const dimensions = [
    { name: '五行匹配', score: result.wuxingMatch, Icon: Orbit, grade: wxMatchGrade, key: 'wx', desc: result.wuxingMatch >= 80 ? '喜用神匹配，五行补益有效' : result.wuxingMatch >= 60 ? '五行有补但非最优' : '五行与喜用神匹配偏弱' },
    { name: '音韵和谐', score: result.yinyunScore, Icon: Music, grade: yinyunGrade, key: 'yy', desc: result.yinyunScore >= 80 ? '声调起伏有致，韵律优美' : result.yinyunScore >= 60 ? '声调平稳，朗朗上口' : '声调单一，韵律欠佳' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="测名结果" backHref="/test-name" rightAction={<Link href="/test-name" className="nav-link text-[12px] text-ink-300 hover:text-gold-400 transition-colors">重新测名</Link>} />

      <main className="flex-1 relative px-6 pt-4 pb-24" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto">

          {/* 英雄区 */}
          <section className="text-center mb-4 animate-fade-in-up relative">
            <div className="absolute inset-[-60px] bg-[radial-gradient(ellipse_at_center,rgba(196,86,74,0.06)_0%,rgba(196,86,74,0.02)_40%,transparent_70%)] pointer-events-none -z-10" />
            <div className="inline-block relative mb-5">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(200,164,92,0.06)" strokeWidth="5" />
                <circle cx="80" cy="80" r={radius} fill="none" stroke={grade.ringColor} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transform="rotate(-90 80 80)" className="transition-[stroke-dashoffset] duration-[1800ms] ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ filter: 'drop-shadow(0 0 6px rgba(200,164,92,0.4))' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif font-black text-[48px] leading-none glow-score" style={{ color: grade.color }}>{animScore}</span>
                <span className="text-[11px] mt-1 text-ink-300">综合评分</span>
                <span className="text-[13px] font-bold mt-0.5" style={{ color: grade.color }}>{grade.label}</span>
              </div>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-black tracking-[0.2em] mb-2 glow-gold-strong text-gold-200">{result.fullName}</h1>
            <div className="flex items-center gap-2 flex-wrap justify-center mb-3">
              {nameWxList.map((wx, i) => (<WuxingTag key={i} wuxing={wx}><WxIcon wx={wx} size={8} /> {wx}</WuxingTag>))}
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-[11px] font-semibold border ${gradeBadge(grade)}`}>{grade.label}</span>
            </div>
            <div className="font-serif text-sm mb-3 text-ink-300">
              {result.sancaiConfig && <span>三才{result.sancaiConfig}</span>}
              {result.matchConclusion && <span> · {result.matchConclusion}</span>}
            </div>
            <button onClick={copyResult} className="text-ink-300 text-[11px] hover:text-gold-400 transition-colors px-3 py-1.5 rounded-sm"><Copy size={9} className="inline mr-1" />复制</button>
          </section>

          {/* 锚点导航 */}
          <div className="rounded-sm mb-10 border border-vermilion/8 bg-vermilion/[0.02]">
            <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {ANCHOR_ITEMS.map(item => (
                <div key={item.id} onClick={() => scrollToAnchor(item.id)} className={`flex-shrink-0 px-4 py-2 text-[11px] cursor-pointer transition-all border-b-2 whitespace-nowrap tracking-wider ${activeAnchor === item.id ? 'text-vermilion-light border-vermilion' : 'text-ink-300 border-transparent hover:text-vermilion-light'}`}>
                  <item.Icon size={9} className="inline mr-1 opacity-50" />{item.label}
                </div>
              ))}
            </div>
          </div>

          {/* 注意事项 */}
          {result.wuge?.some(g => g.luck === '凶') && (
            <section className="mb-10 animate-fade-in-up">
              <div className="rounded-sm p-5 md:p-6 bg-gradient-to-br from-vermilion/[0.04] to-vermilion/[0.01] border border-vermilion/12 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-vermilion to-transparent" />
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-vermilion/[0.06] border border-vermilion/15"><AlertTriangle size={12} className="text-vermilion" /></div>
                  <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">注意事项</div>
                </div>
                <div className="space-y-2.5">
                  {result.wuge.filter(g => g.luck === '凶').map((g, i) => (
                    <div key={i} className="flex items-start gap-2"><Info size={10} className="text-vermilion-light mt-0.5 flex-shrink-0" /><span className="text-xs leading-relaxed text-ink-300">{g.name}数为{g.strokes}，五格属凶</span></div>
                  ))}
                  {result.score < 65 && (
                    <div className="flex items-start gap-2"><Info size={10} className="text-vermilion-light mt-0.5 flex-shrink-0" /><span className="text-xs leading-relaxed text-ink-300">综合评分偏低，建议考虑更契合命理的名字</span></div>
                  )}
                </div>
              </div>
            </section>
          )}

          <GoldLine className="mb-10" />

          {/* 五行匹配 */}
          <section id="wxMatch" className="mb-10 animate-fade-in-up stagger-1">
            <div className="jinming-card rounded-sm p-5 md:p-6 hover:transform-none hover:shadow-none relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-vermilion to-gold-400" />
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-vermilion/[0.08] border border-vermilion/20"><Orbit size={12} className="text-vermilion-light" /></div>
                <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">五行匹配</div>
                <span className={`ml-auto inline-flex items-center gap-1 px-3 py-1 rounded text-[11px] font-semibold border ${gradeBadge(wxMatchGrade)}`}>{result.wuxingMatch} · {wxMatchGrade.label}</span>
              </div>

              {/* 桌面端纵向字卡 */}
              <div className="hidden md:flex flex-col items-center gap-0 mb-5">
                {nameChars.map((c, i) => {
                  const wx = nameWxList[i] || '土';
                  const isSur = i === 0;
                  return (
                    <div key={i} className="w-full max-w-xs">
                      <div className="rounded-sm p-3.5 bg-gradient-to-br from-gold-400/[0.06] to-gold-400/[0.01] border border-gold-400/14 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 flex items-center justify-center rounded border font-serif text-[26px] font-bold" style={{ borderColor: `rgba(${WX_RGB[wx]},0.3)`, background: `rgba(${WX_RGB[wx]},0.08)`, color: WX_COLORS[wx] }}>{c}</div>
                          <div><div className="font-serif text-base font-bold text-ink-100">{c}</div><div className="text-[10px] text-ink-300">{isSur ? '姓氏' : '名'} · 五行属{wx}</div></div>
                          <WuxingTag wuxing={wx} className="ml-auto" />
                        </div>
                      </div>
                      {i < nameChars.length - 1 && (() => {
                        const nextWx = nameWxList[i + 1] || '土';
                        const rel = getRelation(wx, nextWx);
                        return (<div className="flex flex-col items-center justify-center gap-1 py-1"><div className="w-px h-4 bg-gradient-to-b from-gold-400/15 via-gold-400/25 to-gold-400/15" /><span className="text-[9px]" style={{ color: REL_COLORS[rel] }}>{REL_LABELS[rel]}</span><div className="w-px h-4 bg-gradient-to-b from-gold-400/15 via-gold-400/25 to-gold-400/15" /></div>);
                      })()}
                    </div>
                  );
                })}
              </div>

              {/* 移动端横向字卡 */}
              <div className="flex md:hidden items-center gap-2 mb-5 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
                {nameChars.map((c, i) => {
                  const wx = nameWxList[i] || '土';
                  return (<div key={i} className="flex items-center gap-1 flex-shrink-0">{i > 0 && <div className="w-3 h-px bg-gradient-to-r from-gold-400/15 via-gold-400/30 to-gold-400/15" />}<div className="rounded-sm p-2 bg-gradient-to-br from-gold-400/[0.06] to-gold-400/[0.01] border border-gold-400/14 min-w-[56px]"><div className="w-9 h-9 flex items-center justify-center rounded mx-auto font-serif text-lg font-bold" style={{ borderColor: `rgba(${WX_RGB[wx]},0.3)`, background: `rgba(${WX_RGB[wx]},0.08)`, color: WX_COLORS[wx], borderWidth: 1 }}>{c}</div><div className="text-center mt-1"><WuxingTag wuxing={wx}><span className="text-[8px] px-1 py-0.5">{wx}</span></WuxingTag></div></div></div>);
                })}
              </div>

              {/* 五行对比区 */}
              <div className="rounded-sm p-4 bg-gold-400/[0.03] border border-gold-400/8">
                <div className="text-[11px] font-semibold mb-3 text-gold-200 flex items-center gap-1"><BarChart3 size={9} /> 命盘与名字五行对比</div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-sm p-3 bg-gold-400/[0.03] border border-gold-400/6">
                    <div className="text-[10px] mb-2 text-ink-300">名字五行</div>
                    <div className="flex flex-wrap gap-1.5">{nameWxList.map((wx, i) => (<WuxingTag key={i} wuxing={wx}><WxIcon wx={wx} size={8} /> {wx}</WuxingTag>))}</div>
                  </div>
                  <div className="rounded-sm p-3 bg-gold-400/[0.03] border border-gold-400/6">
                    <div className="text-[10px] mb-2 text-ink-300">五行分布</div>
                    <div className="flex flex-wrap gap-1.5">{wuxingEntries.map(([wx, val]) => (<WuxingTag key={wx} wuxing={wx}><WxIcon wx={wx} size={8} /> {wx}{val}</WuxingTag>))}</div>
                  </div>
                </div>
                <div className="text-[10px] mb-2 text-ink-300">五行分布</div>
                <div className="grid grid-cols-5 gap-2">
                  {['金','木','水','火','土'].map((wx, i) => {
                    const val = result.wuxing?.[wx] || 0;
                    const totalWx = Object.values(result.wuxing || {}).reduce((a: number, b: number) => a + b, 0) || 1;
                    const pct = Math.round((val / totalWx) * 100);
                    return (<div key={wx} className="text-center"><div className="text-[10px] mb-1" style={{ color: WX_COLORS[wx] }}>{wx}</div><div className="h-12 rounded-sm relative" style={{ background: `rgba(${WX_RGB[wx]},0.06)`, border: `1px solid rgba(${WX_RGB[wx]},0.1)` }}><div className="absolute bottom-0 left-0 right-0 rounded-b-sm" style={{ background: `rgba(${WX_RGB[wx]},0.25)`, height: `${pct}%` }} /></div><div className="text-[10px] mt-1 text-ink-300">{val}</div></div>);
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gold-400/6">
                  <div className="flex items-start gap-2 text-xs text-ink-100"><CheckCircle size={12} className="text-green-400 mt-0.5 flex-shrink-0" />{result.matchConclusion}</div>
                </div>
              </div>
            </div>
          </section>

          <GoldLine className="mb-10" />

          {/* 综合评分 */}
          <section id="score" className="mb-10 animate-fade-in-up stagger-2">
            <div className="jinming-card rounded-sm p-5 md:p-6 hover:transform-none hover:shadow-none">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/[0.08] border border-gold-400/20"><BarChart3 size={12} className="text-gold-400" /></div>
                <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">综合评分</div>
                <span className={`ml-auto inline-flex items-center gap-1 px-3 py-1 rounded text-[11px] font-semibold border ${gradeBadge(grade)}`}>{result.score} · {grade.label}</span>
              </div>
              <div className="space-y-5">
                {dimensions.map(dim => (
                  <div key={dim.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2"><dim.Icon size={10} style={{ color: dim.grade.color }} /><span className="text-xs font-medium text-ink-100">{dim.name}</span></div>
                      <div className="flex items-center gap-2"><span className="text-sm font-bold font-serif" style={{ color: dim.grade.color }}>{dim.score}</span><span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border ${gradeBadge(dim.grade)}`}>{dim.grade.label}</span></div>
                    </div>
                    <div className="h-1.5 rounded-full bg-gold-400/[0.06] overflow-hidden">
                      <div ref={(el) => { if (el) barRefs.current.set(dim.key, el); }} className={`h-full rounded-full bg-gradient-to-r ${getGradeFill(dim.score)}`} style={{ width: 0 }} data-width={`${dim.score}%`} />
                    </div>
                    <div className="text-[10px] mt-1.5 text-ink-300">{dim.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <GoldLine className="mb-10" />

          {/* 三才五格 */}
          {result.wuge && result.wuge.length > 0 && (
            <section id="ge" className="mb-10 animate-fade-in-up stagger-3">
              <div className="jinming-card rounded-sm p-5 md:p-6 hover:transform-none hover:shadow-none">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/[0.08] border border-gold-400/20"><Grid3X3 size={12} className="text-gold-400" /></div>
                  <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">三才五格</div>
                </div>
                <div className="grid grid-cols-5 gap-1 mb-5">
                  {result.wuge.map((g, i) => {
                    const jiCls = g.luck === '吉' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : g.luck === '半吉' ? 'bg-gold-200/10 text-gold-200 border border-gold-200/20' : 'bg-vermilion-light/8 text-vermilion-light border border-vermilion-light/20';
                    return (<div key={i} className="text-center px-1 py-3 bg-gold-400/[0.03] border border-gold-400/8 rounded-sm hover:bg-gold-400/[0.06] transition-all"><div className="text-[10px] text-ink-300">{g.name}</div><div className="font-serif text-xl font-bold text-gold-200">{g.strokes}</div><span className={`text-[9px] px-1.5 py-0.5 rounded inline-block mt-1 ${jiCls}`}>{g.luck}</span><div className="text-[9px] mt-1"><WuxingTag wuxing={g.wx}><span className="text-[8px] px-1 py-0">{g.wx}</span></WuxingTag></div></div>);
                  })}
                </div>
                <div className="space-y-2">
                  {result.wuge.map((g, i) => {
                    const JiIcon = g.luck === '吉' ? CheckCircle : g.luck === '半吉' ? MinusCircle : XCircle;
                    const jiColor = g.luck === '吉' ? '#81c784' : g.luck === '半吉' ? '#e8d09a' : '#d4726a';
                    const meanings: Record<string, string> = { '天格': '先天运，祖上福泽与早年根基', '人格': '主运，一生核心运势与性格特质', '地格': '前运，中年以前的发展与际遇', '外格': '副运，人际社交与外部助力', '总格': '后运，晚年运势与人生总结' };
                    return (<div key={i} className="flex items-start gap-2 p-2 rounded-sm bg-gold-400/[0.02]"><JiIcon size={10} className="mt-0.5 flex-shrink-0" style={{ color: jiColor }} /><div><div className="text-[11px] font-medium text-ink-100">{g.name}（{g.strokes}画 · {g.wx}）</div><div className="text-[10px] text-ink-300">{meanings[g.name] || ''}</div></div></div>);
                  })}
                </div>

                {/* 音韵分析 */}
                <div className="mt-5 pt-4 border-t border-gold-400/8">
                  <div className="flex items-center gap-2 mb-3">
                    <Music size={10} className="text-gold-400" />
                    <span className="text-[11px] font-semibold text-gold-200">音韵分析</span>
                    <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold border ${gradeBadge(yinyunGrade)}`}>{result.yinyunScore} · {yinyunGrade.label}</span>
                  </div>
                  {result.tones && result.tones.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.tones.map((t, i) => {
                        const toneNames = ['','阴平','阳平','上声','去声'];
                        const toneSymbols = ['','ˉ','ˊ','ˇ','ˋ'];
                        const tone = t.tone || 1;
                        return (<div key={i} className="rounded-sm px-3 py-2 text-center bg-gold-400/[0.03] border border-gold-400/8 min-w-[60px]"><div className="font-serif text-base font-bold text-gold-200">{t.char}</div><div className="text-[9px]" style={{ color: tone <= 2 ? '#81c784' : '#e8d09a' }}>{toneNames[tone]}{toneSymbols[tone]}</div></div>);
                      })}
                    </div>
                  )}
                  {result.homophone && (<div className="flex items-center gap-2 text-xs text-ink-100"><CheckCircle size={12} className="text-green-400" />{result.homophone}</div>)}
                </div>
              </div>
            </section>
          )}

          <GoldLine className="mb-10" />

          {/* 重名风险 */}
          <section id="rarity" className="mb-10 animate-fade-in-up stagger-4">
            <div className="jinming-card rounded-sm p-5 md:p-6 hover:transform-none hover:shadow-none">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/[0.08] border border-gold-400/20"><Fingerprint size={12} className="text-gold-400" /></div>
                <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">重名风险</div>
                <span className={`ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold ${getRarityCls(repeatLevel)}`}>{repeatLevel}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1"><div className="h-2 rounded bg-gold-400/[0.06] overflow-hidden"><div ref={rarityBarRef} className="h-full rounded" style={{ width: 0, background: `linear-gradient(90deg, rgba(${WX_RGB[nameWxList[0] || '金']},0.2), ${getRarityBarColor(repeatLevel)})` }} data-width={`${rarityBarPct}%`} /></div></div>
                <span className="font-serif text-2xl font-bold" style={{ color: getRarityBarColor(repeatLevel) }}>{Math.round(repeatRisk)}</span>
              </div>
              <div className="text-[11px] mb-3 text-ink-300">预估重名率：{repeatLevel}</div>
              <div className="flex items-start gap-2"><Info size={10} className="text-ink-300 mt-0.5 flex-shrink-0" /><span className="text-[11px] leading-relaxed text-ink-300">{getRarityDesc(repeatLevel)}</span></div>
              <div className="mt-3 pt-3 border-t border-gold-400/6">
                <div className="text-[10px] mb-2 text-gold-600">用字使用频率</div>
                {nameChars.map((c, i) => {
                  const isSur = i === 0;
                  const wx = nameWxList[i] || '土';
                  return (<div key={i} className="flex items-center gap-2 mb-1.5"><span className="font-serif text-sm w-6 text-center text-gold-200">{c}</span><span className="text-[9px] w-8 text-ink-300">{isSur ? '姓' : '名'}</span><div className="flex-1 h-2 rounded-sm bg-gold-400/[0.04]"><div className="h-full rounded-sm" style={{ width: isSur ? '70%' : '40%', background: `rgba(${WX_RGB[wx]},0.3)` }} /></div><span className="text-[9px] text-ink-300">{isSur ? '高频' : '中频'}</span></div>);
                })}
              </div>
            </div>
          </section>

          <GoldLine className="mb-10" />

          {/* 综合建议 */}
          <section id="advice" className="mb-10 animate-fade-in-up stagger-5">
            <div className="jinming-card rounded-sm p-5 md:p-6 hover:transform-none hover:shadow-none">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/[0.08] border border-gold-400/20"><Lightbulb size={12} className="text-gold-400" /></div>
                <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">综合建议</div>
              </div>
              <div className="space-y-3">
                {[
                  { Icon: Orbit, grade: wxMatchGrade, goodLabel: '五行契合', fairLabel: '五行尚可', poorLabel: '五行欠佳', goodText: '名字五行与命盘喜用神高度匹配，补益有力，可安心使用。', fairText: '名字五行与喜用神有一定呼应，但非最优搭配。', poorText: '名字五行与命盘喜用神匹配偏弱，建议优先选用喜用属性的字进行补益。', score: result.wuxingMatch },
                  { Icon: Music, grade: yinyunGrade, goodLabel: '音韵优美', fairLabel: '音韵尚可', poorLabel: '音韵欠佳', goodText: '名字声调平仄有致，韵律和谐，朗朗上口。', fairText: '名字读音平稳，可进一步优化声调搭配以增强韵律感。', poorText: '名字声调搭配不够理想，建议调整用字使平仄相间、韵律更佳。', score: result.yinyunScore },
                  { Icon: Fingerprint, grade: getGrade(repeatLevel === '极低' || repeatLevel === '低' ? 90 : repeatLevel === '中' ? 70 : 40), goodLabel: '独特出众', fairLabel: '独特性适中', poorLabel: '独特性不足', goodText: getRarityDesc(repeatLevel), fairText: getRarityDesc(repeatLevel), poorText: getRarityDesc(repeatLevel), score: repeatLevel === '极低' || repeatLevel === '低' ? 90 : repeatLevel === '中' ? 70 : 40 },
                ].map((ad, i) => {
                  const isGood = ad.score >= 80;
                  const isFair = ad.score >= 60 && ad.score < 80;
                  const color = isGood ? '#81c784' : isFair ? '#e8d09a' : '#d4726a';
                  return (
                    <div key={i} className="rounded-sm p-3.5 bg-gold-400/[0.02] border border-gold-400/6">
                      <div className="flex items-center gap-2 mb-1.5">
                        <ad.Icon size={10} style={{ color }} />
                        <span className="text-[11px] font-semibold" style={{ color }}>{isGood ? ad.goodLabel : isFair ? ad.fairLabel : ad.poorLabel}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-ink-300">{isGood ? ad.goodText : isFair ? ad.fairText : ad.poorText}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-gold-400/8">
                {result.score >= 80 ? (
                  <div className="rounded-sm p-4 bg-green-400/[0.04] border border-green-400/12">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle size={12} className="text-green-400" /><span className="font-serif text-sm font-semibold text-green-400">总体评价：良名</span></div>
                    <p className="text-[11px] leading-relaxed text-ink-300">「{result.fullName}」综合表现优良，与命理契合度较高，可以作为正式名字使用。</p>
                  </div>
                ) : result.score >= 65 ? (
                  <div className="rounded-sm p-4 bg-gold-200/[0.04] border border-gold-200/12">
                    <div className="flex items-center gap-2 mb-2"><MinusCircle size={12} className="text-gold-200" /><span className="font-serif text-sm font-semibold text-gold-200">总体评价：可用</span></div>
                    <p className="text-[11px] leading-relaxed text-ink-300">「{result.fullName}」综合表现尚可，部分维度有优化空间。如介意不足之处，可考虑调整。</p>
                  </div>
                ) : (
                  <div className="rounded-sm p-4 bg-vermilion/[0.04] border border-vermilion/12">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle size={12} className="text-vermilion-light" /><span className="font-serif text-sm font-semibold text-vermilion-light">总体评价：建议调整</span></div>
                    <p className="text-[11px] leading-relaxed text-ink-300">「{result.fullName}」在多个维度表现偏弱，建议通过AI起名寻找更契合命理的替代方案。</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 底部 CTA */}
          <div className="text-center py-8 animate-fade-in-up">
            <GoldLine className="max-w-[60px] mx-auto mb-5" />
            <p className="text-sm mb-4 text-ink-300">对结果不满意？让AI为您量身推演良名</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/" className="btn-gold px-8 py-3 rounded-sm font-serif text-[12px] tracking-[0.2em] inline-block"><PenLine size={10} className="inline mr-1.5" />AI 起名</Link>
              <Link href="/test-name" className="btn-outline-gold px-8 py-3 rounded-sm text-[12px] font-serif tracking-wider inline-block">测其他名字</Link>
            </div>
          </div>

          <p className="text-center text-ink-500 text-xs mt-4 mb-6">以上内容由AI生成，仅供传统文化参考</p>
        </div>
      </main>

      {/* 底部固定栏 */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-ink-900/94 backdrop-blur-md border-t border-gold-400/8 transition-transform duration-500 ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-serif text-base font-bold tracking-wider truncate text-gold-200">{result.fullName}</span>
              <span className="text-xs shrink-0 text-ink-300">{result.score}分 · {grade.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={copyResult} className="text-ink-300 hover:text-gold-400 transition-colors px-2 py-2 rounded-sm text-[11px]"><Copy size={12} /></button>
              <Link href="/test-name" className="btn-outline-gold px-4 py-2 rounded-sm text-[11px] font-serif tracking-wider inline-flex items-center gap-1.5"><Search size={9} />重测</Link>
              <Link href="/" className="btn-gold px-5 py-2 rounded-sm text-[11px] font-serif tracking-wider inline-flex items-center gap-1.5"><PenLine size={9} />AI起名</Link>
            </div>
          </div>
        </div>
      </div>

      {/* 回到顶部 */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`fixed bottom-20 right-6 z-35 w-9 h-9 rounded-full flex items-center justify-center bg-gold-400/[0.08] border border-gold-400/20 text-gold-400 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:bg-gold-400/[0.15] hover:-translate-y-0.5 ${showBackTop ? 'opacity-100 visible' : 'opacity-0 invisible'}`} aria-label="回到顶部"><ArrowUp size={14} /></button>

      {/* Toast */}
      {toast && (<div className="fixed top-6 right-6 z-[9999] px-5 py-3 bg-gold-400/[0.12] backdrop-blur-md border border-gold-400/22 text-ink-100 text-[13px] rounded-md animate-fade-in-up">{toast}</div>)}
    </div>
  );
}
