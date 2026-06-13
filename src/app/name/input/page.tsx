'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PenLine,
  User,
  UserRound,
  Clock,
  Info,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Sparkles,
  Zap,
  Leaf,
  Droplets,
  Flame,
  Mountain,
} from 'lucide-react';
import { SubHeader } from '@/components/tianyan/SubHeader';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { GoldLine } from '@/components/tianyan/GoldLine';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { saveInput } from '@/lib/storage';

// ===== 姓氏五行数据库 =====
const surnameWxMap: Record<string, string> = {
  '王':'土','李':'木','张':'火','刘':'金','陈':'土','杨':'木','黄':'土','赵':'火','周':'金','吴':'木',
  '徐':'金','孙':'水','马':'火','朱':'火','胡':'土','郭':'木','何':'木','林':'木','罗':'火','梁':'火',
  '宋':'金','郑':'土','谢':'金','韩':'水','唐':'土','冯':'水','董':'木','萧':'木','程':'火','曹':'金',
  '袁':'土','邓':'火','许':'木','傅':'水','沈':'水','曾':'金','彭':'水','吕':'火','苏':'木','卢':'火',
  '蒋':'木','蔡':'木','贾':'金','丁':'火','魏':'土','薛':'木','叶':'木','阎':'木','余':'土','潘':'水',
  '杜':'木','戴':'火','夏':'火','钟':'金','汪':'水','田':'火','任':'金','姜':'木','范':'土','方':'水',
  '石':'金','姚':'土','谭':'火','廖':'火','邹':'金','熊':'水','金':'金','陆':'火','郝':'金','孔':'木',
  '白':'水','崔':'木','康':'木','毛':'水','邱':'木','秦':'火','江':'水','史':'金','顾':'木','侯':'水',
  '邵':'金','孟':'水','龙':'火','万':'水','段':'火','钱':'金','汤':'水','尹':'土','黎':'土','易':'火',
  '常':'金','武':'水','乔':'木','贺':'水','赖':'土','龚':'木','文':'水','庞':'火','樊':'木','兰':'木',
  '温':'土','陶':'火','庄':'金','桑':'木','桂':'木','佟':'金','南':'火','车':'金','关':'木','蒲':'木',
  '尚':'金','裴':'木','倪':'水','牛':'木','纪':'木','柳':'木','鲁':'火','岳':'木','童':'金','冉':'火',
};

const wxDescMap: Record<string, string> = {
  '金':'金主义，性刚毅。姓属金者，宜取水泄秀、土生金助；忌火克太过。',
  '木':'木主仁，性生发。姓属木者，宜取水生木、木助其势；忌金克太过。',
  '水':'水主智，性灵动。姓属水者，宜取金生水、木泄秀；忌土克太过。',
  '火':'火主礼，性炎上。姓属火者，宜取木生火、土泄秀；忌水克太过。',
  '土':'土主信，性厚重。姓属土者，宜取火生土、金泄秀；忌木克太过。',
};

const tianGan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const diZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

const shiChenOptions = [
  { value: '0', label: '子时 (23:00-01:00)' },
  { value: '1', label: '丑时 (01:00-03:00)' },
  { value: '2', label: '寅时 (03:00-05:00)' },
  { value: '3', label: '卯时 (05:00-07:00)' },
  { value: '4', label: '辰时 (07:00-09:00)' },
  { value: '5', label: '巳时 (09:00-11:00)' },
  { value: '6', label: '午时 (11:00-13:00)' },
  { value: '7', label: '未时 (13:00-15:00)' },
  { value: '8', label: '申时 (15:00-17:00)' },
  { value: '9', label: '酉时 (17:00-19:00)' },
  { value: '10', label: '戌时 (19:00-21:00)' },
  { value: '11', label: '亥时 (21:00-23:00)' },
  { value: 'unknown', label: '不确定' },
];

const wishOptions = ['智慧', '安康', '事业', '温雅', '刚毅', '福泽'];

const stepData = [
  { num: '壹', title: '姓氏', sub: '承宗脉，一字传千载', label: 'STEP ONE' },
  { num: '贰', title: '性别', sub: '乾坤分，阴阳定命理', label: 'STEP TWO' },
  { num: '叁', title: '生辰', sub: '时辰定八字，生辰启命盘', label: 'STEP THREE' },
  { num: '肆', title: '方位', sub: '地利配天时，方位正命盘', label: 'STEP FOUR' },
];

const stepIndicatorSteps = [
  { label: '姓氏' },
  { label: '性别' },
  { label: '生辰' },
  { label: '方位' },
];

// ===== 工具函数 =====
function guessWuxing(c: string): string {
  const codes = ['金','木','水','火','土'];
  let h = 0;
  for (let i = 0; i < c.length; i++) h = c.charCodeAt(i) + ((h << 5) - h);
  return codes[Math.abs(h) % 5];
}

function getWuxingIcon(wx: string) {
  switch (wx) {
    case '金': return Sparkles;
    case '木': return Leaf;
    case '水': return Droplets;
    case '火': return Flame;
    case '土': return Mountain;
    default: return Sparkles;
  }
}

function calcBazi(year: number, month: number, day: number, shichenIdx: number) {
  const d = new Date(year, month - 1, day);
  const yG = (year - 4) % 10;
  const yZ = (year - 4) % 12;
  const mG = ((yG * 2 + month) % 10 + 10) % 10;
  const mZ = ((month + 1) % 12 + 12) % 12;
  const base = new Date(2000, 0, 1);
  const diff = Math.floor((d.getTime() - base.getTime()) / 86400000);
  const dG = ((diff + 6) % 10 + 10) % 10;
  const dZ = (diff % 12 + 12) % 12;
  const hG = ((dG % 5) * 2 + shichenIdx) % 10;
  return {
    year: [tianGan[yG], diZhi[yZ]],
    month: [tianGan[mG], diZhi[mZ]],
    day: [tianGan[dG], diZhi[dZ]],
    hour: [tianGan[hG], diZhi[shichenIdx]],
  };
}

// ===== 主页面 =====
export default function NameInputPage() {
  const router = useRouter();

  // 步骤控制
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisited, setMaxVisited] = useState(1);

  // 表单数据
  const [surname, setSurname] = useState('');
  const [surnameWx, setSurnameWx] = useState<string | null>(null);
  const [gender, setGender] = useState('');
  const [isBorn, setIsBorn] = useState(true);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [shichen, setShichen] = useState('');
  const [dueYear, setDueYear] = useState('');
  const [dueMonth, setDueMonth] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [motherSurname, setMotherSurname] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [wishes, setWishes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 姓氏五行反馈
  useEffect(() => {
    if (!surname.trim()) {
      setSurnameWx(null);
      return;
    }
    const firstChar = surname.charAt(0);
    setSurnameWx(surnameWxMap[firstChar] || guessWuxing(firstChar));
  }, [surname]);

  // 当前步骤是否可继续
  const canProceed = (() => {
    if (currentStep === 1) return surname.trim().length > 0;
    if (currentStep === 2) return gender.length > 0;
    if (currentStep === 3) {
      if (isBorn) return !!(year && month && day);
      return !!(dueYear && dueMonth && dueDay);
    }
    if (currentStep === 4) return true;
    return false;
  })();

  // 八字预览
  const baziPreview = (() => {
    const y = isBorn ? year : dueYear;
    const m = isBorn ? month : dueMonth;
    const d = isBorn ? day : dueDay;
    if (!y || !m || !d) return null;
    const yNum = parseInt(y), mNum = parseInt(m), dNum = parseInt(d);
    if (isNaN(yNum) || isNaN(mNum) || isNaN(dNum) || mNum < 1 || mNum > 12 || dNum < 1 || dNum > 31) return null;
    let shiIdx = 6;
    if (isBorn && shichen && shichen !== 'unknown') shiIdx = parseInt(shichen);
    try {
      return calcBazi(yNum, mNum, dNum, shiIdx);
    } catch {
      return null;
    }
  })();

  // 切换步骤
  const goToStep = useCallback(
    (step: number) => {
      if (step < 1 || step > 4) return;
      if (step > maxVisited + 1) return;
      setCurrentStep(step);
      if (step > maxVisited) setMaxVisited(step);
    },
    [maxVisited],
  );

  const nextStep = () => {
    if (currentStep < 4) goToStep(currentStep + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  // 切换期望寓意
  const toggleWish = (wish: string) => {
    setWishes((prev) =>
      prev.includes(wish) ? prev.filter((w) => w !== wish) : [...prev, wish],
    );
  };

  // 提交
  const handleSubmit = async () => {
    if (!canProceed && currentStep < 4) return;
    setLoading(true);
    setError('');

    const inputYear = isBorn ? year : dueYear;
    const inputMonth = isBorn ? month : dueMonth;
    const inputDay = isBorn ? day : dueDay;
    const inputTime = isBorn ? (shichen === 'unknown' ? '12:00' : shichen) : '12:00';
    const birthDate = `${inputYear}-${inputMonth.padStart(2, '0')}-${inputDay.padStart(2, '0')}`;

    saveInput({
      surname: surname.trim(),
      gender,
      birthDate,
      birthTime: inputTime,
      birthProvince: birthPlace,
      birthCity: '',
      unknownTime: shichen === 'unknown' || !isBorn,
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

  const sd = stepData[currentStep - 1];
  const WxIcon = surnameWx ? getWuxingIcon(surnameWx) : Sparkles;

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="起名 · 信息输入" stepLabel={`[${currentStep}/4]`} backHref="/" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 flex flex-col justify-center py-8">
        {/* 进度条 */}
        <StepIndicator steps={stepIndicatorSteps} currentStep={currentStep - 1} />

        {/* 主体内容：左侧注解 + 右侧输入 */}
        <div className="mt-8 grid md:grid-cols-5 gap-6 md:gap-12">
          {/* 左侧注解 - 仅桌面端可见 */}
          <div className="hidden md:flex md:col-span-2 flex-col justify-center">
            {/* Step 1 注解 */}
            {currentStep === 1 && (
              <div className="animate-fade-in-up">
                <span className="inline-block font-serif text-xs tracking-[0.3em] mb-4 text-gold-600">
                  {sd.label}
                </span>
                <div className="font-serif text-5xl font-bold tracking-[0.15em] mb-3 glow-gold text-gold-200">
                  {sd.num}
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-wider mb-2 text-ink-100">
                  {sd.title}
                </h2>
                <p className="font-serif text-base tracking-wider mb-6 text-ink-300 font-light">
                  {sd.sub}
                </p>
                <GoldLine className="max-w-[40px] mb-6" />
                <p className="text-sm leading-relaxed text-ink-300">
                  姓氏是血脉的标记，亦是五行的起点。不同姓氏蕴含不同的五行属性，影响着名字的格局与取舍。
                </p>
                <div className="mt-8 opacity-[0.06]">
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <rect x="4" y="4" width="56" height="56" rx="4" fill="none" stroke="var(--color-gold-400)" strokeWidth="2" />
                    <text x="32" y="40" textAnchor="middle" fontFamily="'Noto Serif SC',serif" fontSize="24" fontWeight="900" fill="var(--color-gold-400)">姓</text>
                  </svg>
                </div>
              </div>
            )}

            {/* Step 2 注解 */}
            {currentStep === 2 && (
              <div className="animate-fade-in-up">
                <span className="inline-block font-serif text-xs tracking-[0.3em] mb-4 text-gold-600">
                  {sd.label}
                </span>
                <div className="font-serif text-5xl font-bold tracking-[0.15em] mb-3 glow-gold text-gold-200">
                  {sd.num}
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-wider mb-2 text-ink-100">
                  {sd.title}
                </h2>
                <p className="font-serif text-base tracking-wider mb-6 text-ink-300 font-light">
                  {sd.sub}
                </p>
                <GoldLine className="max-w-[40px] mb-6" />
                <p className="text-sm leading-relaxed text-ink-300">
                  男命与女命，在八字推演中走向不同。同一命盘，因性别不同，大运顺逆有别，喜忌亦随之而变。
                </p>
                <div className="mt-8 opacity-[0.06]">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="animate-[breathe_4s_ease-in-out_infinite]">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-gold-400)" strokeWidth="1.5" />
                    <path d="M32 4 A28 28 0 0 1 32 60 A14 14 0 0 1 32 32 A14 14 0 0 0 32 4" fill="var(--color-gold-400)" />
                    <path d="M32 4 A28 28 0 0 0 32 60 A14 14 0 0 0 32 32 A14 14 0 0 1 32 4" fill="rgba(232,224,212,0.3)" />
                    <circle cx="32" cy="18" r="4" fill="rgba(232,224,212,0.3)" />
                    <circle cx="32" cy="46" r="4" fill="var(--color-gold-400)" />
                  </svg>
                </div>
              </div>
            )}

            {/* Step 3 注解 */}
            {currentStep === 3 && (
              <div className="animate-fade-in-up">
                <span className="inline-block font-serif text-xs tracking-[0.3em] mb-4 text-gold-600">
                  {sd.label}
                </span>
                <div className="font-serif text-5xl font-bold tracking-[0.15em] mb-3 glow-gold text-gold-200">
                  {sd.num}
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-wider mb-2 text-ink-100">
                  {sd.title}
                </h2>
                <p className="font-serif text-base tracking-wider mb-6 text-ink-300 font-light">
                  {sd.sub}
                </p>
                <GoldLine className="max-w-[40px] mb-6" />
                <p className="text-sm leading-relaxed text-ink-300">
                  出生之年月日时，是为四柱八字。年柱根、月柱苗、日柱花、时柱果，四柱八字是命理推演的根基。
                </p>
                {/* 八字预览 */}
                {baziPreview && (
                  <div className="mt-8">
                    <div className="flex items-center mb-3">
                      <span className="text-[11px] tracking-wider text-gold-600">八字预览</span>
                      {!isBorn && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-sans bg-gold-400/10 border border-dashed border-gold-400/30 text-gold-400">
                          预估
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4">
                      {(['year','month','day','hour'] as const).map((key, i) => {
                        const labels = ['年柱','月柱','日柱','时柱'];
                        const pillar = baziPreview[key];
                        return (
                          <div key={key} className="text-center bazi-pillar">
                            <span className="block text-[10px] font-sans text-ink-300 mb-0.5 w-9 mx-auto">{labels[i]}</span>
                            <span className={`block w-9 h-9 leading-9 border font-serif text-sm text-gold-200 transition-all rounded-t border-b-0 bg-gold-400/[0.04] border-gold-400/[0.18] ${!isBorn ? 'border-dashed opacity-70' : ''}`}>
                              {pillar[0]}
                            </span>
                            <span className={`block w-9 h-9 leading-9 border font-serif text-sm text-gold-200 transition-all rounded-b bg-gold-400/[0.04] border-gold-400/[0.18] ${!isBorn ? 'border-dashed opacity-70' : ''}`}>
                              {pillar[1]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {shichen === 'unknown' && isBorn && (
                      <div className="text-[10px] mt-2 text-ink-300">*时辰未定，暂以午时推算</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4 注解 */}
            {currentStep === 4 && (
              <div className="animate-fade-in-up">
                <span className="inline-block font-serif text-xs tracking-[0.3em] mb-4 text-gold-600">
                  {sd.label}
                </span>
                <div className="font-serif text-5xl font-bold tracking-[0.15em] mb-3 glow-gold text-gold-200">
                  {sd.num}
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-wider mb-2 text-ink-100">
                  {sd.title}
                </h2>
                <p className="font-serif text-base tracking-wider mb-6 text-ink-300 font-light">
                  {sd.sub}
                </p>
                <GoldLine className="max-w-[40px] mb-6" />
                <p className="text-sm leading-relaxed text-ink-300">
                  出生地的经纬度决定真太阳时偏差。精确校准出生方位，方使命盘毫厘不差。此步可选，不影响核心推演。
                </p>
                <div className="mt-8 opacity-[0.06]">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="animate-[breathe_5s_ease-in-out_infinite]">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-gold-400)" strokeWidth="1" />
                    <circle cx="32" cy="32" r="18" fill="none" stroke="var(--color-gold-400)" strokeWidth="0.5" strokeDasharray="2 3" />
                    <circle cx="32" cy="32" r="8" fill="none" stroke="var(--color-gold-400)" strokeWidth="0.5" />
                    <line x1="32" y1="2" x2="32" y2="62" stroke="var(--color-gold-400)" strokeWidth="0.5" />
                    <line x1="2" y1="32" x2="62" y2="32" stroke="var(--color-gold-400)" strokeWidth="0.5" />
                    <circle cx="32" cy="32" r="2" fill="var(--color-gold-400)" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* 右侧输入区 */}
          <div className="md:col-span-3">
            {/* 移动端简短标题 */}
            <div className="flex md:hidden items-center gap-3 mb-5">
              <div className="font-serif text-3xl font-bold glow-gold text-gold-200">{sd.num}</div>
              <div>
                <h2 className="font-serif text-lg font-bold tracking-wider text-ink-100">{sd.title}</h2>
                <p className="text-xs text-ink-300">{sd.sub}</p>
              </div>
            </div>

            {/* ====== Step 1: 姓氏 ====== */}
            {currentStep === 1 && (
              <div className="animate-fade-in-up">
                <div className="jinming-card rounded p-7 md:p-10">
                  <label className="block font-serif text-sm tracking-wider mb-2 text-gold-400">
                    <PenLine className="inline-block mr-2 text-xs" size={14} />
                    请输入姓氏
                  </label>
                  <input
                    type="text"
                    id="surnameInput"
                    value={surname}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 4) setSurname(val);
                    }}
                    onCompositionEnd={(e) => {
                      const val = (e.target as HTMLInputElement).value.replace(/[^\u4e00-\u9fa5]/g, '');
                      setSurname(val);
                    }}
                    onBlur={() => {
                      setSurname(prev => prev.replace(/[^\u4e00-\u9fa5]/g, ''));
                    }}
                    placeholder="如：张"
                    maxLength={4}
                    className="input-ritual w-full px-5 py-4 rounded text-lg font-serif tracking-widest"
                    autoFocus
                  />
                  {/* 姓氏五行反馈 */}
                  {surnameWx && (
                    <div className="mt-5 animate-fade-in-up">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-serif text-ink-100">
                          「<span className="font-bold text-gold-200">{surname}</span>」
                        </span>
                        <WuxingTag wuxing={surnameWx}>
                          <WxIcon size={10} className="inline-block" />
                          <span className="ml-0.5">{surnameWx}</span>
                        </WuxingTag>
                      </div>
                      <p className="text-sm text-ink-300">
                        {wxDescMap[surnameWx] || '此姓五行待推，起名时将综合分析。'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====== Step 2: 性别 ====== */}
            {currentStep === 2 && (
              <div className="animate-fade-in-up">
                <div className="jinming-card rounded p-7 md:p-10">
                  <label className="block font-serif text-sm tracking-wider mb-6 text-gold-400">
                    <User className="inline-block mr-2 text-xs" size={14} />
                    请选择性别
                  </label>
                  <div className="grid grid-cols-2 gap-5">
                    {/* 男 */}
                    <button
                      type="button"
                      id="genderMale"
                      onClick={() => setGender('male')}
                      className={`rounded py-8 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer ${
                        gender === 'male'
                          ? 'border-gold-400 bg-gold-400/[0.12] text-gold-200'
                          : 'bg-gold-400/[0.04] border border-gold-400/15 text-ink-100 hover:border-gold-400/30 hover:bg-gold-400/[0.06]'
                      }`}
                    >
                      <User size={28} />
                      <span className="font-serif text-lg tracking-wider">男</span>
                      <span className="text-xs text-ink-300">乾 · 刚健中正</span>
                    </button>
                    {/* 女 */}
                    <button
                      type="button"
                      id="genderFemale"
                      onClick={() => setGender('female')}
                      className={`rounded py-8 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer ${
                        gender === 'female'
                          ? 'border-gold-400 bg-gold-400/[0.12] text-gold-200'
                          : 'bg-gold-400/[0.04] border border-gold-400/15 text-ink-100 hover:border-gold-400/30 hover:bg-gold-400/[0.06]'
                      }`}
                    >
                      <UserRound size={28} />
                      <span className="font-serif text-lg tracking-wider">女</span>
                      <span className="text-xs text-ink-300">坤 · 厚德载物</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ====== Step 3: 生辰 ====== */}
            {currentStep === 3 && (
              <div className="animate-fade-in-up">
                <div className="jinming-card rounded p-7 md:p-10">
                  {/* 已出生/未出生切换 */}
                  <div className="flex items-center justify-between mb-6">
                    <label className="font-serif text-sm tracking-wider text-gold-400">
                      <Clock className="inline-block mr-2 text-xs" size={14} />
                      出生时间
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-ink-300">{isBorn ? '已出生' : '未出生'}</span>
                      <button
                        type="button"
                        id="birthToggle"
                        onClick={() => setIsBorn(!isBorn)}
                        className={`relative w-12 h-[26px] rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer ${
                          isBorn
                            ? 'bg-gold-400/12 border border-gold-400/20'
                            : 'bg-gold-400/25 border border-gold-400'
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] w-5 h-5 rounded-full transition-all duration-300 ${
                            isBorn
                              ? 'left-[2px] bg-gold-600'
                              : 'left-[24px] bg-gold-400'
                          }`}
                        />
                      </button>
                      <span className="text-xs text-ink-300">未出生</span>
                    </div>
                  </div>

                  {/* 已出生模式 */}
                  {isBorn && (
                    <div id="bornMode">
                      <div className="flex items-center gap-2 mb-5">
                        <Info size={10} className="text-gold-600 flex-shrink-0" />
                        <span className="text-xs text-ink-300">请填写公历（阳历）日期，系统将自动转换农历</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                          <label className="block text-xs mb-1.5 text-ink-300">年</label>
                          <input
                            type="number"
                            id="yearInput"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="2024"
                            min={1940}
                            max={2030}
                            className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5 text-ink-300">月</label>
                          <input
                            type="number"
                            id="monthInput"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            placeholder="1-12"
                            min={1}
                            max={12}
                            className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5 text-ink-300">日</label>
                          <input
                            type="number"
                            id="dayInput"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            placeholder="1-31"
                            min={1}
                            max={31}
                            className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5 text-ink-300">时辰</label>
                        <select
                          id="shichenSelect"
                          value={shichen}
                          onChange={(e) => setShichen(e.target.value)}
                          className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif cursor-pointer [&>option]:bg-ink-700 [&>option]:text-ink-100"
                        >
                          <option value="">请选择时辰</option>
                          {shiChenOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs mt-3 text-ink-300">请尽量精确到时辰，时辰是八字推演的关键</p>
                    </div>
                  )}

                  {/* 未出生模式 */}
                  {!isBorn && (
                    <div id="unbornMode">
                      <div className="flex items-center gap-2 mb-5">
                        <Info size={10} className="text-gold-600 flex-shrink-0" />
                        <span className="text-xs text-ink-300">请填写公历（阳历）预产期</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                          <label className="block text-xs mb-1.5 text-ink-300">预产年</label>
                          <input
                            type="number"
                            id="dueYearInput"
                            value={dueYear}
                            onChange={(e) => setDueYear(e.target.value)}
                            placeholder="2025"
                            className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5 text-ink-300">预产月</label>
                          <input
                            type="number"
                            id="dueMonthInput"
                            value={dueMonth}
                            onChange={(e) => setDueMonth(e.target.value)}
                            placeholder="1-12"
                            min={1}
                            max={12}
                            className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5 text-ink-300">预产日</label>
                          <input
                            type="number"
                            id="dueDayInput"
                            value={dueDay}
                            onChange={(e) => setDueDay(e.target.value)}
                            placeholder="1-31"
                            min={1}
                            max={31}
                            className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs mb-1.5 text-ink-300">父亲姓氏</label>
                          <input
                            type="text"
                            id="fatherSurname"
                            value={surname}
                            readOnly
                            placeholder="默认已填"
                            className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif opacity-70"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5 text-ink-300">母亲姓氏</label>
                          <input
                            type="text"
                            id="motherSurname"
                            value={motherSurname}
                            onChange={(e) => setMotherSurname(e.target.value)}
                            placeholder="选填"
                            className="input-ritual w-full px-4 py-3.5 rounded text-sm font-serif"
                          />
                        </div>
                      </div>
                      <p className="text-xs mt-3 text-ink-300">
                        AI将根据预产期推算八字，并参考父母姓氏取名
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====== Step 4: 出生地 & 寓意 ====== */}
            {currentStep === 4 && (
              <div className="animate-fade-in-up">
                <div className="jinming-card rounded p-7 md:p-10">
                  <label className="block font-serif text-sm tracking-wider mb-2 text-gold-400">
                    <MapPin className="inline-block mr-2 text-xs" size={14} />
                    出生地点{' '}
                    <span className="text-xs font-sans text-ink-300 font-normal">（选填）</span>
                  </label>
                  <input
                    type="text"
                    id="birthPlaceInput"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="如：北京市朝阳区"
                    className="input-ritual w-full px-5 py-4 rounded text-sm"
                  />
                  <p className="text-xs mt-3 text-ink-300">
                    用于真太阳时校准。不同经度地区，真太阳时与北京时间有偏差
                  </p>

                  {/* 期望寓意 */}
                  <div className="mt-6">
                    <label className="block text-xs mb-3 text-ink-300">
                      期望寓意 <span className="text-ink-300">（选填）</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {wishOptions.map((wish) => {
                        const selected = wishes.includes(wish);
                        return (
                          <button
                            key={wish}
                            type="button"
                            onClick={() => toggleWish(wish)}
                            className={`px-4 py-2 rounded text-xs font-serif tracking-wider cursor-pointer transition-all duration-300 ${
                              selected
                                ? 'border-gold-400 bg-gold-400/10 text-gold-200'
                                : 'border border-gold-400/15 text-ink-300 bg-transparent hover:border-gold-400/30'
                            }`}
                          >
                            {wish}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className={`btn-outline-gold px-6 py-3 rounded text-xs font-serif tracking-wider ${
                  currentStep > 1 ? 'visible' : 'invisible'
                }`}
              >
                <ArrowLeft size={10} className="inline-block mr-2" />
                上一步
              </button>
              <div className="flex items-center gap-2 text-xs text-ink-300">
                <span>{currentStep}</span> / 4
              </div>
              <button
                type="button"
                id="nextBtn"
                onClick={nextStep}
                disabled={!canProceed || loading}
                className={`btn-gold px-8 py-3 rounded text-[13px] font-serif tracking-[0.2em] ${
                  currentStep === 4 ? 'animate-[final-pulse_2s_ease-in-out_infinite]' : ''
                }`}
              >
                {loading ? (
                  <>
                    推演中
                    <Zap size={10} className="inline-block ml-2 animate-pulse" />
                  </>
                ) : currentStep === 4 ? (
                  <>
                    开始推演
                    <Zap size={10} className="inline-block ml-2" />
                  </>
                ) : (
                  <>
                    下一步
                    <ArrowRight size={10} className="inline-block ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 隐私提示 */}
        <div className="flex items-center gap-2 text-ink-300 text-xs justify-center py-6 mt-4">
          <Info size={12} />
          您的信息仅用于分析，72小时后自动删除
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-2 p-3 rounded bg-vermilion/10 border border-vermilion/20 text-vermilion text-sm text-center">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
