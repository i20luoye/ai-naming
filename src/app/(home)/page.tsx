import Link from 'next/link';
import { JinmingCard, GoldLine } from '@/components/tianyan/GoldLine';
import { WuxingTag } from '@/components/tianyan/WuxingTag';

const exampleNames = [
  { surname: '张', name: '悦宁', wuxing: ['木', '火', '火'] as const, score: 92, tag: '静谧', poem: '既见君子，云胡不宁' },
  { surname: '张', name: '泽萱', wuxing: ['水', '木', '木'] as const, score: 88, tag: '温润', poem: '泽及万世' },
  { surname: '张', name: '清越', wuxing: ['水', '土', '土'] as const, score: 85, tag: '清雅', poem: '清越之音' },
];

const features = [
  {
    icon: 'fa-solid fa-compass-drafting',
    title: '精准排盘',
    desc: '规则引擎保证100%准确',
  },
  {
    icon: 'fa-solid fa-yin-yang',
    title: '喜用神分析',
    desc: '不只是缺啥补啥',
  },
  {
    icon: 'fa-solid fa-feather-pointed',
    title: 'AI文化释义',
    desc: '诗词典故深度解读',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Hero */}
      <section className="py-20 text-center animate-fade-in-up-up">
        <div className="inline-block px-4 py-1.5 rounded-full bg-gold-400/10 text-gold-400 text-xs mb-6">
          传统文化数字化工具
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink-50 mb-4 leading-tight">
          为宝宝起一个<span className="text-gold-400 glow-gold">好名</span>
        </h1>
        <p className="text-ink-300 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          基于八字喜用神分析 · AI智能生成+诗词出处
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/name/input"
            className="btn-gold px-10 py-3.5 rounded-lg text-ink-900 font-semibold text-base inline-flex items-center gap-2"
          >
            开始八字起名 <i className="fa-solid fa-arrow-right text-sm" />
          </Link>
          <Link
            href="/test-name"
            className="text-gold-400/70 hover:text-gold-400 text-sm transition-colors inline-flex items-center gap-1"
          >
            已有名字？测一测 <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
      </section>

      <GoldLine />

      {/* 信任背书 */}
      <section className="py-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <JinmingCard key={i} className="text-center">
              <div className="w-12 h-12 rounded-full bg-gold-400/10 flex items-center justify-center mx-auto mb-4">
                <i className={`${f.icon} text-gold-400 text-lg`} />
              </div>
              <h3 className="font-serif text-lg text-ink-100 mb-2">{f.title}</h3>
              <p className="text-ink-400 text-sm">{f.desc}</p>
            </JinmingCard>
          ))}
        </div>
      </section>

      <GoldLine />

      {/* 今日推荐名字 */}
      <section className="py-16 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="font-serif text-2xl text-ink-100 text-center mb-8">今日推荐名字</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {exampleNames.map((n, i) => (
            <Link key={i} href="/name/detail">
              <JinmingCard>
                <div className="text-center">
                  <p className="font-serif text-2xl text-ink-50 mb-3">
                    {n.surname} {n.name}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    {n.wuxing.map((wx, j) => (
                      <WuxingTag key={j} wuxing={wx} />
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <span className="text-gold-400 font-mono text-lg font-semibold glow-gold-sm">{n.score}分</span>
                    <span className="text-ink-400">·</span>
                    <span className="text-ink-300">{n.tag}</span>
                  </div>
                  <p className="text-ink-400 text-xs italic mt-2">&ldquo;{n.poem}&rdquo;</p>
                </div>
              </JinmingCard>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
