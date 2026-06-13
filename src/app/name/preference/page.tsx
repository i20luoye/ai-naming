'use client';

import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import Link from 'next/link';

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

export default function NamePreferencePage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="起名偏好" stepLabel="[3/4]" backHref="/name/bazi" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <StepIndicator steps={steps} currentStep={2} />

        {/* 喜用神提示 */}
        <div className="mt-8 p-3 rounded-lg bg-teal-900/15 border border-teal-500/15 text-sm">
          <i className="fa-solid fa-lightbulb text-gold-400 mr-1.5" />
          <span className="text-ink-300">
            喜用神为<span className="text-gold-400">水</span>、<span className="text-gold-400">木</span>，建议名字补水木为佳
          </span>
        </div>

        <div className="mt-6 space-y-5">
          {/* 名字字数 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-3">名字字数</label>
            <div className="flex gap-3" id="charCountGroup">
              <button
                type="button"
                data-count="double"
                className="pref-btn flex-1 py-2.5 rounded-lg border border-gold-400/12 text-ink-300 transition-all text-sm active bg-gold-400/20 border-gold-400/50 text-gold-400"
              >
                双字名
              </button>
              <button
                type="button"
                data-count="single"
                className="pref-btn flex-1 py-2.5 rounded-lg border border-gold-400/12 text-ink-300 transition-all text-sm"
              >
                单字名
              </button>
            </div>
          </div>

          {/* 名字风格 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-3">名字风格（可多选）</label>
            <div className="flex flex-wrap gap-2" id="styleGroup">
              {['诗词风', '现代风', '古典雅', '阳光感', '沉稳感'].map((s, i) => (
                <button
                  key={s}
                  type="button"
                  data-style={s}
                  className={`pref-tag px-3 py-1.5 rounded-md border text-sm transition-all ${
                    i === 0 || i === 2
                      ? 'bg-gold-400/20 border-gold-400/50 text-gold-400'
                      : 'border-gold-400/12 text-ink-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 诗词出处偏好 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-3">诗词出处偏好（可选）</label>
            <div className="flex flex-wrap gap-3">
              {['诗经', '楚辞', '论语', '唐诗', '宋词', '周易'].map((s, i) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={i < 2}
                    className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 text-gold-400 focus:ring-gold-400/20 accent-[#c8a45c]"
                  />
                  <span className="text-ink-300 text-sm">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 排除字 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-2">排除字（可选）</label>
            <input
              type="text"
              placeholder="输入不想要的字，空格分隔"
              className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition-all"
            />
          </div>

          {/* 智能避坑 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-3">智能避坑</label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 text-gold-400 focus:ring-gold-400/20 accent-[#c8a45c]"
                />
                <span className="text-ink-300 text-sm">避免网红名/热名</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 text-gold-400 focus:ring-gold-400/20 accent-[#c8a45c]"
                />
                <span className="text-ink-300 text-sm">避免不良谐音</span>
              </label>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-ink-900/90 backdrop-blur-sm pt-4 pb-6 mt-6">
          <Link
            href="/name/result"
            className="gold-btn block w-full py-3.5 rounded-lg text-ink-900 font-semibold text-center text-base"
          >
            开始AI起名 <i className="fa-solid fa-arrow-right ml-1 text-sm" />
          </Link>
        </div>
      </main>

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  // Char count toggle
  document.querySelectorAll('#charCountGroup .pref-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#charCountGroup .pref-btn').forEach(b => {
        b.classList.remove('bg-gold-400/20', 'border-gold-400/50', 'text-gold-400', 'active');
        b.classList.add('border-gold-400/12', 'text-ink-300');
      });
      this.classList.remove('border-gold-400/12', 'text-ink-300');
      this.classList.add('bg-gold-400/20', 'border-gold-400/50', 'text-gold-400', 'active');
    });
  });

  // Style multi-select toggle
  document.querySelectorAll('#styleGroup .pref-tag').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('bg-gold-400/20');
      this.classList.toggle('border-gold-400/50');
      this.classList.toggle('text-gold-400');
      this.classList.toggle('border-gold-400/12');
      this.classList.toggle('text-ink-300');
    });
  });
})();
          `,
        }}
      />
    </div>
  );
}
