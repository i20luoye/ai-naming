'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { saveInput } from '@/lib/storage';

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

export default function NameInputPage() {
  const router = useRouter();
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [isBorn, setIsBorn] = useState(true);
  const [birthProvince, setBirthProvince] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = surname.trim() && gender && birthDate && (birthTime || unknownTime);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    const inputTime = unknownTime ? '12:00' : birthTime;

    // 保存输入数据
    saveInput({
      surname: surname.trim(),
      gender,
      birthDate,
      birthTime: inputTime,
      birthProvince,
      birthCity,
      unknownTime,
      isBorn,
    });

    try {
      const res = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime: inputTime }),
      });
      const data = await res.json();
      if (data.success) {
        // 将排盘数据也存入 localStorage
        localStorage.setItem('tianyan_bazi', JSON.stringify(data.data));
        router.push('/name/bazi');
      } else {
        setError(data.error || '排盘计算失败，请重试');
      }
    } catch {
      setError('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  const cityMap: Record<string, string[]> = {
    '北京': ['东城区', '西城区', '朝阳区', '海淀区'],
    '上海': ['黄浦区', '徐汇区', '静安区', '浦东新区'],
    '广东': ['广州', '深圳', '佛山', '东莞'],
    '浙江': ['杭州', '宁波', '温州', '绍兴'],
    '江苏': ['南京', '苏州', '无锡', '常州'],
    '四川': ['成都', '绵阳', '德阳', '宜宾'],
    '湖北': ['武汉', '宜昌', '襄阳', '荆州'],
    '山东': ['济南', '青岛', '烟台', '潍坊'],
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="基本信息" stepLabel="[1/4]" backHref="/" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <StepIndicator steps={steps} currentStep={0} />

        <div className="mt-8 space-y-5">
          {/* 姓氏 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-1">
            <label className="block text-sm text-ink-300 mb-2">
              姓氏 <span className="text-vermilion">*</span>
            </label>
            <input
              type="text"
              value={surname}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\u4e00-\u9fa5]/g, '');
                if (val.length <= 2) setSurname(val);
              }}
              placeholder="请输入姓氏"
              maxLength={2}
              className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all"
            />
            <p className="text-ink-500 text-xs mt-1.5">1-2个中文汉字</p>
          </div>

          {/* 性别 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-2">
            <label className="block text-sm text-ink-300 mb-3">
              性别 <span className="text-vermilion">*</span>
            </label>
            <div className="flex gap-3">
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
          </div>

          {/* 出生日期 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-3">
            <label className="block text-sm text-ink-300 mb-2">
              出生日期 <span className="text-vermilion">*</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all [color-scheme:dark]"
            />
          </div>

          {/* 出生时间 */}
          <div className="jinming-card rounded-xl p-5 animate-fade-in-up stagger-4">
            <label className="block text-sm text-ink-300 mb-2">
              出生时间 <span className="text-vermilion">*</span>
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              disabled={unknownTime}
              className={`w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all [color-scheme:dark] ${
                unknownTime ? 'opacity-40' : ''
              }`}
            />
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={unknownTime}
                onChange={(e) => setUnknownTime(e.target.checked)}
                className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 text-gold-400 focus:ring-gold-400/20 accent-[#c8a45c]"
              />
              <span className="text-ink-400 text-sm">不确定具体时辰</span>
            </label>
          </div>

          {/* 出生地 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-2">出生地</label>
            <div className="flex gap-3">
              <select
                value={birthProvince}
                onChange={(e) => {
                  setBirthProvince(e.target.value);
                  setBirthCity('');
                }}
                className="flex-1 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark]"
              >
                <option value="">选择省份</option>
                {Object.keys(cityMap).map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <select
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                className="flex-1 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark]"
              >
                <option value="">选择城市</option>
                {birthProvince && cityMap[birthProvince]?.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <p className="text-ink-500 text-xs mt-1.5">
              <i className="fa-solid fa-circle-info mr-1" />
              选填，用于真太阳时校正
            </p>
          </div>

          {/* 已出生Toggle */}
          <div className="jinming-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-300">宝宝是否已出生</span>
              <button
                type="button"
                onClick={() => setIsBorn(!isBorn)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isBorn ? 'bg-gold-400' : 'bg-ink-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink-50 transition-transform ${
                    isBorn ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {!isBorn && (
              <div className="mt-3 p-3 rounded-lg bg-amber-900/20 border border-amber-500/20 text-amber-400 text-xs">
                <i className="fa-solid fa-triangle-exclamation mr-1" />
                宝宝尚未出生，分析结果仅供参考
              </div>
            )}
          </div>

          {/* 隐私提示 */}
          <div className="flex items-center gap-2 text-ink-500 text-xs justify-center py-2">
            <i className="fa-solid fa-shield-halved" />
            您的信息仅用于分析，72小时后自动删除
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-vermilion/10 border border-vermilion/20 text-vermilion text-sm text-center">
            {error}
          </div>
        )}

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-ink-900/90 backdrop-blur-sm pt-4 pb-6 mt-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={`btn-gold block w-full py-3.5 rounded-lg text-ink-900 font-semibold text-center text-base transition-all ${
              !canSubmit || loading ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin mr-2" />正在排盘...</>
            ) : (
              <>下一步：排盘分析 <i className="fa-solid fa-arrow-right ml-1 text-sm" /></>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
