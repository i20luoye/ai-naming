import { WuxingTag, WuxingDot } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import { SubHeader } from '@/components/tianyan/SubHeader';
import Link from 'next/link';

const testData = {
  surname: '张',
  fullName: '悦宁',
  score: 92,
  wuxingMatch: 85,
  sancaiConfig: '吉',
  yinyunScore: 95,
  wuxing: { 金: 30, 木: 15, 水: 20, 火: 35, 土: 0 },
  nameWuxing: '悦(火) 宁(火)',
  matchConclusion: '名字火旺，与喜用神水木形成相生关系，匹配度良好',
  wuge: [
    { name: '天格', strokes: 11, wx: '木', luck: '吉' },
    { name: '人格', strokes: 19, wx: '火', luck: '吉' },
    { name: '地格', strokes: 17, wx: '金', luck: '吉' },
    { name: '外格', strokes: 9, wx: '水', luck: '凶' },
    { name: '总格', strokes: 27, wx: '金', luck: '吉' },
  ],
  tones: [
    { char: '张', tone: 1 },
    { char: '悦', tone: 4 },
    { char: '宁', tone: 2 },
  ],
  homophone: '未发现不良谐音',
  repeatRisk: 55,
  repeatLevel: '中等',
  hotName: '未进入近3年热门名字TOP100',
};

function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(200,164,92,0.1)" strokeWidth="4" />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="#c8a45c"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
          style={{ filter: 'drop-shadow(0 0 6px rgba(200,164,92,0.3))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-gold-400 font-mono text-3xl font-semibold glow-gold">{score}</span>
        <span className="text-ink-400 text-xs">综合评分</span>
      </div>
    </div>
  );
}

export default function TestNameResultPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="测名结果" backHref="/test-name" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* 名字标题区 */}
        <div className="jinming-card rounded-xl p-6 text-center">
          <p className="font-serif text-3xl text-ink-50 mb-4">
            {testData.surname} {testData.fullName}
          </p>
          <ScoreCircle score={testData.score} />
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div>
              <p className="text-gold-400 font-mono text-lg">{testData.wuxingMatch}%</p>
              <p className="text-ink-400 text-xs">五行匹配度</p>
            </div>
            <div>
              <p className="text-ink-100 text-lg">{testData.sancaiConfig}</p>
              <p className="text-ink-400 text-xs">三才配置</p>
            </div>
            <div>
              <p className="text-ink-100 text-lg">{testData.yinyunScore}%</p>
              <p className="text-ink-400 text-xs">音韵评分</p>
            </div>
          </div>
        </div>

        <GoldLine className="my-6" />

        {/* 五行匹配分析 */}
        <div className="jinming-card rounded-xl p-5">
          <h3 className="font-serif text-base text-ink-100 mb-4">五行匹配分析</h3>
          <div className="space-y-2.5 mb-4">
            {Object.entries(testData.wuxing).map(([el, pct]) => (
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
          <p className="text-ink-400 text-sm mb-2">名字五行：{testData.nameWuxing}</p>
          <div className="flex items-start gap-1.5 text-sm">
            <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5" />
            <span className="text-ink-300">{testData.matchConclusion}</span>
          </div>
        </div>

        <GoldLine className="my-6" />

        {/* 三才五格 */}
        <div className="jinming-card rounded-xl p-5">
          <h3 className="font-serif text-base text-ink-100 mb-4">三才五格</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {testData.wuge.map((g, i) => (
              <div key={i} className="p-2 rounded-lg bg-ink-800/40">
                <p className="text-ink-400 text-xs mb-1">{g.name}</p>
                <p className="text-ink-100 font-mono text-sm">{g.strokes}</p>
                <p className="text-ink-400 text-xs">{g.wx}</p>
                <span className={`text-xs ${g.luck === '吉' ? 'text-emerald-400' : 'text-vermilion'}`}>
                  {g.luck}
                </span>
              </div>
            ))}
          </div>
        </div>

        <GoldLine className="my-6" />

        {/* 音韵和谐度 */}
        <div className="jinming-card rounded-xl p-5">
          <h3 className="font-serif text-base text-ink-100 mb-4">音韵和谐度</h3>
          <div className="flex items-center justify-center gap-2 mb-3">
            {testData.tones.map((t, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-ink-800/40 text-ink-100 text-sm">
                  {t.char}({t.tone}声)
                </span>
                {i < testData.tones.length - 1 && (
                  <i className="fa-solid fa-arrow-right text-ink-500 text-xs" />
                )}
              </span>
            ))}
          </div>
          <p className="text-ink-300 text-sm text-center mb-3">平仄搭配良好</p>
          <div className="flex items-center gap-1.5 text-sm">
            <i className="fa-solid fa-shield-halved text-emerald-400" />
            <span className="text-ink-300">{testData.homophone}</span>
          </div>
        </div>

        <GoldLine className="my-6" />

        {/* 重名风险 */}
        <div className="jinming-card rounded-xl p-5">
          <h3 className="font-serif text-base text-ink-100 mb-4">重名与热名风险</h3>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-ink-300 text-sm">重名概率</span>
              <span className="text-amber-400 text-sm">{testData.repeatLevel}</span>
            </div>
            <div className="h-2 bg-ink-800/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400/60"
                style={{ width: `${testData.repeatRisk}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <i className="fa-solid fa-circle-check text-emerald-400" />
            <span className="text-ink-300">{testData.hotName}</span>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="flex gap-4 mt-8 mb-6">
          <Link
            href="/test-name"
            className="flex-1 py-3 rounded-lg border border-gold-400/20 text-ink-300 hover:border-gold-400/40 hover:text-gold-400 transition-all text-sm text-center"
          >
            重新测名
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 rounded-lg gold-btn text-ink-900 font-semibold text-sm text-center"
          >
            去AI起名
          </Link>
        </div>

        <p className="text-ink-500 text-xs text-center mb-8">
          以上内容由AI生成，仅供传统文化参考
        </p>
      </main>
    </div>
  );
}
