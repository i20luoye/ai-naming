'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import type { NameItem, BaziData } from '@/lib/storage';

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

const SCORE_ITEMS = [
  { key: 'xiYongMatch', label: '喜用神匹配', icon: 'fa-solid fa-yin-yang' },
  { key: 'sancaiScore', label: '三才五格', icon: 'fa-solid fa-star' },
  { key: 'yinyunScore', label: '音韵和谐', icon: 'fa-solid fa-music' },
  { key: 'meaningScore', label: '寓意深度', icon: 'fa-solid fa-book' },
  { key: 'repeatRisk', label: '重名风险', icon: 'fa-solid fa-users' },
  { key: 'homophoneRisk', label: '谐音检测', icon: 'fa-solid fa-ear-listen' },
];

function ScoreBar({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  const numVal = typeof value === 'number' ? value : 0;
  const stars = Math.round(numVal / 20);
  return (
    <div className="flex items-center gap-3 py-2">
      <i className={`${icon} text-ink-400 w-5 text-center text-xs`} />
      <span className="text-ink-200 text-sm w-20">{label}</span>
      <div className="flex gap-0.5 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <i
            key={i}
            className={`fa-solid fa-star text-xs ${i <= stars ? 'text-gold-400' : 'text-ink-600'}`}
          />
        ))}
      </div>
      <span className="text-ink-100 text-sm font-mono w-8 text-right">{numVal || '—'}</span>
    </div>
  );
}

export default function NameDetailPage() {
  const router = useRouter();
  const [name, setName] = useState<NameItem | null>(null);
  const [bazi, setBazi] = useState<BaziData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('tianyan_selected_name');
    const baziRaw = localStorage.getItem('tianyan_bazi');
    if (raw) {
      try { setName(JSON.parse(raw)); } catch { /* ignore */ }
    }
    if (baziRaw) {
      try { setBazi(JSON.parse(baziRaw)); } catch { /* ignore */ }
    }
  }, []);

  const handleCopy = async () => {
    if (!name) return;
    try {
      await navigator.clipboard.writeText(`${name.surname}${name.givenName}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (!name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="text-ink-400 text-sm">
          未找到名字数据
          <button onClick={() => router.push('/name/result')} className="ml-2 text-gold-400 underline">
            返回结果
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="名字解读" backHref="/name/result" rightAction={
        <button className="text-ink-300 hover:text-gold-400 transition-colors">
          <i className="fa-solid fa-share-nodes" />
        </button>
      } />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* 名字标题区 */}
        <div className="jinming-card rounded-xl p-6 animate-fade-in-up stagger-1 text-center">
          <h1 className="text-4xl font-serif text-ink-100 mb-2" style={{ textShadow: '0 0 20px rgba(200,164,92,0.15)' }}>
            {name.surname} · {name.givenName}
          </h1>
          <div className="flex justify-center gap-2 mb-4">
            {[name.surname, ...name.givenName.split('')].map((char, i) => {
              if (i === 0) return null; // 姓氏不标五行
              const wx = name.wuxing[i - 1] || '';
              return <WuxingTag key={i} wuxing={wx} />;
            })}
          </div>
          <div className="flex justify-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl font-mono text-gold-400" style={{ textShadow: '0 0 12px rgba(200,164,92,0.3)' }}>
                {name.score}
              </div>
              <div className="text-ink-400 text-xs mt-0.5">综合分</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-gold-400">{name.sancai}</div>
              <div className="text-ink-400 text-xs mt-0.5">三才</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-gold-400">{name.style}</div>
              <div className="text-ink-400 text-xs mt-0.5">寓意</div>
            </div>
          </div>
        </div>

        <GoldLine />

        {/* 五行补益分析 */}
        <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-2">
          <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-fire-flame-curved text-sm" />
            五行补益分析
          </h2>
          {bazi && (
            <div className="mb-3">
              <span className="text-ink-300 text-sm">喜用神：</span>
              {bazi.xiYong.map((wx) => (
                <span key={wx} className={`inline-block px-2 py-0.5 rounded text-sm ml-1 ${WUXING_BG[wx]} ${WUXING_COLORS[wx]}`}>
                  {wx}
                </span>
              ))}
            </div>
          )}
          <div className="space-y-1 text-sm text-ink-200">
            {name.givenName.split('').map((char, i) => (
              <p key={i}>
                「{char}」字五行属
                <span className={`font-semibold ${WUXING_COLORS[name.wuxing[i]] || 'text-ink-100'}`}>
                  {name.wuxing[i]}
                </span>
              </p>
            ))}
          </div>
          {name.analysis && (
            <p className="text-ink-200 text-sm mt-3">{name.analysis}</p>
          )}
          {/* 补益路径 */}
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-ink-800/30">
            {bazi?.xiYong.map((wx, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <i className="fa-solid fa-arrow-right text-ink-500 text-xs" />}
                <span className={`px-2 py-1 rounded ${WUXING_BG[wx]} ${WUXING_COLORS[wx]} text-sm`}>{wx}(喜)</span>
              </span>
            ))}
            <i className="fa-solid fa-arrow-right text-ink-500 text-xs" />
            {name.wuxing.map((wx, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <i className="fa-solid fa-arrow-right text-ink-500 text-xs" />}
                <span className={`px-2 py-1 rounded ${WUXING_BG[wx]} ${WUXING_COLORS[wx]} text-sm`}>{wx}(名)</span>
              </span>
            ))}
          </div>
        </div>

        <GoldLine />

        {/* 诗词出处 */}
        {name.poem && (
          <>
            <div className="jinming-card rounded-xl p-5">
              <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-feather text-sm" />
                诗词出处
              </h2>
              {name.poemSource && (
                <p className="text-ink-300 text-sm mb-2 italic font-serif">{name.poemSource}</p>
              )}
              <blockquote className="text-ink-200 text-sm italic border-l-2 border-gold-400/20 pl-4 leading-relaxed">
                「{name.poem}」
              </blockquote>
            </div>
            <GoldLine />
          </>
        )}

        {/* 多维度评分 */}
        <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-3">
          <h2 className="text-base font-serif text-gold-400 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-bar text-sm" />
            多维度评分
          </h2>
          <div className="divide-y divide-gold-400/8">
            <ScoreBar label="喜用神匹配" value={name.xiYongMatch ?? 85} icon="fa-solid fa-yin-yang" />
            <ScoreBar label="三才五格" value={name.sancaiScore ?? 90} icon="fa-solid fa-star" />
            <ScoreBar label="音韵和谐" value={name.yinyunScore ?? 95} icon="fa-solid fa-music" />
            <ScoreBar label="寓意深度" value={name.meaningScore ?? 88} icon="fa-solid fa-book" />
            <ScoreBar label="重名风险" value={name.repeatRisk === '低' ? 90 : 50} icon="fa-solid fa-users" />
            <ScoreBar label="谐音检测" value={name.homophoneRisk === '无风险' ? 100 : 60} icon="fa-solid fa-ear-listen" />
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              const favs = JSON.parse(localStorage.getItem('tianyan_favorites') || '[]');
              const key = `${name.surname}${name.givenName}`;
              if (!favs.includes(key)) {
                favs.push(key);
                localStorage.setItem('tianyan_favorites', JSON.stringify(favs));
              }
            }}
            className="flex-1 py-3 rounded-lg border border-gold-400/20 text-gold-400 text-sm font-medium hover:bg-gold-400/5 transition-all"
          >
            <i className="fa-regular fa-heart mr-1.5" />收藏
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-lg border border-gold-400/20 text-gold-400 text-sm font-medium hover:bg-gold-400/5 transition-all"
          >
            <i className="fa-regular fa-copy mr-1.5" />{copied ? '已复制' : '复制名字'}
          </button>
        </div>

        {/* 合规标识 */}
        <p className="text-ink-500 text-xs text-center mt-4">
          以上内容由AI生成，仅供传统文化参考
        </p>
      </main>
    </div>
  );
}
