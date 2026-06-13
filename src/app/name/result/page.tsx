'use client';

import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import Link from 'next/link';

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

const mockNames = [
  { surname: '张', name: '悦宁', wuxing: ['木', '火', '火'] as const, score: 92, sancai: '吉', style: '静谧', poem: '既见君子，云胡不宁', source: '《诗经·郑风》' },
  { surname: '张', name: '泽萱', wuxing: ['水', '木', '木'] as const, score: 88, sancai: '吉', style: '温润', poem: '泽及万世', source: '《庄子》' },
  { surname: '张', name: '清越', wuxing: ['水', '土', '土'] as const, score: 85, sancai: '吉', style: '清雅', poem: '清越之音', source: '《文心雕龙》' },
  { surname: '张', name: '润霖', wuxing: ['水', '水', '木'] as const, score: 83, sancai: '中', style: '温厚', poem: '润物细无声', source: '杜甫《春夜喜雨》' },
  { surname: '张', name: '沐禾', wuxing: ['水', '木', '木'] as const, score: 80, sancai: '吉', style: '自然', poem: '沐春风而思归', source: '《楚辞》' },
];

export default function NameResultPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="起名结果" stepLabel="[4/4]" backHref="/name/preference" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <StepIndicator steps={steps} currentStep={3} />

        {/* AI分析过程 */}
        <div className="jinming-card rounded-xl p-5 mt-8">
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-sparkles text-gold-400" />
            <h3 className="font-serif text-base text-ink-100">AI分析结果</h3>
          </div>
          <div className="text-ink-300 text-sm leading-relaxed" id="aiAnalysis">
            基于甲木日主、食神格，喜用神为水、木。建议名字补水木为佳，优先考虑诗词出处，兼顾音韵和谐。以下为AI精选名字——
          </div>
          <p className="text-ink-500 text-xs mt-3">
            以上内容由AI生成，仅供传统文化参考
          </p>
        </div>

        <GoldLine className="my-6" />

        {/* 名字列表 */}
        <div className="space-y-4">
          {mockNames.map((n, i) => (
            <Link key={i} href={`/name/detail?idx=${i}`}>
              <div className="jinming-card rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-serif text-2xl text-ink-50">
                    {n.surname} {n.name}
                  </p>
                  <span className="text-gold-400 font-mono text-xl font-semibold glow-gold-sm">
                    {n.score}分
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  {n.wuxing.map((wx, j) => (
                    <WuxingTag key={j} element={wx} />
                  ))}
                  <span className="text-ink-500 text-xs ml-2">
                    {n.sancai} · {n.style}
                  </span>
                </div>
                <p className="text-ink-400 text-sm italic">
                  &ldquo;{n.poem}&rdquo;
                  <span className="text-ink-500 text-xs ml-1">—— {n.source}</span>
                </p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gold-400/8">
                  <button
                    className="text-ink-400 hover:text-vermilion text-sm transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa-regular fa-heart mr-1" />收藏
                  </button>
                  <button
                    className="text-ink-400 hover:text-gold-400 text-sm transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa-regular fa-copy mr-1" />复制
                  </button>
                  <button
                    className="text-ink-400 hover:text-gold-400 text-sm transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa-solid fa-share-nodes mr-1" />分享
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 付费解锁区域 */}
        <div className="mt-8 relative overflow-hidden rounded-xl">
          <div className="blur-sm opacity-60 pointer-events-none">
            <div className="jinming-card rounded-xl p-5 h-24" />
          </div>
          <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-lock text-gold-400" />
              <span className="text-ink-100 text-sm">解锁全部名字 + AI深度解读</span>
            </div>
            <button className="bg-vermilion hover:bg-vermilion/90 text-ink-50 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
              ¥29.9 立即解锁
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
