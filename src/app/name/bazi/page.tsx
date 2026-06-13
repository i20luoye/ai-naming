import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag, WuxingDot } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import Link from 'next/link';

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

// Mock data - will be replaced by API
const baziData = {
  surname: '张',
  gender: '男',
  birthDate: '2024-03-15',
  birthTime: '14:30',
  pillars: [
    { pillar: '年柱', gan: '庚', zhi: '午', wx: ['金', '火'], canggan: '丁己' },
    { pillar: '月柱', gan: '辛', zhi: '巳', wx: ['金', '火'], canggan: '庚丙戊' },
    { pillar: '日柱', gan: '甲', zhi: '子', wx: ['木', '水'], canggan: '癸' },
    { pillar: '时柱', gan: '丙', zhi: '寅', wx: ['火', '木'], canggan: '甲丙戊' },
  ],
  wuxing: { 金: 30, 木: 15, 水: 20, 火: 35, 土: 0 },
  pattern: '食神格',
  dayMaster: '日主甲木偏弱，食伤生财',
  xiYong: ['水', '木'],
  jiShen: ['金', '土'],
};

export default function NameBaziPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="排盘结果" stepLabel="[2/4]" backHref="/name/input" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <StepIndicator steps={steps} currentStep={1} />

        {/* 命盘卡片 */}
        <div className="jinming-card rounded-xl p-6 mt-8">
          <h2 className="font-serif text-lg text-ink-100 text-center mb-6">
            {baziData.surname}某某 · 八字命盘
          </h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            {baziData.pillars.map((p, i) => (
              <div key={i} className="pillar-col" style={{ animationDelay: `${i * 200}ms` }}>
                <p className="text-ink-400 text-xs mb-2">{p.pillar}</p>
                <p className="font-mono text-2xl text-gold-400 glow-gold-sm mb-1">
                  {p.gan}{p.zhi}
                </p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {p.wx.map((w, j) => (
                    <span key={j} className="flex items-center gap-0.5">
                      <WuxingDot element={w as '金'|'木'|'水'|'火'|'土'} />
                    </span>
                  ))}
                  <span className="text-ink-400 text-[10px] ml-0.5">
                    {p.wx.join('')}
                  </span>
                </div>
                <p className="text-ink-500 text-[10px]">藏干: {p.canggan}</p>
              </div>
            ))}
          </div>
        </div>

        <GoldLine className="my-8" />

        {/* 五行分布 */}
        <div className="jinming-card rounded-xl p-6">
          <h3 className="font-serif text-base text-ink-100 mb-5">五行分布</h3>
          <div className="space-y-3">
            {Object.entries(baziData.wuxing).map(([el, pct]) => (
              <div key={el} className="flex items-center gap-3">
                <WuxingTag element={el as '金'|'木'|'水'|'火'|'土'} />
                <div className="flex-1 h-2 bg-ink-800/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full wuxing-bar-${el}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-ink-300 text-sm font-mono w-10 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <GoldLine className="my-8" />

        {/* 喜用神分析 */}
        <div className="jinming-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-serif text-base text-ink-100">喜用神分析</h3>
            <span className="px-2 py-0.5 rounded bg-gold-400/10 text-gold-400 text-xs">
              {baziData.pattern}
            </span>
          </div>
          <p className="text-ink-300 text-sm mb-5">{baziData.dayMaster}</p>

          <div className="flex gap-6 mb-5">
            <div>
              <p className="text-ink-400 text-xs mb-2">喜用神</p>
              <div className="flex gap-2">
                {baziData.xiYong.map((x, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1.5 rounded-lg bg-gold-400/15 text-gold-400 font-serif text-lg glow-gold-sm"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-ink-400 text-xs mb-2">忌神</p>
              <div className="flex gap-2">
                {baziData.jiShen.map((x, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1.5 rounded-lg bg-ink-800/60 text-ink-400 font-serif text-lg"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 差异化提示 */}
          <div className="p-3 rounded-lg bg-teal-900/15 border border-teal-500/15 text-sm">
            <i className="fa-solid fa-lightbulb text-gold-400 mr-1.5" />
            <span className="text-ink-300">
              不是简单&ldquo;缺啥补啥&rdquo;，而是<span className="text-gold-400">格局分析</span>+<span className="text-gold-400">扶抑调候</span>
            </span>
          </div>
        </div>

        {/* 合规标识 */}
        <p className="text-ink-500 text-xs text-center mt-6">
          以上内容由AI生成，仅供传统文化参考
        </p>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-ink-900/90 backdrop-blur-sm pt-4 pb-6 mt-6">
          <Link
            href="/name/preference"
            className="gold-btn block w-full py-3.5 rounded-lg text-ink-900 font-semibold text-center text-base"
          >
            下一步：起名偏好 <i className="fa-solid fa-arrow-right ml-1 text-sm" />
          </Link>
        </div>
      </main>
    </div>
  );
}
