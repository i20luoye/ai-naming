'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/tianyan/SiteHeader';
import { saveTestInput } from '@/lib/storage';

export default function TestNamePage() {
  const router = useRouter();
  const [surname, setSurname] = useState('');
  const [givenName, setGivenName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = surname.trim() && givenName.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    const inputTime = unknownTime ? '12:00' : birthTime;

    saveTestInput({
      surname: surname.trim(),
      givenName: givenName.trim(),
      gender,
      birthDate,
      birthTime: inputTime,
    });

    try {
      const res = await fetch('/api/test-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surname: surname.trim(),
          givenName: givenName.trim(),
          gender,
          birthDate: birthDate || undefined,
          birthTime: inputTime || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('tianyan_test_result', JSON.stringify(data.data));
        router.push('/test-name/result');
      } else {
        setError(data.error || '测名失败，请重试');
      }
    } catch {
      setError('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SiteHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gold-400" style={{ textShadow: '0 0 20px rgba(200,164,92,0.15)' }}>
            测名评分
          </h1>
          <p className="text-ink-300 text-sm mt-2">已有名字？看看五行匹配度和文化内涵</p>
        </div>

        <div className="space-y-5">
          {/* 名字输入 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-1">
            <label className="block text-sm text-ink-300 mb-3">
              名字 <span className="text-vermilion">*</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={surname}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\u4e00-\u9fa5]/g, '');
                  if (val.length <= 2) setSurname(val);
                }}
                placeholder="姓氏"
                maxLength={2}
                className="w-1/3 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition-all"
              />
              <input
                type="text"
                value={givenName}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\u4e00-\u9fa5]/g, '');
                  if (val.length <= 2) setGivenName(val);
                }}
                placeholder="名字（不含姓氏）"
                maxLength={2}
                className="flex-1 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition-all"
              />
            </div>
          </div>

          {/* 出生信息 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-2">
            <label className="block text-sm text-ink-300 mb-3">出生信息（选填）</label>

            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 py-2.5 rounded-lg border transition-all text-sm ${
                  gender === 'male'
                    ? 'bg-gold-400/20 border-gold-400/50 text-gold-400'
                    : 'border-gold-400/12 text-ink-300 hover:border-gold-400/30'
                }`}
              >
                <i className="fa-solid fa-mars mr-1.5" />男
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 py-2.5 rounded-lg border transition-all text-sm ${
                  gender === 'female'
                    ? 'bg-gold-400/20 border-gold-400/50 text-gold-400'
                    : 'border-gold-400/12 text-ink-300 hover:border-gold-400/30'
                }`}
              >
                <i className="fa-solid fa-venus mr-1.5" />女
              </button>
            </div>

            <div className="flex gap-3 mb-3">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="出生日期"
                className="flex-1 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark]"
              />
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                disabled={unknownTime}
                placeholder="出生时间"
                className={`flex-1 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark] ${
                  unknownTime ? 'opacity-40' : ''
                }`}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unknownTime}
                onChange={(e) => setUnknownTime(e.target.checked)}
                className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 accent-[#c8a45c]"
              />
              <span className="text-ink-400 text-sm">不确定时辰</span>
            </label>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-vermilion/10 border border-vermilion/20 text-vermilion text-sm text-center">
            {error}
          </div>
        )}

        {/* 底部按钮 */}
        <div className="mt-6 pb-8">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={`btn-gold block w-full py-3.5 rounded-lg text-ink-900 font-semibold text-center text-base transition-all ${
              !canSubmit || loading ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin mr-2" />分析中...</>
            ) : (
              <>开始测名 <i className="fa-solid fa-arrow-right ml-1 text-sm" /></>
            )}
          </button>
        </div>

        <p className="text-ink-500 text-xs text-center">仅供传统文化参考</p>
      </main>
    </div>
  );
}
