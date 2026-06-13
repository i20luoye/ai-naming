import { WuxingTag, WuxingDot } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import { SubHeader } from '@/components/tianyan/SubHeader';
import Link from 'next/link';

const nameData = {
  surname: '张',
  fullName: '悦宁',
  wuxingChars: [
    { char: '悦', element: '火' as const },
    { char: '宁', element: '火' as const },
  ],
  score: 92,
  sancai: '吉',
  meaning: '静谧',
  xiYong: ['水', '木'],
  analysis: '名字整体火旺，与喜用神水木形成相生关系：木生火',
  buYiPath: ['木(喜)', '火(名)', '土(生)'],
  poem: {
    source: '《诗经·郑风》',
    text: '风雨潇潇，鸡鸣胶胶。既见君子，云胡不瘳。',
    yueMeaning: '"宁"取"安宁"之意，"悦"取"喜悦"之意',
  },
  scores: [
    { label: '喜用神匹配', stars: 4, score: 85 },
    { label: '三才五格', stars: 4, score: 90 },
    { label: '音韵和谐', stars: 5, score: 95 },
    { label: '寓意深度', stars: 4, score: 88 },
    { label: '重名风险', stars: 3, score: 0, extra: '低' },
    { label: '谐音检测', stars: 5, score: 0, extra: '无风险' },
  ],
};

function StarRating({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`fa-star text-xs ${i <= count ? 'fa-solid text-gold-400' : 'fa-regular text-ink-600'}`}
        />
      ))}
    </span>
  );
}

export default function NameDetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader
        title="名字解读"
        backHref="/name/result"
        rightAction={
          <button className="text-ink-400 hover:text-gold-400 transition-colors">
            <i className="fa-solid fa-share-nodes" />
          </button>
        }
      />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* 名字标题区 */}
        <div className="jinming-card rounded-xl p-6 text-center">
          <p className="font-serif text-4xl text-ink-50 mb-3">
            {nameData.surname} {nameData.fullName}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <WuxingTag element="木" />
            {nameData.wuxingChars.map((c, i) => (
              <WuxingTag key={i} element={c.element}>{c.char}({c.element})</WuxingTag>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div>
              <p className="text-gold-400 font-mono text-2xl font-semibold glow-gold-sm">{nameData.score}</p>
              <p className="text-ink-400 text-xs">综合分</p>
            </div>
            <div>
              <p className="text-ink-100 text-lg">{nameData.sancai}</p>
              <p className="text-ink-400 text-xs">三才</p>
            </div>
            <div>
              <p className="text-ink-100 text-lg">{nameData.meaning}</p>
              <p className="text-ink-400 text-xs">寓意</p>
            </div>
          </div>
        </div>

        <GoldLine className="my-6" />

        {/* 五行补益分析 */}
        <div className="jinming-card rounded-xl p-5">
          <h3 className="font-serif text-base text-ink-100 mb-4">五行补益分析</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-ink-400 text-xs">喜用神：</span>
            {nameData.xiYong.map((x, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-gold-400/15 text-gold-400 text-sm">{x}</span>
            ))}
          </div>
          <p className="text-ink-300 text-sm mb-4">{nameData.analysis}</p>
          <div className="flex items-center justify-center gap-2 text-sm">
            {nameData.buYiPath.map((p, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-gold-400/10 text-gold-400">{p}</span>
                {i < nameData.buYiPath.length - 1 && (
                  <i className="fa-solid fa-arrow-right text-ink-500 text-xs" />
                )}
              </span>
            ))}
          </div>
        </div>

        <GoldLine className="my-6" />

        {/* 诗词出处 */}
        <div className="jinming-card rounded-xl p-5">
          <h3 className="font-serif text-base text-ink-100 mb-4">诗词出处</h3>
          <p className="text-gold-400/80 text-sm italic mb-2">{nameData.poem.source}</p>
          <p className="text-ink-300 text-sm italic mb-3">&ldquo;{nameData.poem.text}&rdquo;</p>
          <p className="text-ink-400 text-xs">{nameData.poem.yueMeaning}</p>
        </div>

        <GoldLine className="my-6" />

        {/* 多维度评分 */}
        <div className="jinming-card rounded-xl p-5">
          <h3 className="font-serif text-base text-ink-100 mb-4">多维度评分</h3>
          <div className="space-y-3">
            {nameData.scores.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-ink-300 text-sm w-20">{s.label}</span>
                <StarRating count={s.stars} />
                <span className="text-ink-400 text-sm font-mono">
                  {s.extra || s.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex gap-4 mt-8 mb-6">
          <button className="flex-1 py-3 rounded-lg border border-gold-400/20 text-ink-300 hover:border-gold-400/40 hover:text-gold-400 transition-all text-sm">
            <i className="fa-regular fa-heart mr-1.5" />收藏
          </button>
          <button className="flex-1 py-3 rounded-lg border border-gold-400/20 text-ink-300 hover:border-gold-400/40 hover:text-gold-400 transition-all text-sm">
            <i className="fa-regular fa-copy mr-1.5" />复制名字
          </button>
        </div>

        <p className="text-ink-500 text-xs text-center mb-8">
          以上内容由AI生成，仅供传统文化参考
        </p>
      </main>
    </div>
  );
}
