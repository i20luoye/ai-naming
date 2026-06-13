'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import type { BaziData } from '@/lib/storage';

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

const WUXING_BG: Record<string, string> = {
  '金': 'bg-gold-400/20',
  '木': 'bg-green-400/20',
  '水': 'bg-blue-400/20',
  '火': 'bg-red-400/20',
  '土': 'bg-amber-300/20',
};

export default function NameBaziPage() {
  const router = useRouter();
  const [bazi, setBazi] = useState<BaziData | null>(null);
  const [surname, setSurname] = useState('');
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('tianyan_bazi');
    const inputRaw = localStorage.getItem('tianyan_input');
    if (raw) {
      setBazi(JSON.parse(raw));
    }
    if (inputRaw) {
      const input = JSON.parse(inputRaw);
      setSurname(input.surname || '');
    }
    // 四柱逐列淡入
    const timers = [0, 1, 2, 3].map((i) =>
      setTimeout(() => setAnimStep(i + 1), 300 * (i + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!bazi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="text-ink-400 text-sm">
          <i className="fa-solid fa-circle-exclamation mr-2" />
          未找到排盘数据，请重新输入信息
          <button onClick={() => router.push('/name/input')} className="ml-2 text-gold-400 underline">
            返回输入
          </button>
        </div>
      </div>
    );
  }

  const wuxingEntries = Object.entries(bazi.wuxingPercent).sort((a, b) => b[1] - a[1]);
  const totalPercent = wuxingEntries.reduce((sum, e) => sum + e[1], 0);

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="排盘结果" stepLabel="[2/4]" backHref="/name/input" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <StepIndicator steps={steps} currentStep={1} />

        {/* 八字命盘 */}
        <div className="mt-8 jinming-card rounded-xl p-6 animate-fade-in-up stagger-1">
          <h2 className="text-lg font-serif text-gold-400 mb-5 flex items-center gap-2">
            <i className="fa-solid fa-scroll text-sm" />
            {surname}某某 · 八字命盘
          </h2>

          {/* 四柱表格 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bazi.pillars.map((p, idx) => (
              <div
                key={p.pillar}
                className={`text-center p-4 rounded-lg bg-ink-800/40 border border-gold-400/8 transition-all duration-500 ${
                  animStep > idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <div className="text-xs text-ink-400 mb-2">{p.pillar}</div>
                <div className="font-mono text-3xl text-ink-100 leading-tight">
                  <div>{p.gan}</div>
                  <div>{p.zhi}</div>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  <span className={`inline-flex items-center gap-0.5 text-xs ${WUXING_COLORS[p.ganWuxing]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${WUXING_BG[p.ganWuxing]} ${WUXING_COLORS[p.ganWuxing]}`} />
                    {p.ganWuxing}
                  </span>
                  <span className={`inline-flex items-center gap-0.5 text-xs ${WUXING_COLORS[p.zhiWuxing]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${WUXING_BG[p.zhiWuxing]} ${WUXING_COLORS[p.zhiWuxing]}`} />
                    {p.zhiWuxing}
                  </span>
                </div>
                <div className="text-[10px] text-ink-500 mt-1.5">
                  {p.cangGan.join(' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <GoldLine />

        {/* 五行分布 */}
        <div className="jinming-card rounded-xl p-6 animate-fade-in-up stagger-2">
          <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-simple text-sm" />
            五行分布
          </h2>
          <div className="space-y-3">
            {wuxingEntries.map(([wx, pct]) => (
              <div key={wx} className="flex items-center gap-3">
                <WuxingTag wuxing={wx} />
                <div className="flex-1 h-2.5 bg-ink-800/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${WUXING_BG[wx]}`}
                    style={{ width: `${totalPercent > 0 ? (pct / totalPercent) * 100 : 0}%` }}
                  />
                </div>
                <span className={`text-sm font-mono ${WUXING_COLORS[wx]} w-10 text-right`}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <GoldLine />

        {/* 喜用神分析 */}
        <div className="jinming-card rounded-xl p-6 animate-fade-in-up stagger-3">
          <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-yin-yang text-sm" />
            喜用神分析
          </h2>

          {/* 格局标签 */}
          <div className="inline-block px-3 py-1 rounded-md bg-gold-400/10 text-gold-400 text-sm mb-3">
            {bazi.pattern}
          </div>

          {/* 日主分析 */}
          <p className="text-ink-200 text-sm mb-4">
            日主<strong className="text-gold-400">{bazi.dayMaster}</strong>（{bazi.dayMasterWuxing}）偏<strong className="text-gold-400">{bazi.strength}</strong>
            ，{bazi.pattern}格局分析如下：
          </p>

          {/* 喜用神 */}
          <div className="mb-4">
            <span className="text-ink-300 text-sm">喜用神：</span>
            <div className="inline-flex gap-2 ml-2">
              {bazi.xiYong.map((wx) => (
                <span key={wx} className={`px-3 py-1 rounded-md text-base font-semibold ${WUXING_BG[wx]} ${WUXING_COLORS[wx]}`}>
                  {wx}
                </span>
              ))}
            </div>
          </div>

          {/* 忌神 */}
          <div className="mb-4">
            <span className="text-ink-400 text-sm">忌神：</span>
            <div className="inline-flex gap-2 ml-2">
              {bazi.jiShen.map((wx) => (
                <span key={wx} className="px-3 py-1 rounded-md text-base font-semibold bg-ink-700/40 text-ink-400">
                  {wx}
                </span>
              ))}
            </div>
          </div>

          {/* 差异化提示 */}
          <div className="p-3 rounded-lg bg-gold-400/5 border border-gold-400/10 text-ink-300 text-xs">
            <i className="fa-solid fa-lightbulb mr-1 text-gold-400" />
            不是简单「缺啥补啥」，而是基于格局分析 + 扶抑调候，综合判定喜用神方向
          </div>
        </div>

        {/* 合规标识 */}
        <p className="text-ink-500 text-xs text-center mt-6">
          以上内容由AI生成，仅供传统文化参考
        </p>

        {/* 底部按钮 */}
        <div className="mt-6 pb-8">
          <button
            onClick={() => router.push('/name/preference')}
            className="btn-gold block w-full py-3.5 rounded-lg text-ink-900 font-semibold text-center text-base hover:opacity-90 transition-all"
          >
            下一步：起名偏好 <i className="fa-solid fa-arrow-right ml-1 text-sm" />
          </button>
        </div>
      </main>
    </div>
  );
}
