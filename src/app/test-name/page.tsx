'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/tianyan/SiteHeader';
import { WuxingTag } from '@/components/tianyan/WuxingTag';
import { GoldLine } from '@/components/tianyan/GoldLine';
import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { saveInput } from '@/lib/storage';
import {
  PenLine, Users, Clock, MapPin,
  ChevronRight, ChevronLeft, AlertTriangle,
  Info, CheckCircle, Gem, Leaf, Droplets, Flame, Mountain,
  Search
} from 'lucide-react';

/* ====== 复姓表 ====== */
const COMPOUND_SURNAMES = [
  '欧阳','太史','端木','上官','司马','东方','独孤','南宫',
  '万俟','闻人','夏侯','诸葛','尉迟','公羊','赫连','澹台',
  '皇甫','宗政','濮阳','公冶','太叔','申屠','公孙','慕容',
  '仲孙','钟离','长孙','宇文','司徒','鲜于','司空','闾丘',
  '子车','亓官','司寇','巫马','公西','颛孙','壤驷','公良',
  '漆雕','乐正','宰父','谷梁','拓跋','夹谷','轩辕','令狐',
  '段干','百里','呼延','东郭','南门','羊舌','微生',
];

/* ====== 姓氏五行 ====== */
const SURNAME_WX: Record<string, string> = {
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
  '欧阳':'火','司马':'金','上官':'金','诸葛':'木','慕容':'金','端木':'木',
};

/* ====== 名字用字五行 ====== */
const CHAR_WX: Record<string, string> = {
  '涵':'水','泽':'水','清':'水','源':'水','沁':'水','兰':'木','潆':'水','月':'水','澄':'水','宁':'火',
  '梓':'木','桐':'木','栩':'木','然':'金','芷':'木','萱':'木','晏':'火','如':'金','毓':'火','辰':'土',
  '瑾':'火','瑜':'金','锦':'金','瑞':'金','钰':'金','铭':'金','煜':'火','昕':'火','晖':'火','煦':'火',
  '风':'水','宇':'土','坤':'土','垣':'土','培':'土','均':'土','平':'水','柯':'木','远':'土','荟':'木',
  '蔚':'木','钦':'金','铮':'金','书':'金','明':'火','德':'火','志':'火','永':'水','玉':'金','宝':'火',
  '生':'金','大':'火','学':'水','国':'木','华':'水','天':'火','龙':'火','云':'水','海':'水','山':'土',
  '松':'木','柏':'木','梅':'木','竹':'木','菊':'木','荷':'木','雪':'水','冰':'水','露':'水','雨':'水',
  '霜':'水','虹':'木','霞':'水','彩':'金','红':'水','紫':'金','青':'金','白':'水','丹':'火','碧':'水',
  '翠':'金','芳':'木','芬':'木','馨':'金','香':'水','雅':'木','静':'金','婉':'土','淑':'水','慧':'水',
  '敏':'水','丽':'火','美':'水','婷':'火','颖':'木','琳':'木','璐':'火','璇':'火','珊':'金','珍':'火',
  '琪':'木','彤':'火','妍':'水','蕊':'木','岚':'土','嫣':'土','娴':'土','姝':'金','媛':'火','妮':'火',
  '莹':'木','蕾':'木','薇':'木','思':'金','怡':'土','欣':'木','悦':'金','欢':'水','乐':'火','安':'土',
  '和':'水','顺':'金','兴':'水','旺':'土','盛':'金','荣':'木','富':'水','贵':'木','福':'水','禄':'火',
  '寿':'金','康':'木','健':'木','强':'木','刚':'金','毅':'木','勇':'土','威':'土','杰':'木','豪':'水',
  '俊':'火','伟':'土','宏':'水','博':'水','浩':'水','洋':'水','渊':'水','深':'水','润':'水','淳':'水',
  '厚':'水','仁':'金','义':'木','礼':'火','智':'火','信':'金','忠':'火','孝':'水','廉':'木','正':'金',
  '修':'金','道':'火','理':'火','法':'水','术':'木','艺':'木','才':'金','哲':'火','诗':'金','画':'土',
  '琴':'木','棋':'木','剑':'金','策':'木','翰':'水','墨':'土','瑶':'火',
};

/* ====== 五行颜色/图标 ====== */
const WX_COLORS: Record<string, string> = { '金':'#e8d09a','木':'#81c784','水':'#64b5f6','火':'#d4726a','土':'#d4c4a0' };
const WX_RGB: Record<string, string> = { '金':'232,208,154','木':'129,199,132','水':'100,181,246','火':'212,114,106','土':'212,196,160' };
const WX_ICONS: Record<string, string> = { '金':'gem','木':'leaf','水':'droplets','火':'flame','土':'mountain' };

/* ====== 时辰列表 ====== */
const SHICHEN_OPTIONS = [
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
];

/* ====== 步骤注解数据 ====== */
const STEP_ANNOTATIONS = [
  { num: '壹', title: '姓名', sub: '名正言顺，字字有源',
    desc1: '姓名不仅是称呼，更蕴含五行能量。每个字的五行属性相互生克，构成名字的内在格局。',
    desc2: '输入姓名后，系统将实时分析每个字的五行归属，判别格局的均衡与偏缺，为后续命理契合评测奠定基础。',
    char: '名' },
  { num: '贰', title: '性别', sub: '乾坤有别，命理殊途',
    desc1: '男命与女命在八字推演中走向不同。同一命盘，因性别不同，大运顺逆有别，喜忌亦随之而变。',
    desc2: '测名时需结合性别判断名字与命盘的匹配方向，同一名字对男命与女命的评价可能存在差异。',
    char: '☯' },
  { num: '叁', title: '生辰', sub: '时辰定八字，生辰启命盘',
    desc1: '测名的核心在于评判姓名与命盘的契合度。仅看姓名五行是片面的，必须结合八字喜用神，方能判断名字是否真正"合命"。',
    desc2: '出生之年月日时排列为四柱八字，日主天干是五行推演的起点，也是测名评判的根本依据。',
    char: '時' },
  { num: '肆', title: '方位', sub: '地利配天时，方位正命盘',
    desc1: '出生地经纬度决定真太阳时偏差。精确校准出生方位，方使命盘毫厘不差。',
    desc2: '此步可选，不影响核心评测。若不确定可跳过，系统将以北京时间推算。',
    char: '方' },
];

function guessWuxing(c: string): string {
  const codes = ['金','木','水','火','土'];
  let h = 0;
  for (let i = 0; i < c.length; i++) h = c.charCodeAt(i) + ((h << 5) - h);
  return codes[Math.abs(h) % 5];
}

function getCharWx(c: string, surname?: string): string {
  if (surname && SURNAME_WX[surname]) return SURNAME_WX[surname];
  return CHAR_WX[c] || guessWuxing(c);
}

/* ====== 天干 ====== */
const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const TG_WX: Record<string, string> = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const DZ_WX: Record<string, string> = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };

function calcBazi(year: number, month: number, day: number, shichenIdx: number) {
  const d = new Date(year, month - 1, day);
  const yG = (year - 4) % 10, yZ = (year - 4) % 12;
  const mG = ((yG * 2 + month) % 10 + 10) % 10, mZ = ((month + 1) % 12 + 12) % 12;
  const base = new Date(2000, 0, 1);
  const diff = Math.floor((d.getTime() - base.getTime()) / 86400000);
  const dG = ((diff + 6) % 10 + 10) % 10, dZ = (diff % 12 + 12) % 12;
  const shi = shichenIdx;
  const hG = ((dG % 5) * 2 + shi) % 10;
  return {
    year: [TIAN_GAN[yG], DI_ZHI[yZ]],
    month: [TIAN_GAN[mG], DI_ZHI[mZ]],
    day: [TIAN_GAN[dG], DI_ZHI[dZ]],
    hour: [TIAN_GAN[hG], DI_ZHI[shi]],
  };
}

export default function TestNamePage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-indexed
  const [maxVisited, setMaxVisited] = useState(0);

  // Form data
  const [fullName, setFullName] = useState('');
  const [surname, setSurname] = useState('');
  const [given, setGiven] = useState('');
  const [isCompoundSurname, setIsCompoundSurname] = useState(false);
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [shichen, setShichen] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Derived: is name valid Chinese
  const isNameValid = fullName.length >= 2 && /^[\u4e00-\u9fff]+$/.test(fullName);

  // Parse surname/given from full name
  const parseName = useCallback((name: string) => {
    if (!name || name.length < 2) { setSurname(''); setGiven(''); setIsCompoundSurname(false); return; }
    // Check compound surname
    const twoChar = name.substring(0, 2);
    if (name.length >= 3 && COMPOUND_SURNAMES.includes(twoChar)) {
      setSurname(twoChar);
      setGiven(name.substring(2));
      setIsCompoundSurname(true);
    } else if (name.length >= 3 && SURNAME_WX[twoChar]) {
      setSurname(twoChar);
      setGiven(name.substring(2));
      setIsCompoundSurname(true);
    } else {
      setSurname(name.charAt(0));
      setGiven(name.substring(1));
      setIsCompoundSurname(false);
    }
  }, []);

  const handleNameInput = useCallback((val: string) => {
    const trimmed = val.substring(0, 6);
    setFullName(trimmed);
    parseName(trimmed);
  }, [parseName]);

  // Compute wuxing for each char
  const charWuxingList = fullName.split('').map((c, i) => {
    const isSur = i < surname.length;
    if (isSur && surname && SURNAME_WX[surname]) return SURNAME_WX[surname];
    return CHAR_WX[c] || guessWuxing(c);
  });

  // Compute wx counts
  const wxCount: Record<string, number> = { '金':0, '木':0, '水':0, '火':0, '土':0 };
  charWuxingList.forEach(wx => { wxCount[wx]++; });
  const maxWxCount = Math.max(...Object.values(wxCount), 1);
  const presentWx = Object.keys(wxCount).filter(k => wxCount[k] > 0);
  const lackingWx = Object.keys(wxCount).filter(k => wxCount[k] === 0);

  // Bazi preview
  const baziPreview = (() => {
    const y = parseInt(birthYear), m = parseInt(birthMonth), d = parseInt(birthDay);
    if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return null;
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    const shiIdx = shichen && shichen !== 'unknown' ? parseInt(shichen) : 6;
    try { return calcBazi(y, m, d, isNaN(shiIdx) ? 6 : shiIdx); } catch { return null; }
  })();

  // Step validation
  const isStepValid = (() => {
    if (step === 0) return isNameValid;
    if (step === 1) return !!gender;
    if (step === 2) return !!(birthYear && birthMonth && birthDay);
    if (step === 3) return true;
    return false;
  })();

  const goToStep = (s: number) => {
    if (s < 0 || s > 3) return;
    if (s > maxVisited + 1) return;
    setStep(s);
    if (s > maxVisited) setMaxVisited(s);
    if (s === 0) setTimeout(() => nameInputRef.current?.focus(), 300);
  };

  const nextStep = () => { if (step < 3) goToStep(step + 1); else startTestName(); };
  const prevStep = () => { if (step > 0) goToStep(step - 1); };

  const startTestName = async () => {
    setLoading(true);
    setError('');
    try {
      const inputTime = shichen === 'unknown' ? '12:00' : (shichen ? `${(parseInt(shichen) * 2 + 23) % 24}:00` : '');
      saveInput({
        surname,
        gender,
        birthDate: birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth.padStart(2,'0')}-${birthDay.padStart(2,'0')}` : '',
        birthTime: inputTime,
        unknownTime: shichen === 'unknown' || !shichen,
        isBorn: true,
        birthProvince: birthPlace || undefined,
      } as any);

      const res = await fetch('/api/test-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surname,
          givenName: given,
          gender,
          birthDate: birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth.padStart(2,'0')}-${birthDay.padStart(2,'0')}` : undefined,
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

  // Focus name input on mount
  useEffect(() => {
    setTimeout(() => nameInputRef.current?.focus(), 500);
  }, []);

  const annotation = STEP_ANNOTATIONS[step];

  /* ====== Wuxing icon component ====== */
  const WxIcon = ({ wx, size = 10 }: { wx: string; size?: number }) => {
    const iconMap: Record<string, React.ReactNode> = {
      '金': <Gem size={size} />,
      '木': <Leaf size={size} />,
      '水': <Droplets size={size} />,
      '火': <Flame size={size} />,
      '土': <Mountain size={size} />,
    };
    return <span style={{ color: WX_COLORS[wx] }}>{iconMap[wx] || null}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SiteHeader />

      <main className="flex-1 relative px-6 pt-8 pb-20" style={{ zIndex: 1 }}>
        <div className="w-full max-w-4xl mx-auto">

          {/* 进度条 */}
          <div className="mb-14 px-4" style={{ maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
            <StepIndicator
              steps={[{ label: '姓名' }, { label: '性别' }, { label: '生辰' }, { label: '方位' }]}
              currentStep={step}
            />
          </div>

          {/* 主体：左右布局 */}
          <div className="grid md:grid-cols-5 gap-6 md:gap-12">

            {/* 左侧注解 — 仅桌面端 */}
            <div className="hidden md:flex md:col-span-2 flex-col justify-center">
              <span className="inline-block font-serif text-[11px] tracking-[0.3em] mb-4 text-gold-600">
                STEP {['ONE','TWO','THREE','FOUR'][step]}
              </span>
              <div className="font-serif text-5xl font-bold tracking-[0.15em] mb-3 glow-gold text-gold-200">
                {annotation.num}
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-wider mb-2 text-ink-100">
                {annotation.title}
              </h2>
              <p className="font-serif text-base tracking-wider mb-6 text-ink-300 font-light">
                {annotation.sub}
              </p>
              <div className="gold-line max-w-[40px] mb-6" />
              <p className="text-sm leading-relaxed mb-3 text-ink-300">{annotation.desc1}</p>
              <p className="text-sm leading-relaxed text-ink-300">{annotation.desc2}</p>

              {/* 八字预览 (Step 3) */}
              {step === 2 && baziPreview && (
                <div className="mt-8">
                  <div className="flex items-center mb-3">
                    <span className="text-[11px] tracking-wider text-gold-600">八字预览</span>
                  </div>
                  <div className="flex gap-3">
                    {(['year','month','day','hour'] as const).map((key, idx) => {
                      const labels = ['年柱','月柱','日柱','时柱'];
                      const p = baziPreview[key];
                      return (
                        <div key={key} className="text-center">
                          <span className="block text-ink-300 text-[9px] mb-1">{labels[idx]}</span>
                          <span className="block w-8 h-8 leading-8 border border-gold-400/15 bg-gold-400/[0.04] font-serif text-[13px] text-gold-200 rounded-t-sm">
                            {p[0]}
                          </span>
                          <span className="block w-8 h-8 leading-8 border border-gold-400/15 border-t-0 bg-gold-400/[0.04] font-serif text-[13px] text-gold-200 rounded-b-sm">
                            {p[1]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {shichen === 'unknown' && (
                    <div className="text-[9px] mt-2 text-vermilion-light">*时辰未定，暂以午时推算</div>
                  )}
                </div>
              )}

              {/* Step 4 装饰图 */}
              {step === 3 && (
                <div className="mt-8 opacity-[0.06]">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="animate-[breathe_5s_ease-in-out_infinite]">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-gold-400)" strokeWidth="1" />
                    <circle cx="32" cy="32" r="18" fill="none" stroke="var(--color-gold-400)" strokeWidth="0.5" strokeDasharray="2 3" />
                    <line x1="32" y1="2" x2="32" y2="62" stroke="var(--color-gold-400)" strokeWidth="0.5" />
                    <line x1="2" y1="32" x2="62" y2="32" stroke="var(--color-gold-400)" strokeWidth="0.5" />
                    <circle cx="32" cy="32" r="2" fill="var(--color-gold-400)" />
                  </svg>
                </div>
              )}
            </div>

            {/* 右侧输入区 */}
            <div className="md:col-span-3">

              {/* 移动端简短标题 */}
              <div className="flex md:hidden items-center gap-3 mb-5">
                <div className="font-serif text-3xl font-bold glow-gold text-gold-200">{annotation.num}</div>
                <div>
                  <h2 className="font-serif text-lg font-bold tracking-wider text-ink-100">{annotation.title}</h2>
                  <p className="text-xs text-ink-300">{annotation.sub}</p>
                </div>
              </div>

              {/* Step 1: 姓名 */}
              {step === 0 && (
                <div className="animate-fade-in-up">
                  <div className="jinming-card rounded-sm p-7 md:p-10 hover:transform-none hover:shadow-none">
                    <div className="before:bg-gradient-to-r before:from-transparent before:via-vermilion before:to-gold-400">
                      <label className="block font-serif text-sm tracking-wider mb-2 text-gold-400">
                        <PenLine className="inline mr-2 text-xs" size={14} />
                        请输入姓名
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={fullName}
                        onChange={(e) => handleNameInput(e.target.value)}
                        placeholder="如：张晏如"
                        maxLength={6}
                        autoComplete="off"
                        className="input-ritual w-full px-5 py-4 rounded-sm text-lg font-serif tracking-widest"
                      />

                      {fullName.length > 0 && !isNameValid && (
                        <div className="flex items-center gap-1 mt-2 text-vermilion-light text-xs">
                          <AlertTriangle size={10} />
                          <span>请输入中文汉字姓名</span>
                        </div>
                      )}

                      <p className="text-xs mt-2.5 text-ink-300">输入2-4个汉字，首字为姓氏</p>

                      {/* 复姓检测 */}
                      {isCompoundSurname && isNameValid && (
                        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded bg-gold-400/[0.06] border border-gold-400/15 text-xs">
                          <CheckCircle size={10} className="text-gold-400" />
                          <span className="text-gold-200 font-serif">检测到复姓：{surname}</span>
                        </div>
                      )}

                      {/* 实时五行分析 */}
                      {isNameValid && (
                        <div className="mt-6">
                          <GoldLine className="mb-5" />

                          {/* 逐字五行 */}
                          <div className="mb-5">
                            <div className="text-[11px] tracking-wider mb-3 text-gold-400 flex items-center gap-1">
                              <Info size={9} /> 逐字五行
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {fullName.split('').map((c, i) => {
                                const wx = charWuxingList[i];
                                const isSur = i < surname.length;
                                return (
                                  <div key={i} className={`inline-flex flex-col items-center gap-1 px-3 py-2.5 rounded-md bg-gold-400/[0.04] border ${isSur ? 'border-gold-400/25 bg-gold-400/[0.08]' : 'border-gold-400/12'}`}>
                                    <span className="font-serif text-[22px] font-bold text-gold-200">{c}</span>
                                    <WuxingTag wuxing={wx}>
                                      <WxIcon wx={wx} size={8} /> {wx}
                                    </WuxingTag>
                                    <span className="text-[8px] text-gold-400">{isSur ? '姓' : '名'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 五行格局 */}
                          <div className="rounded-sm p-4 bg-gold-400/[0.03] border border-gold-400/8">
                            <div className="text-[11px] tracking-wider mb-3 text-gold-400 flex items-center gap-1">
                              <Info size={9} /> 五行格局
                            </div>
                            <div className="space-y-2.5">
                              {['金','木','水','火','土'].map((wx, i) => {
                                const count = wxCount[wx];
                                const pct = fullName.length > 0 ? Math.round((count / fullName.length) * 100) : 0;
                                const barPct = Math.round((count / maxWxCount) * 100);
                                return (
                                  <div key={wx + "-" + String(i)} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 w-12">
                                      <WxIcon wx={wx} size={10} />
                                      <span className="font-serif text-xs" style={{ color: WX_COLORS[wx] }}>{wx}</span>
                                    </div>
                                    <div className="flex-1 h-1 rounded bg-gold-400/[0.06] overflow-hidden">
                                      <div
                                        className="h-full rounded"
                                        style={{
                                          width: `${barPct}%`,
                                          background: `linear-gradient(90deg, rgba(${WX_RGB[wx]},0.4), rgba(${WX_RGB[wx]},0.8))`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[11px] font-serif w-14 text-right" style={{ color: count === 0 ? 'var(--color-ink-300)' : WX_COLORS[wx] }}>
                                      {count === 0 ? '缺' : `${count}个·${pct}%`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* 总评 */}
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] text-ink-300">姓名五行：</span>
                              {presentWx.map((wx, i) => (
                                <WuxingTag key={wx + "-" + i} wuxing={wx}>
                                  <WxIcon wx={wx} size={8} /> {wx}
                                </WuxingTag>
                              ))}
                              {lackingWx.length > 0 && (
                                <>
                                  <span className="text-[10px] text-ink-300">缺</span>
                                  {lackingWx.map((wx, i) => (
                                    <span key={wx + "-" + String(i)} className="text-[9px] px-1.5 py-0.5 rounded bg-vermilion/[0.08] text-vermilion-light border border-vermilion/15">
                                      {wx}
                                    </span>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>

                          {/* 二字名提示 */}
                          {fullName.length === 2 && (
                            <div className="mt-2 px-3 py-2 rounded bg-gold-400/[0.03] border border-gold-400/8 text-[11px] text-ink-300 leading-relaxed">
                              <Info size={9} className="inline mr-1 text-gold-600" />
                              二字名五行格局较简，评测将以三才五格与八字喜用为主要维度。
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: 性别 */}
              {step === 1 && (
                <div className="animate-fade-in-up">
                  <div className="jinming-card rounded-sm p-7 md:p-10 hover:transform-none hover:shadow-none">
                    <label className="block font-serif text-sm tracking-wider mb-6 text-gold-400">
                      <Users className="inline mr-2 text-xs" size={14} />
                      请选择性别
                    </label>
                    <div className="grid grid-cols-2 gap-5">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`rounded-sm py-8 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                          gender === 'male'
                            ? 'bg-gold-400/12 border-gold-400 text-gold-200 border'
                            : 'bg-gold-400/[0.04] border border-gold-400/15 text-ink-100 hover:border-gold-400/30 hover:bg-gold-400/[0.06]'
                        }`}
                        aria-pressed={gender === 'male'}
                      >
                        <Flame size={24} className={gender === 'male' ? 'text-gold-200' : 'text-ink-300'} />
                        <span className="font-serif text-lg tracking-wider">男</span>
                        <span className="text-xs text-ink-300">乾 · 刚健中正</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`rounded-sm py-8 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                          gender === 'female'
                            ? 'bg-gold-400/12 border-gold-400 text-gold-200 border'
                            : 'bg-gold-400/[0.04] border border-gold-400/15 text-ink-100 hover:border-gold-400/30 hover:bg-gold-400/[0.06]'
                        }`}
                        aria-pressed={gender === 'female'}
                      >
                        <Droplets size={24} className={gender === 'female' ? 'text-gold-200' : 'text-ink-300'} />
                        <span className="font-serif text-lg tracking-wider">女</span>
                        <span className="text-xs text-ink-300">坤 · 厚德载物</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: 生辰 */}
              {step === 2 && (
                <div className="animate-fade-in-up">
                  <div className="jinming-card rounded-sm p-7 md:p-10 hover:transform-none hover:shadow-none">
                    <label className="block font-serif text-sm tracking-wider mb-2 text-gold-400">
                      <Clock className="inline mr-2 text-xs" size={14} />
                      出生时间
                    </label>
                    <div className="flex items-center gap-2 mb-5">
                      <Info size={10} className="text-gold-600" />
                      <span className="text-xs text-ink-300">请填写公历（阳历）日期，系统将自动转换农历</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="block text-xs mb-1.5 text-ink-300">年</label>
                        <input
                          type="number"
                          value={birthYear}
                          onChange={(e) => setBirthYear(e.target.value)}
                          placeholder="2024"
                          min={1940}
                          max={2030}
                          className="input-ritual w-full px-4 py-3.5 rounded-sm text-sm font-serif"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5 text-ink-300">月</label>
                        <input
                          type="number"
                          value={birthMonth}
                          onChange={(e) => setBirthMonth(e.target.value)}
                          placeholder="1-12"
                          min={1}
                          max={12}
                          className="input-ritual w-full px-4 py-3.5 rounded-sm text-sm font-serif"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5 text-ink-300">日</label>
                        <input
                          type="number"
                          value={birthDay}
                          onChange={(e) => setBirthDay(e.target.value)}
                          placeholder="1-31"
                          min={1}
                          max={31}
                          className="input-ritual w-full px-4 py-3.5 rounded-sm text-sm font-serif"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs mb-1.5 text-ink-300">时辰</label>
                      <div className="relative">
                        <select
                          value={shichen}
                          onChange={(e) => setShichen(e.target.value)}
                          className="input-ritual w-full px-4 py-3.5 rounded-sm text-sm font-serif cursor-pointer appearance-none pr-10"
                        >
                          <option value="">请选择时辰</option>
                          {SHICHEN_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                          <option value="unknown">不确定</option>
                        </select>
                        <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-ink-300 pointer-events-none" />
                      </div>
                    </div>

                    {/* 时辰不确定提示 */}
                    {shichen === 'unknown' && (
                      <div className="mt-3 px-3 py-2.5 rounded bg-vermilion/[0.05] border border-vermilion/15">
                        <div className="text-[11px] font-semibold text-vermilion-light mb-1 flex items-center gap-1">
                          <AlertTriangle size={9} /> 时辰未确定
                        </div>
                        <div className="text-[11px] text-ink-300 leading-relaxed">
                          时柱占八字四柱之一，对喜用神判定影响较大。未选时辰时，系统将以午时推算，评测结果仅供参考。若能确定时辰，建议回来重新评测。
                        </div>
                      </div>
                    )}

                    <p className="text-xs mt-3 text-ink-300">请尽量精确到时辰，时辰是八字推演的关键</p>

                    {/* 移动端八字预览 */}
                    <div className="md:hidden mt-4">
                      {baziPreview && (
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-[11px] tracking-wider text-gold-600">八字预览</span>
                          </div>
                          <div className="flex gap-3">
                            {(['year','month','day','hour'] as const).map((key, idx) => {
                              const labels = ['年柱','月柱','日柱','时柱'];
                              const p = baziPreview[key];
                              return (
                                <div key={key} className="text-center">
                                  <span className="block text-ink-300 text-[9px] mb-1">{labels[idx]}</span>
                                  <span className="block w-7 h-7 leading-7 border border-gold-400/15 bg-gold-400/[0.04] font-serif text-[11px] text-gold-200 rounded-t-sm">{p[0]}</span>
                                  <span className="block w-7 h-7 leading-7 border border-gold-400/15 border-t-0 bg-gold-400/[0.04] font-serif text-[11px] text-gold-200 rounded-b-sm">{p[1]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: 出生地 */}
              {step === 3 && (
                <div className="animate-fade-in-up">
                  <div className="jinming-card rounded-sm p-7 md:p-10 hover:transform-none hover:shadow-none">
                    <label className="block font-serif text-sm tracking-wider mb-2 text-gold-400">
                      <MapPin className="inline mr-2 text-xs" size={14} />
                      出生地点 <span className="text-xs font-sans text-ink-300 font-normal">（选填）</span>
                    </label>
                    <input
                      type="text"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="如：北京市朝阳区"
                      className="input-ritual w-full px-5 py-4 rounded-sm text-sm"
                    />
                    <p className="text-xs mt-3 text-ink-300">用于真太阳时校准。不同经度地区，真太阳时与北京时间有偏差</p>

                    {/* 确认回显 */}
                    <div className="mt-6 pt-5 border-t border-gold-400/8">
                      <div className="text-[11px] tracking-wider mb-3 text-gold-400 flex items-center gap-1">
                        <CheckCircle size={9} /> 测名信息确认
                      </div>
                      <div className="rounded-sm p-4 bg-gold-400/[0.03] border border-gold-400/8">
                        {fullName && gender ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
                              <div className="flex items-center gap-1.5">
                                <PenLine size={9} className="text-gold-600" />
                                <span className="font-serif font-bold text-gold-200">{fullName}</span>
                              </div>
                              <div className="text-gold-400/15">|</div>
                              <div>{gender === 'male' ? '男' : '女'}</div>
                              {birthYear && (
                                <>
                                  <div className="text-gold-400/15">|</div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={9} className="text-gold-600" />
                                    {birthYear}年{birthMonth}月{birthDay}日
                                    {shichen && shichen !== 'unknown' && (
                                      <span> {SHICHEN_OPTIONS[parseInt(shichen)]?.label?.split(' ')[0]}</span>
                                    )}
                                  </div>
                                  {shichen === 'unknown' && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-vermilion/10 border border-dashed border-vermilion/30 text-vermilion-light">
                                      时辰未定
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {/* 五行总评 */}
                            {isNameValid && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-ink-300">五行：</span>
                                {presentWx.map((wx, i) => (
                                  <WuxingTag key={wx + "-" + i} wuxing={wx}>
                                    <WxIcon wx={wx} size={8} /> {wx}{wxCount[wx]}
                                  </WuxingTag>
                                ))}
                                {lackingWx.length > 0 && (
                                  <>
                                    <span className="text-[10px] text-ink-300">缺</span>
                                    {lackingWx.map((wx, i) => (
                                      <span key={wx + "-" + String(i)} className="text-[9px] px-1.5 py-0.5 rounded bg-vermilion/[0.08] text-vermilion-light border border-vermilion/15">{wx}</span>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}

                            {/* 八字日主预览 */}
                            {baziPreview && (
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-ink-300">日主：</span>
                                <span className="font-serif font-bold text-gold-200">{baziPreview.day[0]}</span>
                                <WuxingTag wuxing={TG_WX[baziPreview.day[0]]}>
                                  <WxIcon wx={TG_WX[baziPreview.day[0]]} size={8} /> {TG_WX[baziPreview.day[0]]}
                                </WuxingTag>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-ink-300">请先完成前序步骤</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 底部操作栏 */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={prevStep}
                  className={`btn-outline-gold px-6 py-3 rounded-sm text-[12px] font-serif tracking-wider ${step === 0 ? 'invisible' : ''}`}
                >
                  <ChevronLeft size={10} className="inline mr-2" />上一步
                </button>
                <div className="flex items-center gap-2 text-xs text-ink-300">
                  <span>{step + 1}</span> / 4
                </div>
                <button
                  onClick={nextStep}
                  disabled={!isStepValid || loading}
                  className={`px-8 py-3 rounded-sm text-[13px] font-serif tracking-[0.2em] transition-all ${
                    step === 3
                      ? 'btn-gold animate-[final-pulse_2s_ease-in-out_infinite]'
                      : 'btn-vermilion'
                  } ${!isStepValid || loading ? 'opacity-30 cursor-not-allowed !transform-none !shadow-none' : ''}`}
                >
                  {step === 3 ? (
                    loading ? (
                      <><span className="inline-block animate-spin mr-2">⏳</span>分析中...</>
                    ) : (
                      <><Search size={10} className="inline mr-2" />开始测名</>
                    )
                  ) : (
                    <>下一步<ChevronRight size={10} className="inline ml-2" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded bg-vermilion/10 border border-vermilion/20 text-vermilion text-sm text-center animate-fade-in-up">
          {error}
        </div>
      )}

      {/* 底部合规标识 */}
      <div className="text-center pb-6 text-ink-500 text-xs">
        仅供传统文化参考
      </div>

      {/* 动画 keyframes */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.03); }
        }
        @keyframes final-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196,86,74,0.35); }
          50% { box-shadow: 0 0 0 10px rgba(196,86,74,0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        input[type=number] { -moz-appearance: textfield; }
        select option {
          background: #1a1510; color: #e8e0d4; padding: 8px;
        }
      `}</style>
    </div>
  );
}
