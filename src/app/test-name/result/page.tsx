'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import type { TestNameResult } from '@/lib/storage';

const WUXING_COLORS: Record<string, string> = {
  '金': 'text-gold-400',
  '木': 'text-green-400',
  '水': 'text-blue-400',
  '火': 'text-red-400',
  '土': 'text-amber-300',
};

const WUXING_BG: Record<string, string> = {
  '金': 'bg-gold-400/20',
  '木': 'bg-green-400/20',
  '水': 'bg-blue-400/20',
  '火': 'bg-red-400/20',
  '土': 'bg-amber-300/20',
};

export default function TestNameResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<TestNameResult | null>(null);
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('tianyan_test_result');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setResult(data);
        // 圆环分数动画
        let current = 0;
        const target = data.score || 0;
        const timer = setInterval(() => {
          current += 1;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setAnimScore(current);
        }, 15);
        return () => clearInterval(timer);
      } catch { /* ignore */ }
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="text-ink-400 text-sm">
          未找到测名数据
          <button onClick={() => router.push('/test-name')} className="ml-2 text-gold-400 underline">
            返回测名
          </button>
        </div>
      </div>
    );
  }

  const wuxingEntries = Object.entries(result.wuxing || {}).sort((a, b) => b[1] - a[1]);
  const maxWuxing = Math.max(...wuxingEntries.map((e) => e[1]), 1);

  // SVG 圆环参数
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animScore / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="测名结果" backHref="/test-name" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* 名字 + 圆环评分 */}
        <div className="jinming-card rounded-xl p-6 animate-fade-in-up stagger-1 text-center">
          <h1 className="text-4xl font-serif text-ink-100 mb-4" style={{ textShadow: '0 0 20px rgba(200,164,92,0.15)' }}>
            {result.fullName}
          </h1>

          {/* 圆环评分 */}
          <div className="inline-block relative mb-4">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(200,164,92,0.1)" strokeWidth="8" />
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke="#c8a45c"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 70 70)"
                className="transition-all duration-100"
                style={{ filter: 'drop-shadow(0 0 6px rgba(200,164,92,0.4))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono text-gold-400" style={{ textShadow: '0 0 12px rgba(200,164,92,0.3)' }}>
                {animScore}
              </span>
              <span className="text-ink-400 text-xs">综合评分</span>
            </div>
          </div>

          {/* 快速指标 */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-lg text-gold-400 font-mono">{result.wuxingMatch}%</div>
              <div className="text-ink-400 text-xs">五行匹配度</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-gold-400">{result.sancaiConfig}</div>
              <div className="text-ink-400 text-xs">三才配置</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-gold-400 font-mono">{result.yinyunScore}</div>
              <div className="text-ink-400 text-xs">音韵评分</div>
            </div>
          </div>
        </div>

        <GoldLine />

        {/* 五行匹配分析 */}
        <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-2">
          <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-yin-yang text-sm" />
            五行匹配分析
          </h2>
          <div className="space-y-2.5 mb-4">
            {wuxingEntries.map(([wx, val]) => (
              <div key={wx} className="flex items-center gap-3">
                <WuxingTag wuxing={wx} />
                <div className="flex-1 h-2 bg-ink-800/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${WUXING_BG[wx]}`}
                    style={{ width: `${(val / maxWuxing) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-mono ${WUXING_COLORS[wx]} w-8 text-right`}>{val}</span>
              </div>
            ))}
          </div>
          <p className="text-ink-300 text-sm">
            名字五行：{result.nameWuxing}
          </p>
          <div className="flex items-start gap-2 mt-2 text-sm text-ink-200">
            <i className="fa-solid fa-circle-check text-green-400 mt-0.5" />
            {result.matchConclusion}
          </div>
        </div>

        <GoldLine />

        {/* 三才五格 */}
        {result.wuge && result.wuge.length > 0 && (
          <>
            <div className="jinming-card rounded-xl p-5">
              <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-grid text-sm" />
                三才五格
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-ink-400 border-b border-gold-400/8">
                      <th className="py-2 text-left font-normal">格局</th>
                      <th className="py-2 text-center font-normal">笔画</th>
                      <th className="py-2 text-center font-normal">五行</th>
                      <th className="py-2 text-right font-normal">吉凶</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.wuge.map((g, i) => (
                      <tr key={i} className="border-b border-gold-400/5">
                        <td className="py-2.5 text-ink-200">{g.name}</td>
                        <td className="py-2.5 text-center font-mono text-ink-100">{g.strokes}</td>
                        <td className="py-2.5 text-center">
                          <span className={WUXING_COLORS[g.wx]}>{g.wx}</span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            g.luck === '吉' ? 'bg-green-400/10 text-green-400' :
                            g.luck === '凶' ? 'bg-red-400/10 text-red-400' :
                            'bg-amber-400/10 text-amber-400'
                          }`}>
                            {g.luck}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <GoldLine />
          </>
        )}

        {/* 音韵和谐度 */}
        <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-3">
          <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-music text-sm" />
            音韵和谐度
          </h2>
          {result.tones && result.tones.length > 0 && (
            <div className="flex items-center gap-2 mb-3 text-sm">
              {result.tones.map((t, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <i className="fa-solid fa-arrow-right text-ink-500 text-xs" />}
                  <span className="text-ink-100">{t.char}</span>
                  <span className="text-ink-400">({t.tone}声)</span>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-ink-200">
            <i className="fa-solid fa-circle-check text-green-400" />
            {result.homophone || '未发现不良谐音'}
          </div>
        </div>

        <GoldLine />

        {/* 重名风险 */}
        <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-4">
          <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-users text-sm" />
            重名与热名风险
          </h2>
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink-300">重名概率</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                result.repeatLevel === '低' ? 'bg-green-400/10 text-green-400' :
                result.repeatLevel === '高' ? 'bg-red-400/10 text-red-400' :
                'bg-amber-400/10 text-amber-400'
              }`}>{result.repeatLevel || '中等'}</span>
            </div>
            <div className="h-2 bg-ink-800/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  result.repeatLevel === '低' ? 'bg-green-400/40' :
                  result.repeatLevel === '高' ? 'bg-red-400/40' :
                  'bg-amber-400/40'
                }`}
                style={{ width: `${result.repeatRisk || 50}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-200">
            <i className="fa-solid fa-circle-check text-green-400" />
            {result.hotName || '未进入近3年热门名字TOP100'}
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push('/test-name')}
            className="flex-1 py-3 rounded-lg border border-gold-400/20 text-gold-400 text-sm font-medium hover:bg-gold-400/5 transition-all"
          >
            重新测名
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-lg btn-gold text-ink-900 text-sm font-semibold hover:opacity-90 transition-all"
          >
            去AI起名
          </button>
        </div>

        {/* 合规标识 */}
        <p className="text-ink-500 text-xs text-center mt-4 mb-6">
          以上内容由AI生成，仅供传统文化参考
        </p>
      </main>
    </div>
  );
}
