'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import { loadInput, loadBazi, savePreference, type BaziData, type InputData } from '@/lib/storage';
import {
  TextCursorInput,
  Palette,
  BookOpen,
  Settings,
  Ban,
  Shield,
  Users,
  Volume2,
  Type,
  EqualNot,
  CheckCircle,
  ArrowLeft,
  Zap,
  ChevronDown,
  Plus,
  X,
  Sparkles,
  User,
} from 'lucide-react';

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

/* 风格与五行气质映射 — 用于命理推荐标记 */
const STYLE_WUXING_MAP: Record<string, string[]> = {
  '文雅': ['木', '水'],
  '大气': ['土', '金'],
  '古风': ['木', '水'],
  '清新': ['木', '水'],
  '刚毅': ['金', '火'],
  '温润': ['木', '水'],
  '灵动': ['水', '木'],
  '沉稳': ['土', '金'],
};

const STYLE_LIST = ['文雅', '大气', '古风', '清新', '刚毅', '温润', '灵动', '沉稳'];

const SOURCE_LIST = ['诗经', '楚辞', '唐诗', '宋词', '论语', '周易', '道德经', '尚书'];

const WUXING_ICONS: Record<string, React.ReactNode> = {
  '金': <Sparkles className="w-2 h-2" />,
  '木': '🌿',
  '水': '💧',
  '火': '🔥',
  '土': '⛰️',
};

export default function NamePreferencePage() {
  const router = useRouter();
  const [input, setInput] = useState<InputData | null>(null);
  const [bazi, setBazi] = useState<BaziData | null>(null);
  const [nameLength, setNameLength] = useState<2 | 3 | 4>(3);
  const [styles, setStyles] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [excludeChars, setExcludeChars] = useState<string[]>([]);
  const [excludeInput, setExcludeInput] = useState('');
  const [avoidRepeat, setAvoidRepeat] = useState(true);
  const [avoidHomophone, setAvoidHomophone] = useState(true);
  const [avoidRare, setAvoidRare] = useState(true);
  const [avoidElder, setAvoidElder] = useState(false);
  const [elderChars, setElderChars] = useState<string[]>([]);
  const [elderInput, setElderInput] = useState('');
  const [advOpen, setAdvOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const inputData = loadInput();
    const baziData = loadBazi();
    if (!inputData || !baziData) {
      router.push('/name/input');
      return;
    }
    setInput(inputData);
    setBazi(baziData);
  }, [router]);

  useEffect(() => {
    if (bazi) {
      const t = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(t);
    }
  }, [bazi]);

  const xiList = bazi?.xiYong ?? ['木', '水'];
  const dayGan = bazi?.dayMaster ?? '壬';
  const dayWx = bazi?.dayMasterWuxing ?? '水';
  const surname = input?.surname ?? '张';

  const isStyleRecommended = useCallback(
    (style: string) => {
      const wxList = STYLE_WUXING_MAP[style] ?? [];
      return wxList.some((wx) => xiList.includes(wx));
    },
    [xiList],
  );

  const toggleStyle = (s: string) => {
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const toggleSource = (s: string) => {
    setSources((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const addExcludeChar = useCallback(() => {
    const raw = excludeInput.replace(/[,，、\s]+/g, ',').replace(/^,|,$/g, '');
    if (!raw) return;
    const chars = raw.split(',');
    const newChars = chars.map((c) => c.trim()).filter((c) => c && !excludeChars.includes(c));
    if (newChars.length > 0) {
      setExcludeChars((prev) => [...prev, ...newChars]);
    }
    setExcludeInput('');
  }, [excludeInput, excludeChars]);

  const removeExcludeChar = (char: string) => {
    setExcludeChars((prev) => prev.filter((c) => c !== char));
  };

  const addElderChar = useCallback(() => {
    const raw = elderInput.replace(/[,，、\s]+/g, ',').replace(/^,|,$/g, '');
    if (!raw) return;
    const chars = raw.split(',');
    const newChars = chars.map((c) => c.trim()).filter((c) => c && !elderChars.includes(c));
    if (newChars.length > 0) {
      setElderChars((prev) => [...prev, ...newChars]);
    }
    setElderInput('');
  }, [elderInput, elderChars]);

  const removeElderChar = (char: string) => {
    setElderChars((prev) => prev.filter((c) => c !== char));
  };

  const buildSummary = () => {
    const parts: string[] = [];
    parts.push(`${nameLength}字名`);
    if (styles.length > 0) parts.push(styles.join('·'));
    else parts.push('待选风格');
    if (sources.length > 0) parts.push(sources.join('·'));
    else parts.push('待选出处');
    if (excludeChars.length > 0) parts.push(`排除${excludeChars.length}字`);
    const avoids: string[] = [];
    if (avoidRepeat) avoids.push('重名');
    if (avoidHomophone) avoids.push('谐音');
    if (avoidRare) avoids.push('生僻');
    if (avoidElder) avoids.push('避讳');
    if (avoids.length > 0) parts.push(`避坑: ${avoids.join('/')}`);
    return parts.join(' · ');
  };

  const handleSubmit = () => {
    savePreference({
      charCount: nameLength === 2 ? 'single' : 'double',
      styles,
      poemSources: sources,
      excludeChars: excludeChars.join(' '),
      avoidHotNames: avoidRepeat,
      avoidHomophone,
    });
    router.push('/name/result');
  };

  if (!bazi) return null;

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="起名偏好" stepLabel="[3/4]" backHref="/name/bazi" />

      <main className="flex-1 px-6 pt-4 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* 跨页面进度条 */}
          <div
            className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          >
            <StepIndicator steps={steps} currentStep={2} />
          </div>

          {/* 命理摘要条 */}
          <div
            className={`mt-8 mb-10 rounded-sm px-6 py-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] bg-gold-400/[0.03] border border-gold-400/[0.08] transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-gold-600" />
              <span className="font-serif text-gold-200">{surname}</span>
            </div>
            <div className="text-gold-400/15">|</div>
            <div>
              日主 <span className="font-serif font-bold text-gold-200">{dayGan}</span>
              属{dayWx}
            </div>
            <div className="text-gold-400/15">|</div>
            <div className="flex items-center gap-1.5">
              喜用神
              {xiList.map((wx) => (
                <WuxingTag key={wx} wuxing={wx} />
              ))}
            </div>
          </div>

          {/* 伍·起名偏好 — 左右分栏 */}
          <section>
            <div className="grid md:grid-cols-5 gap-6 md:gap-10">
              {/* 左侧注解 */}
              <div
                className={`hidden md:flex md:col-span-2 flex-col justify-center transition-all duration-700 delay-200 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              >
                <span className="inline-block font-serif text-[11px] tracking-[0.3em] mb-4 text-gold-600">
                  STEP FOUR
                </span>
                <div className="font-serif text-5xl font-bold tracking-[0.15em] mb-3 glow-gold-strong text-gold-200">
                  伍
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-wider mb-2 text-ink-100">
                  起名偏好
                </h2>
                <p className="font-serif text-base tracking-wider mb-6 text-ink-300 font-light">
                  心之所向，名随其愿
                </p>
                <div className="gold-line max-w-[40px] mb-6" />
                <p className="text-sm leading-relaxed mb-4 text-ink-300">
                  命理决定五行方向，偏好决定风格气质。您希望名字传达怎样的意境？
                </p>
                <p className="text-sm leading-relaxed mb-4 text-ink-300">
                  标有
                  <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] bg-green-400/10 text-green-400 border border-green-400/25">
                    荐
                  </span>
                  的风格与命理喜用神更契合，优先选择效果更佳。
                </p>
                <p className="text-xs leading-relaxed text-ink-400/70">
                  核心设置建议填写，高级选项可跳过，AI将按命理最优自动匹配。
                </p>
                <div className="mt-8 opacity-[0.05]">
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <rect
                      x="4"
                      y="4"
                      width="48"
                      height="48"
                      rx="4"
                      fill="none"
                      stroke="var(--color-gold-400)"
                      strokeWidth="1.5"
                    />
                    <text
                      x="28"
                      y="36"
                      textAnchor="middle"
                      fontFamily="'Noto Serif SC', serif"
                      fontSize="20"
                      fontWeight="900"
                      fill="var(--color-gold-400)"
                    >
                      意
                    </text>
                  </svg>
                </div>
              </div>

              {/* 右侧内容 */}
              <div className="md:col-span-3">
                {/* 移动端标题 */}
                <div
                  className={`flex md:hidden items-center gap-3 mb-5 transition-all duration-700 delay-200 ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  <div className="font-serif text-3xl font-bold glow-gold-strong text-gold-200">伍</div>
                  <div>
                    <h2 className="font-serif text-lg font-bold tracking-wider text-ink-100">起名偏好</h2>
                    <p className="text-xs text-ink-300">心之所向，名随其愿</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* ====== 核心：名字字数 ====== */}
                  <div
                    className={`jinming-card rounded-sm p-5 border-gold-400/[0.18] [&::before]:h-[2px] [&::before]:opacity-60 transition-all duration-700 delay-300 ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                        <TextCursorInput className="w-3.5 h-3.5 text-gold-400" />
                      </div>
                      <div>
                        <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">
                          名字字数
                        </div>
                        <div className="text-[10px] text-ink-300">包含姓氏的总字数</div>
                      </div>
                      <span className="ml-auto inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[3px] text-[9px] bg-gold-400/[0.12] text-gold-400 border border-gold-400/25 tracking-[0.05em]">
                        推荐设置
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {/* 字数按钮-二字 */}
                      <button
                        type="button"
                        onClick={() => setNameLength(2)}
                        className={`pref-btn rounded-sm py-4 flex flex-col items-center gap-2 bg-gold-400/[0.04] border transition-all duration-300 cursor-pointer ${
                          nameLength === 2
                            ? 'border-gold-400 bg-gold-400/[0.12] text-gold-200'
                            : 'border-gold-400/15 text-ink-100 hover:border-gold-400/30 hover:bg-gold-400/[0.06]'
                        }`}
                      >
                        <span className="font-serif text-lg tracking-wider">二字</span>
                        <span className="text-[10px] text-ink-300">姓+名</span>
                      </button>
                      {/* 字数按钮-三字 */}
                      <button
                        type="button"
                        onClick={() => setNameLength(3)}
                        className={`pref-btn rounded-sm py-4 flex flex-col items-center gap-2 bg-gold-400/[0.04] border transition-all duration-300 cursor-pointer ${
                          nameLength === 3
                            ? 'border-gold-400 bg-gold-400/[0.12] text-gold-200'
                            : 'border-gold-400/15 text-ink-100 hover:border-gold-400/30 hover:bg-gold-400/[0.06]'
                        }`}
                      >
                        <span className="font-serif text-lg tracking-wider">三字</span>
                        <span className="text-[10px] text-ink-300">姓+名+名</span>
                      </button>
                      {/* 字数按钮-四字 */}
                      <button
                        type="button"
                        onClick={() => setNameLength(4)}
                        className={`pref-btn rounded-sm py-4 flex flex-col items-center gap-2 bg-gold-400/[0.04] border transition-all duration-300 cursor-pointer ${
                          nameLength === 4
                            ? 'border-gold-400 bg-gold-400/[0.12] text-gold-200'
                            : 'border-gold-400/15 text-ink-100 hover:border-gold-400/30 hover:bg-gold-400/[0.06]'
                        }`}
                      >
                        <span className="font-serif text-lg tracking-wider">四字</span>
                        <span className="text-[10px] text-ink-300">复姓或双名</span>
                      </button>
                    </div>
                  </div>

                  {/* ====== 核心：名字风格 ====== */}
                  <div
                    className={`jinming-card rounded-sm p-5 border-gold-400/[0.18] [&::before]:h-[2px] [&::before]:opacity-60 transition-all duration-700 delay-[350ms] ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                        <Palette className="w-3.5 h-3.5 text-gold-400" />
                      </div>
                      <div>
                        <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">
                          名字风格
                        </div>
                        <div className="text-[10px] text-ink-300">可多选，AI将融合您偏好的气质</div>
                      </div>
                      <span className="ml-auto inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[3px] text-[9px] bg-gold-400/[0.12] text-gold-400 border border-gold-400/25 tracking-[0.05em]">
                        推荐设置
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* 风格标签-文雅 */}
                      {STYLE_LIST.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleStyle(s)}
                          className={`relative px-4 py-1.5 rounded text-[12px] font-serif cursor-pointer border transition-all duration-300 ${
                            styles.includes(s)
                              ? 'border-gold-400 bg-gold-400/10 text-gold-200'
                              : 'border-gold-400/15 text-ink-300 bg-transparent hover:border-gold-400/30 hover:text-ink-100'
                          }`}
                        >
                          {s}
                          {isStyleRecommended(s) && (
                            <span
                              className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] leading-none border transition-all duration-300 ${
                                styles.includes(s)
                                  ? 'bg-green-400/25 border-green-400/35 text-green-400'
                                  : 'bg-green-400/15 border-green-400/35 text-green-400'
                              }`}
                            >
                              荐
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] mt-3 text-ink-300">
                      标有{' '}
                      <span className="inline-flex items-center px-1 py-0 rounded text-[8px] bg-green-400/10 text-green-400 border border-green-400/25">
                        荐
                      </span>{' '}
                      的风格与命理喜用更契合
                    </p>
                  </div>

                  {/* ====== 诗词出处 ====== */}
                  <div
                    className={`jinming-card rounded-sm p-5 transition-all duration-700 delay-[400ms] ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400/10 border border-gold-400/20">
                        <BookOpen className="w-3.5 h-3.5 text-gold-400" />
                      </div>
                      <div>
                        <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">
                          诗词出处
                        </div>
                        <div className="text-[10px] text-ink-300">可多选，AI将从所选典籍引经据典</div>
                      </div>
                      <span className="ml-auto inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[3px] text-[9px] bg-gold-400/[0.05] text-ink-300 border border-gold-400/10 tracking-[0.05em]">
                        可选
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* 诗词出处标签 */}
                      {SOURCE_LIST.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSource(s)}
                          className={`px-4 py-1.5 rounded text-[12px] font-serif cursor-pointer border transition-all duration-300 ${
                            sources.includes(s)
                              ? 'border-gold-400 bg-gold-400/10 text-gold-200'
                              : 'border-gold-400/15 text-ink-300 bg-transparent hover:border-gold-400/30 hover:text-ink-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ====== 高级选项（折叠） ====== */}
                  <div
                    className={`jinming-card rounded-sm overflow-hidden transition-all duration-700 delay-[450ms] ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                  >
                    {/* 折叠触发区 */}
                    <button
                      type="button"
                      onClick={() => setAdvOpen(!advOpen)}
                      className="w-full flex items-center justify-between p-5 cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-vermilion/[0.06] border border-vermilion/[0.12]">
                          <Settings className="w-3.5 h-3.5 text-vermilion" />
                        </div>
                        <div>
                          <div className="font-serif text-sm font-semibold tracking-wider text-gold-200">
                            高级选项
                          </div>
                          <div className="text-[10px] text-ink-300">排除字 · 智能避坑 · 长辈避讳</div>
                        </div>
                        <span className="ml-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[3px] text-[9px] bg-gold-400/[0.05] text-ink-300 border border-gold-400/10 tracking-[0.05em]">
                          可选
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-ink-300 transition-transform duration-300 ${
                          advOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* 折叠内容 */}
                    <div
                      className={`transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        advOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                      } overflow-hidden`}
                    >
                      <div className="px-5 pb-5 space-y-5">
                        {/* 排除字 */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Ban className="w-2.5 h-2.5 text-vermilion" />
                            <span className="font-serif text-[13px] tracking-wider text-gold-200">排除字</span>
                            <span className="text-[10px] text-ink-300">名字中避免出现的字</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={excludeInput}
                              onChange={(e) => setExcludeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
                                  e.preventDefault();
                                  addExcludeChar();
                                }
                              }}
                              placeholder="输入字后按回车添加"
                              className="input-ritual flex-1 px-4 py-3 rounded-sm text-sm"
                            />
                            <button
                              type="button"
                              onClick={addExcludeChar}
                              className="btn-outline-gold px-4 py-3 rounded-sm text-[11px] flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          {excludeChars.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {excludeChars.map((char) => (
                                <span
                                  key={char}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[13px] font-serif text-gold-200 bg-gold-400/10 border border-gold-400/25 transition-all duration-200 hover:bg-gold-400/15"
                                >
                                  {char}
                                  <button
                                    type="button"
                                    onClick={() => removeExcludeChar(char)}
                                    className="opacity-50 hover:opacity-100 hover:text-vermilion transition-all duration-200 text-[10px] leading-none"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] mt-2 text-ink-300">
                            常用于避开家族辈分字、不喜欢的字或谐音不佳的字
                          </p>
                        </div>

                        <div className="gold-line" />

                        {/* 智能避坑 */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-2.5 h-2.5 text-gold-400" />
                            <span className="font-serif text-[13px] tracking-wider text-gold-200">
                              智能避坑
                            </span>
                            <span className="text-[10px] text-ink-300">
                              AI自动检测并规避常见问题
                            </span>
                          </div>
                          <div className="space-y-3">
                            {/* 重名规避 */}
                            <div className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-gold-600" />
                                <span className="text-sm text-ink-100">重名规避</span>
                                <span className="text-[10px] ml-1 text-ink-300">避开高频重名字</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setAvoidRepeat(!avoidRepeat)}
                                className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${
                                  avoidRepeat
                                    ? 'bg-gold-400/25 border border-gold-400'
                                    : 'bg-gold-400/12 border border-gold-400/20'
                                }`}
                              >
                                <span
                                  className={`absolute top-[2px] w-[18px] h-[18px] rounded-full transition-all duration-300 ${
                                    avoidRepeat
                                      ? 'left-[22px] bg-gold-400'
                                      : 'left-[2px] bg-gold-600'
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="gold-line" />

                            {/* 谐音检查 */}
                            <div className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <Volume2 className="w-3 h-3 text-gold-600" />
                                <span className="text-sm text-ink-100">谐音检查</span>
                                <span className="text-[10px] ml-1 text-ink-300">避免不良谐音联想</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setAvoidHomophone(!avoidHomophone)}
                                className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${
                                  avoidHomophone
                                    ? 'bg-gold-400/25 border border-gold-400'
                                    : 'bg-gold-400/12 border border-gold-400/20'
                                }`}
                              >
                                <span
                                  className={`absolute top-[2px] w-[18px] h-[18px] rounded-full transition-all duration-300 ${
                                    avoidHomophone
                                      ? 'left-[22px] bg-gold-400'
                                      : 'left-[2px] bg-gold-600'
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="gold-line" />

                            {/* 生僻字过滤 */}
                            <div className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <Type className="w-3 h-3 text-gold-600" />
                                <span className="text-sm text-ink-100">生僻字过滤</span>
                                <span className="text-[10px] ml-1 text-ink-300">只推荐常用易读字</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setAvoidRare(!avoidRare)}
                                className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${
                                  avoidRare
                                    ? 'bg-gold-400/25 border border-gold-400'
                                    : 'bg-gold-400/12 border border-gold-400/20'
                                }`}
                              >
                                <span
                                  className={`absolute top-[2px] w-[18px] h-[18px] rounded-full transition-all duration-300 ${
                                    avoidRare
                                      ? 'left-[22px] bg-gold-400'
                                      : 'left-[2px] bg-gold-600'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="gold-line" />

                        {/* 长辈避讳 */}
                        <div>
                          <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <EqualNot className="w-3 h-3 text-gold-600" />
                              <span className="text-sm text-ink-100">长辈避讳</span>
                              <span className="text-[10px] ml-1 text-ink-300">避开父母名字用字</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAvoidElder(!avoidElder)}
                              className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${
                                avoidElder
                                  ? 'bg-gold-400/25 border border-gold-400'
                                  : 'bg-gold-400/12 border border-gold-400/20'
                              }`}
                            >
                              <span
                                className={`absolute top-[2px] w-[18px] h-[18px] rounded-full transition-all duration-300 ${
                                  avoidElder
                                    ? 'left-[22px] bg-gold-400'
                                    : 'left-[2px] bg-gold-600'
                                }`}
                              />
                            </button>
                          </div>
                          {avoidElder && (
                            <div className="mt-3">
                              <input
                                type="text"
                                value={elderInput}
                                onChange={(e) => setElderInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
                                    e.preventDefault();
                                    addElderChar();
                                  }
                                }}
                                placeholder="输入父母名字中的用字，按回车添加"
                                className="input-ritual w-full px-4 py-3 rounded-sm text-sm"
                              />
                              {elderChars.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {elderChars.map((char) => (
                                    <span
                                      key={char}
                                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[13px] font-serif text-gold-200 bg-gold-400/10 border border-gold-400/25 transition-all duration-200 hover:bg-gold-400/15"
                                    >
                                      {char}
                                      <button
                                        type="button"
                                        onClick={() => removeElderChar(char)}
                                        className="opacity-50 hover:opacity-100 hover:text-vermilion transition-all duration-200 text-[10px] leading-none"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ====== 偏好摘要确认 ====== */}
          <div
            className={`mt-8 transition-all duration-700 delay-[500ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <div className="bg-gradient-to-br from-gold-400/[0.08] to-gold-400/[0.02] border border-gold-400/20 rounded-md px-6 py-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-gold-400" />
                <span className="font-serif text-sm font-semibold tracking-wider text-gold-200">
                  偏好确认
                </span>
              </div>
              <div className="text-[12px] leading-relaxed text-ink-300">{buildSummary()}</div>
            </div>
          </div>

          {/* ====== 底部CTA ====== */}
          <div
            className={`mt-6 flex items-center justify-between transition-all duration-700 delay-[600ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <Link
              href="/name/bazi"
              className="btn-outline-gold px-5 py-2.5 rounded-sm text-[11px] font-serif tracking-wider inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-2.5 h-2.5" />
              返回排盘
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-gold px-9 py-3 rounded-sm font-serif text-[12px] tracking-[0.2em] inline-flex items-center gap-2"
              style={{ animation: 'node-pulse 2s ease-in-out infinite' }}
            >
              开始起名
              <Zap className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </main>

      {/* node-pulse 动画 — 匹配设计稿 */}
      <style jsx>{`
        @keyframes node-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(200, 164, 92, 0.35);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(200, 164, 92, 0);
          }
        }
      `}</style>
    </div>
  );
}
