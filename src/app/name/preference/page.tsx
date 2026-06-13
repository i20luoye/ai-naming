'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { loadInput, loadBazi, savePreference, type BaziData, type InputData } from '@/lib/storage';

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

const STYLE_OPTIONS = ['诗词风', '现代风', '古典雅', '阳光感', '沉稳感'];
const POEM_OPTIONS = ['诗经', '楚辞', '论语', '唐诗', '宋词', '周易'];

export default function NamePreferencePage() {
  const router = useRouter();
  const [input, setInput] = useState<InputData | null>(null);
  const [bazi, setBazi] = useState<BaziData | null>(null);
  const [charCount, setCharCount] = useState<'single' | 'double'>('double');
  const [styles, setStyles] = useState<string[]>(['诗词风', '古典雅']);
  const [poemSources, setPoemSources] = useState<string[]>(['诗经', '楚辞']);
  const [excludeChars, setExcludeChars] = useState('');
  const [avoidHotNames, setAvoidHotNames] = useState(true);
  const [avoidHomophone, setAvoidHomophone] = useState(true);

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

  const toggleStyle = (s: string) => {
    setStyles((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const togglePoem = (p: string) => {
    setPoemSources((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const handleSubmit = () => {
    savePreference({
      charCount,
      styles,
      poemSources,
      excludeChars,
      avoidHotNames,
      avoidHomophone,
    });
    router.push('/name/result');
  };

  if (!bazi) return null;

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="起名偏好" stepLabel="[3/4]" backHref="/name/bazi" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <StepIndicator steps={steps} currentStep={2} />

        {/* 喜用神提示条 */}
        <div className="mt-6 p-3 rounded-lg bg-gold-400/5 border border-gold-400/10 text-sm text-ink-200">
          <i className="fa-solid fa-sparkles mr-1 text-gold-400" />
          喜用神为
          {bazi.xiYong.map((wx) => (
            <span key={wx} className="text-gold-400 font-semibold mx-0.5">{wx}</span>
          ))}
          ，建议名字补{bazi.xiYong.join('')}为佳
        </div>

        <div className="mt-6 space-y-5">
          {/* 名字字数 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-1">
            <label className="block text-sm text-ink-300 mb-3">名字字数</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCharCount('double')}
                className={`flex-1 py-2.5 rounded-lg border transition-all text-sm ${
                  charCount === 'double'
                    ? 'bg-gold-400/20 border-gold-400/50 text-gold-400'
                    : 'border-gold-400/12 text-ink-300 hover:border-gold-400/30'
                }`}
              >
                双字名
              </button>
              <button
                type="button"
                onClick={() => setCharCount('single')}
                className={`flex-1 py-2.5 rounded-lg border transition-all text-sm ${
                  charCount === 'single'
                    ? 'bg-gold-400/20 border-gold-400/50 text-gold-400'
                    : 'border-gold-400/12 text-ink-300 hover:border-gold-400/30'
                }`}
              >
                单字名
              </button>
            </div>
          </div>

          {/* 名字风格 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-2">
            <label className="block text-sm text-ink-300 mb-3">名字风格（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStyle(s)}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                    styles.includes(s)
                      ? 'bg-gold-400/20 border-gold-400/50 text-gold-400'
                      : 'border-gold-400/12 text-ink-300 hover:border-gold-400/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 诗词出处 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-3">
            <label className="block text-sm text-ink-300 mb-3">诗词出处偏好（可选）</label>
            <div className="flex flex-wrap gap-2">
              {POEM_OPTIONS.map((p) => (
                <label
                  key={p}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm cursor-pointer ${
                    poemSources.includes(p)
                      ? 'bg-gold-400/20 border-gold-400/50 text-gold-400'
                      : 'border-gold-400/12 text-ink-300 hover:border-gold-400/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={poemSources.includes(p)}
                    onChange={() => togglePoem(p)}
                    className="hidden"
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* 排除字 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-4">
            <label className="block text-sm text-ink-300 mb-2">排除字（可选）</label>
            <input
              type="text"
              value={excludeChars}
              onChange={(e) => setExcludeChars(e.target.value)}
              placeholder="输入不想要的字，空格分隔"
              className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition-all"
            />
          </div>

          {/* 智能避坑 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-5">
            <label className="block text-sm text-ink-300 mb-3">智能避坑</label>
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidHotNames}
                  onChange={(e) => setAvoidHotNames(e.target.checked)}
                  className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 accent-[#c8a45c]"
                />
                <span className="text-ink-200 text-sm">避免网红名/热名</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidHomophone}
                  onChange={(e) => setAvoidHomophone(e.target.checked)}
                  className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 accent-[#c8a45c]"
                />
                <span className="text-ink-200 text-sm">避免不良谐音</span>
              </label>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="mt-8 pb-8">
          <button
            onClick={handleSubmit}
            className="btn-gold block w-full py-3.5 rounded-lg text-ink-900 font-semibold text-center text-base hover:opacity-90 transition-all"
          >
            开始AI起名 <i className="fa-solid fa-arrow-right ml-1 text-sm" />
          </button>
        </div>
      </main>
    </div>
  );
}
