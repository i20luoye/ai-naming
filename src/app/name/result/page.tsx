'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import {
  loadInput, loadBazi, loadPreference, saveNames,
  type BaziData, type InputData, type PreferenceData, type NameItem,
} from '@/lib/storage';

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

const WUXING_COLORS: Record<string, string> = {
  '金': 'text-gold-400',
  '木': 'text-green-400',
  '水': 'text-blue-400',
  '火': 'text-red-400',
  '土': 'text-amber-300',
};

export default function NameResultPage() {
  const router = useRouter();
  const [input, setInput] = useState<InputData | null>(null);
  const [bazi, setBazi] = useState<BaziData | null>(null);
  const [names, setNames] = useState<NameItem[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

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

    // 检查是否已有缓存的结果
    const cached = localStorage.getItem('tianyan_names');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.names && parsed.names.length > 0) {
          setNames(parsed.names);
          setAnalysis(parsed.analysis || '');
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }
    }

    // 调用 AI 起名 API（流式）
    generateNames(inputData, baziData, prefData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateNames = async (
    inputData: InputData,
    baziData: BaziData,
    prefData: PreferenceData | null,
  ) => {
    setLoading(true);
    setStreaming(true);
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
          preference: prefData ? {
            charCount: prefData.charCount,
            styles: prefData.styles,
            poemSources: prefData.poemSources,
            excludeChars: prefData.excludeChars,
            avoidHotNames: prefData.avoidHotNames,
            avoidHomophone: prefData.avoidHomophone,
          } : undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // 解析 SSE 数据
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'analysis') {
                fullText += parsed.content;
                setAnalysis(fullText);
              } else if (parsed.type === 'names') {
                setNames(parsed.content);
              }
            } catch {
              // 可能是不完整的 JSON，追加到分析文本
              fullText += data;
              setAnalysis(fullText);
            }
          }
        }
      }

      // 保存结果
      saveNames({ analysis: fullText, names: names.length > 0 ? names : [] });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setAnalysis('AI分析暂时不可用，请稍后重试');
      }
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const toggleFavorite = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
    } catch { /* ignore */ }
  };

  if (!bazi) return null;

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="起名结果" stepLabel="[4/4]" backHref="/name/preference" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <StepIndicator steps={steps} currentStep={3} />

        {/* AI 分析区域 */}
        <div className="mt-8 jinming-card rounded-xl p-5 animate-fade-in-up stagger-1">
          <h2 className="text-base font-serif text-gold-400 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-sm" />
            AI分析结果
          </h2>
          <div className="text-ink-200 text-sm leading-relaxed min-h-[60px]">
            {loading && !analysis ? (
              <span className="inline-flex items-center gap-2 text-ink-400">
                <i className="fa-solid fa-spinner fa-spin" />
                AI正在分析中...
              </span>
            ) : (
              <>
                {analysis}
                {streaming && <span className="inline-block w-0.5 h-4 bg-gold-400 animate-pulse ml-0.5" />}
              </>
            )}
          </div>
          <p className="text-ink-500 text-xs mt-3">
            以上内容由AI生成，仅供传统文化参考
          </p>
        </div>

        {/* 名字卡片列表 */}
        {names.length > 0 && (
          <div className="mt-6 space-y-4">
            {names.map((name, idx) => (
              <div
                key={name.givenName + idx}
                onClick={() => {
                  localStorage.setItem('tianyan_selected_name', JSON.stringify(name));
                  router.push('/name/detail');
                }}
                className="jinming-card rounded-xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/30 hover:shadow-[0_4px_20px_rgba(200,164,92,0.08)]"
              >
                {/* 名字 + 五行 */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-serif text-ink-100">
                      {name.surname} · {name.givenName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {name.wuxing.map((wx, i) => (
                        <WuxingTag key={i} wuxing={wx} />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-mono text-gold-400" style={{ textShadow: '0 0 12px rgba(200,164,92,0.3)' }}>
                      {name.score}
                    </div>
                    <div className="text-xs text-ink-400">分</div>
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-gold-400/10 text-gold-400">
                    {name.sancai}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-gold-400/10 text-gold-400">
                    {name.style}
                  </span>
                </div>

                {/* 诗词出处 */}
                {name.poem && (
                  <p className="text-ink-300 text-sm italic border-l-2 border-gold-400/20 pl-3">
                    「{name.poem}」
                    {name.poemSource && (
                      <span className="text-ink-500 not-italic text-xs ml-1">——{name.poemSource}</span>
                    )}
                  </p>
                )}

                {/* 操作栏 */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gold-400/8">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(name.givenName); }}
                    className={`text-sm transition-colors ${
                      favorites.has(name.givenName) ? 'text-red-400' : 'text-ink-400 hover:text-gold-400'
                    }`}
                  >
                    <i className={`${favorites.has(name.givenName) ? 'fa-solid' : 'fa-regular'} fa-heart mr-1`} />
                    {favorites.has(name.givenName) ? '已收藏' : '收藏'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyName(`${name.surname}${name.givenName}`); }}
                    className="text-sm text-ink-400 hover:text-gold-400 transition-colors"
                  >
                    <i className="fa-regular fa-copy mr-1" />复制
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 付费解锁区 */}
        {names.length >= 5 && (
          <div className="mt-6 relative overflow-hidden rounded-xl">
            <div className="p-6 bg-ink-800/40 backdrop-blur-md border border-gold-400/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-ink-100 font-serif text-base">解锁全部名字 + AI深度解读</h3>
                  <p className="text-ink-400 text-xs mt-1">已展示 {names.length} 个免费名字</p>
                </div>
                <button className="px-5 py-2.5 rounded-lg bg-vermilion text-ink-50 font-semibold text-sm hover:opacity-90 transition-opacity">
                  ¥29.9 立即解锁
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />
      </main>
    </div>
  );
}
