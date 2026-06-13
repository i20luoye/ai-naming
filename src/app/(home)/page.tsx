'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Search,
  PenTool,
  Flame,
  Cpu,
  Leaf,
  Gem,
  TrendingUp,
  BookOpen,
  Droplets,
  Mountain,
  Star,
  Mail,
  Phone,
  Menu,
  X,
} from 'lucide-react';
import { GoldLine } from '@/components/tianyan/GoldLine';

/* ──────────────────── 类型 ──────────────────── */

interface DailyName {
  full: string;
  meaning: string;
  source: string;
  score: number;
  wuxing: string;
  tags: string[];
}

interface CaseItem {
  gender: string;
  birthYear: string;
  wuxingDesc: string;
  name: string;
  score: number;
  scoreDash: number;
  desc: string;
  tags: { icon: React.ReactNode; color: string; label: string }[];
}

interface ReviewItem {
  surname: string;
  surnameBg: string;
  surnameColor: string;
  name: string;
  time: string;
  stars: number;
  halfStar: boolean;
  text: string;
}

/* ──────────────────── 常量数据 ──────────────────── */

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const GAN_WX: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const WX_COLORS: Record<string, string> = {
  金: '#e8d09a', 木: '#81c784', 水: '#64b5f6', 火: '#d4726a', 土: '#d4c4a0',
};
const WX_ICONS: Record<string, string> = {
  金: 'gem', 木: 'leaf', 水: 'droplets', 火: 'flame', 土: 'mountain',
};

const NAME_POOL: Record<string, DailyName[]> = {
  金: [
    { full: '李铭远', meaning: '铭刻远志，金声玉振', source: '铭者自名，远者志高', score: 95, wuxing: '金', tags: ['助金', '坚毅', '数理吉'] },
    { full: '周诗韵', meaning: '诗礼传家，韵致天成', source: '诗三百，一言以蔽之', score: 93, wuxing: '金', tags: ['助金', '温雅', '音韵佳'] },
    { full: '赵锦书', meaning: '锦绣文章，书卷自华', source: '云中谁寄锦书来', score: 94, wuxing: '金', tags: ['助金', '文采', '三才吉'] },
  ],
  木: [
    { full: '陈梓轩', meaning: '梓木栋梁，气宇轩昂', source: '梓匠轮舆，轩然霞举', score: 96, wuxing: '木', tags: ['补木', '才德', '五格吉'] },
    { full: '林蕊溪', meaning: '花蕊含芳，溪流清婉', source: '蕊珠宫里溪山好', score: 92, wuxing: '木', tags: ['补木', '灵秀', '三才吉'] },
    { full: '王柏霖', meaning: '柏松常青，甘霖润物', source: '岁寒然后知松柏之后凋', score: 94, wuxing: '木', tags: ['补木', '长青', '数理吉'] },
  ],
  水: [
    { full: '张泽宇', meaning: '泽被苍生，气度宏宇', source: '润泽万物，宇内归心', score: 95, wuxing: '水', tags: ['补水', '广阔', '五格吉'] },
    { full: '苏沁瑶', meaning: '沁人心脾，瑶台仙姿', source: '沁水之阳，瑶池之畔', score: 93, wuxing: '水', tags: ['补水', '清雅', '音韵佳'] },
    { full: '沈澜依', meaning: '波澜壮阔，依水而安', source: '观澜而知源，依水而居安', score: 91, wuxing: '水', tags: ['补水', '从容', '三才吉'] },
  ],
  火: [
    { full: '刘煜辰', meaning: '煜然光明，星辰大海', source: '煜乎如辰星之灿烂', score: 96, wuxing: '火', tags: ['补火', '光明', '数理吉'] },
    { full: '杨晗月', meaning: '晗光初照，月华流芳', source: '晗光破晓，月出皎兮', score: 94, wuxing: '火', tags: ['补火', '明朗', '三才吉'] },
    { full: '吴晟睿', meaning: '晟明通达，睿智超群', source: '晟世明时，睿哲文明', score: 93, wuxing: '火', tags: ['补火', '智达', '五格吉'] },
  ],
  土: [
    { full: '黄坤宇', meaning: '坤厚载物，宇量弘深', source: '地势坤，君子以厚德载物', score: 95, wuxing: '土', tags: ['助土', '厚德', '数理吉'] },
    { full: '许婉清', meaning: '婉约清雅，如沐春风', source: '有美一人，清扬婉兮', score: 94, wuxing: '土', tags: ['助土', '温婉', '音韵佳'] },
    { full: '郑岳铭', meaning: '五岳巍峨，铭刻心志', source: '泰山不让土壤', score: 92, wuxing: '土', tags: ['助土', '稳重', '三才吉'] },
  ],
};

const CASES: CaseItem[] = [
  {
    gender: '女', birthYear: '2024年生', wuxingDesc: '五行补火',
    name: '沈晏如', score: 96, scoreDash: 96,
    desc: '"晏如"出《诗经·郑风》"言笑晏晏"，意为安然自若、从容不迫。晏字属火补八字火弱；如字属金，金火相照，光彩照人。',
    tags: [
      { icon: <Flame className="w-3 h-3" />, color: 'text-vermilion-light', label: '补火' },
      { icon: <Gem className="w-3 h-3" />, color: 'text-gold-200', label: '助金' },
      { icon: <TrendingUp className="w-3 h-3" />, color: 'text-wuxing-mu', label: '五格吉' },
      { icon: <BookOpen className="w-3 h-3" />, color: 'text-wuxing-shui', label: '诗经' },
    ],
  },
  {
    gender: '男', birthYear: '2023年生', wuxingDesc: '五行补火',
    name: '林毓辰', score: 93, scoreDash: 92,
    desc: '"毓"为钟灵毓秀之意，五行属火，暖木生火；"辰"为星辰、时辰，属土，火土相生。二字合之，寓毓秀才德、灿若星辰。',
    tags: [
      { icon: <Flame className="w-3 h-3" />, color: 'text-vermilion-light', label: '补火' },
      { icon: <Mountain className="w-3 h-3" />, color: 'text-wuxing-tu', label: '助土' },
      { icon: <TrendingUp className="w-3 h-3" />, color: 'text-wuxing-mu', label: '三才吉' },
      { icon: <BookOpen className="w-3 h-3" />, color: 'text-wuxing-shui', label: '典故' },
    ],
  },
  {
    gender: '男', birthYear: '2024年生', wuxingDesc: '五行补火',
    name: '陈瑾瑜', score: 94, scoreDash: 94,
    desc: '"瑾瑜"出《楚辞·九章》"怀瑾握瑜"，谓美玉品德。瑾瑜皆属火，双火齐明，正合八字火为喜用之局，光明坦荡。',
    tags: [
      { icon: <Flame className="w-3 h-3" />, color: 'text-vermilion-light', label: '双火' },
      { icon: <Gem className="w-3 h-3" />, color: 'text-gold-200', label: '美玉' },
      { icon: <TrendingUp className="w-3 h-3" />, color: 'text-wuxing-mu', label: '数理吉' },
      { icon: <BookOpen className="w-3 h-3" />, color: 'text-wuxing-shui', label: '楚辞' },
    ],
  },
  {
    gender: '女', birthYear: '2025年生', wuxingDesc: '五行补水',
    name: '苏潆月', score: 91, scoreDash: 91,
    desc: '"潆"为水流环绕之貌，属水；"月"为太阴之象，亦属水。双水润木，化泄金之肃杀，名字柔美而命理合度，温婉中见格局。',
    tags: [
      { icon: <Droplets className="w-3 h-3" />, color: 'text-wuxing-shui', label: '补水' },
      { icon: <Leaf className="w-3 h-3" />, color: 'text-wuxing-mu', label: '润木' },
      { icon: <TrendingUp className="w-3 h-3" />, color: 'text-wuxing-mu', label: '三才吉' },
      { icon: <BookOpen className="w-3 h-3" />, color: 'text-wuxing-shui', label: '意境' },
    ],
  },
];

const REVIEWS: ReviewItem[] = [
  {
    surname: '张', surnameBg: 'bg-gold-400/10', surnameColor: 'text-gold-400',
    name: '张女士', time: '2024年3月为女儿起名', stars: 5, halfStar: false,
    text: '本来对AI起名半信半疑，但看到八字排盘和五行分析，每一步都有理有据。最终选了"晏如"这个名字，家里老人也很满意，说既有出处又好听。',
  },
  {
    surname: '王', surnameBg: 'bg-wuxing-mu/10', surnameColor: 'text-wuxing-mu',
    name: '王先生', time: '2024年8月为儿子起名', stars: 5, halfStar: false,
    text: '之前找线下师傅花了三千多，名字也不太满意。天衍给出了五个名字，每个都有详细的命理分析，最终选了"毓辰"，性价比太高了。',
  },
  {
    surname: '李', surnameBg: 'bg-wuxing-shui/10', surnameColor: 'text-wuxing-shui',
    name: '李女士', time: '2025年1月为女儿起名', stars: 4, halfStar: true,
    text: '最打动我的是每个名字都标注了诗词出处和五行补益，不是随便翻字典凑的。推荐给同样在意名字内涵的父母。',
  },
  {
    surname: '陈', surnameBg: 'bg-vermilion/10', surnameColor: 'text-vermilion',
    name: '陈先生', time: '2024年11月为儿子起名', stars: 5, halfStar: false,
    text: '"瑾瑜"这个名字，出生时找的师傅也推荐过类似的。天衍的分析和线下师傅说得基本一致，但给出了更多选择和更详细的解释。',
  },
];

const COUNTER_DATA = [
  { target: 128600, suffix: '+', label: '累计起名', decimal: false },
  { target: 36, suffix: '位', label: '命理师审核', decimal: false },
  { target: 98.7, suffix: '%', label: '好评率', decimal: true },
  { target: 2400, suffix: '+', label: '典籍收录', decimal: false },
];

const STEPS = [
  { num: '壹', title: '八字排盘', desc: '依出生时间精确排列四柱八字，定天干地支、纳音五行' },
  { num: '贰', title: '五行推算', desc: '分析八字五行强弱盛衰，判别喜用神与忌神' },
  { num: '叁', title: '三才五格', desc: '计算天格、人格、地格、外格、总格，确保数理大吉' },
  { num: '肆', title: 'AI 生成', desc: '深度学习模型基于命理参数与亿级语料生成候选名', pulse: true },
  { num: '伍', title: '命理校验', desc: '逐名校验五行生克、音韵和谐、字义吉祥' },
  { num: '陆', title: '专家终审', desc: '命理师终审确认，确保每名皆合命理、宜称呼、利运势' },
];

/* ──────────────────── 工具函数 ──────────────────── */

function seededRandom(s: number) {
  let x = Math.sin(s) * 10000;
  return x - Math.floor(x);
}

function getTodayGanZhi() {
  const today = new Date();
  const dayDiff = Math.floor((today.getTime() - new Date(2000, 0, 1).getTime()) / 86400000);
  const dayGanIdx = ((dayDiff + 6) % 10 + 10) % 10;
  const dayZhiIdx = (dayDiff % 12 + 12) % 12;
  return { todayGan: TIAN_GAN[dayGanIdx], todayZhi: DI_ZHI[dayZhiIdx], todayWx: GAN_WX[TIAN_GAN[dayGanIdx]] };
}

function getDailyNames(): (DailyName & { todayGan: string; todayZhi: string })[] {
  const { todayGan, todayZhi, todayWx } = getTodayGanZhi();
  const wxOrder = ['金', '木', '水', '火', '土'];
  const todayIdx = wxOrder.indexOf(todayWx);
  const sel1 = todayWx;
  const sel2 = wxOrder[(todayIdx + 1) % 5];
  const sel3 = wxOrder[(todayIdx + 3) % 5];
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const picks: (DailyName & { todayGan: string; todayZhi: string })[] = [];
  [sel1, sel2, sel3].forEach((wx, i) => {
    const pool = NAME_POOL[wx];
    const idx = Math.floor(seededRandom(seed + i * 7) * pool.length);
    picks.push({ ...pool[idx], todayGan, todayZhi });
  });
  return picks;
}

function getWxTagIcon(wxKey: string, isWxTag: boolean) {
  if (!isWxTag) return <span className="w-1.5 h-1.5 rounded-full bg-wuxing-mu inline-block" />;
  const map: Record<string, React.ReactNode> = {
    金: <Gem className="w-2.5 h-2.5" />,
    木: <Leaf className="w-2.5 h-2.5" />,
    水: <Droplets className="w-2.5 h-2.5" />,
    火: <Flame className="w-2.5 h-2.5" />,
    土: <Mountain className="w-2.5 h-2.5" />,
  };
  return map[wxKey] || null;
}

function ScoreRing({ score, color }: { score: number; color?: string }) {
  const dash = Math.round(score * 1.38);
  const strokeColor = color || 'var(--color-gold-400)';
  return (
    <div className="relative w-[52px] h-[52px]">
      <svg width="52" height="52" viewBox="0 0 52 52" className="transform -rotate-90">
        <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(200,164,92,0.1)" strokeWidth="3" />
        <circle cx="26" cy="26" r="22" fill="none" stroke={strokeColor} strokeWidth="3" strokeDasharray={`${dash} 138`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-serif font-bold text-sm glow-score" style={{ color: color || 'var(--color-gold-200)' }}>
        {score}
      </span>
    </div>
  );
}

function StarRating({ count, half }: { count: number; half: boolean }) {
  return (
    <div className="flex gap-0.5 ml-auto">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
      ))}
      {half && <Star className="w-2.5 h-2.5 text-gold-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
    </div>
  );
}

/* ──────────────────── 主页面组件 ──────────────────── */

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const counterSectionRef = useRef<HTMLDivElement>(null);
  const counterStartedRef = useRef(false);

  /* ── Canvas 墨粒粒子动画 ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let mouseX = -999;
    let mouseY = -999;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const INITIAL_PARTICLES = isLowEnd ? 14 : 28;
    const LOW_FPS_THRESHOLD = 28;

    interface InkParticle {
      x: number; y: number; radius: number; vx: number; vy: number;
      baseOpacity: number; opacity: number; isGold: boolean; phase: number;
      reset: () => void; update: (time: number) => void; draw: () => void;
    }

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: InkParticle[] = [];

    function createParticle(): InkParticle {
      const p = {
        x: 0, y: 0, radius: 0, vx: 0, vy: 0,
        baseOpacity: 0, opacity: 0, isGold: false, phase: 0,
        reset() {
          if (!canvas) return;
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.radius = Math.random() * (isLowEnd ? 80 : 120) + (isLowEnd ? 20 : 40);
          this.vx = (Math.random() - 0.5) * 0.18;
          this.vy = (Math.random() - 0.5) * 0.12;
          this.baseOpacity = Math.random() * 0.02 + 0.004;
          this.opacity = this.baseOpacity;
          this.isGold = Math.random() > 0.6;
          this.phase = Math.random() * Math.PI * 2;
        },
        update(time: number) {
          if (!canvas) return;
          this.x += this.vx;
          this.y += this.vy;
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 0) {
            this.x += (dx / dist) * 0.25;
            this.y += (dy / dist) * 0.25;
          }
          this.opacity = this.baseOpacity * (0.6 + 0.4 * Math.sin(time * 0.0008 + this.phase));
          if (this.x < -this.radius) this.x = canvas.width + this.radius;
          if (this.x > canvas.width + this.radius) this.x = -this.radius;
          if (this.y < -this.radius) this.y = canvas.height + this.radius;
          if (this.y > canvas.height + this.radius) this.y = -this.radius;
        },
        draw() {
          if (!ctx) return;
          const r = Math.max(1, this.radius);
          const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
          if (this.isGold) {
            g.addColorStop(0, `rgba(200,164,92,${this.opacity})`);
            g.addColorStop(1, 'rgba(200,164,92,0)');
          } else {
            g.addColorStop(0, `rgba(232,224,212,${this.opacity})`);
            g.addColorStop(1, 'rgba(232,224,212,0)');
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
          ctx.fill();
        },
      };
      p.reset();
      return p;
    }

    for (let i = 0; i < INITIAL_PARTICLES; i++) {
      particles.push(createParticle());
    }

    let fpsFrameCount = 0;
    let fpsLastCheck = performance.now();
    let lowFpsStart: number | null = null;
    let hasDegraded = false;

    function animateCanvas(time: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update(time);
        p.draw();
      });

      // FPS 监控 & 智能降级
      fpsFrameCount++;
      const fpsElapsed = time - fpsLastCheck;
      if (fpsElapsed >= 1000) {
        const currentFps = (fpsFrameCount / fpsElapsed) * 1000;
        fpsFrameCount = 0;
        fpsLastCheck = time;
        if (currentFps < LOW_FPS_THRESHOLD) {
          if (!lowFpsStart) lowFpsStart = time;
          if (time - lowFpsStart > 2000 && !hasDegraded && particles.length > 8) {
            particles.splice(0, Math.floor(particles.length / 2));
            hasDegraded = true;
          }
        } else {
          lowFpsStart = null;
        }
      }

      animationId = requestAnimationFrame(animateCanvas);
    }

    animationId = requestAnimationFrame(animateCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  /* ── 导航滚动效果 ── */
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── 滚动揭示 (IntersectionObserver) ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── 数字递增动画 ── */
  useEffect(() => {
    const section = counterSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !counterStartedRef.current) {
            counterStartedRef.current = true;
            COUNTER_DATA.forEach((c, i) => {
              const el = document.getElementById(`counter-${i}`);
              if (!el) return;
              const duration = 2200;
              const start = performance.now();
              function update(now: number) {
                const p = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const val = c.target * ease;
                if (el) {
                  el.textContent = c.decimal
                    ? val.toFixed(1) + c.suffix
                    : Math.floor(val).toLocaleString() + c.suffix;
                }
                if (p < 1) requestAnimationFrame(update);
              }
              requestAnimationFrame(update);
            });
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* ── 今日吉名 ── */
  const dailyNames = getDailyNames();
  const { todayGan, todayZhi } = getTodayGanZhi();

  /* ── 平滑滚动 ── */
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  /* ────────────────────────────────────────────── */
  /* ──────────────────── 渲染 ──────────────────── */
  /* ────────────────────────────────────────────── */

  return (
    <>
      {/* ═══ Canvas 墨粒背景 ═══ */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* ═══ 固定导航栏 ═══ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navScrolled
            ? 'bg-ink-900/92 backdrop-blur-[14px] border-b border-gold-400/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg
                width="26"
                height="26"
                viewBox="0 0 100 100"
                className="transition-transform duration-700 group-hover:rotate-180"
              >
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(200,164,92,0.3)" strokeWidth="1.5" />
                <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2" fill="rgba(200,164,92,0.55)" />
                <path d="M50 2 A48 48 0 0 0 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2" fill="rgba(232,224,212,0.12)" />
                <circle cx="50" cy="26" r="5.5" fill="rgba(232,224,212,0.15)" />
                <circle cx="50" cy="74" r="5.5" fill="rgba(200,164,92,0.55)" />
              </svg>
              <span className="font-serif font-bold text-base tracking-[0.2em] text-gold-200">
                天衍
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-7 text-[13px]">
              <button onClick={() => scrollTo('philosophy')} className="nav-link text-ink-300 hover:text-gold-400 transition-colors">理念</button>
              <button onClick={() => scrollTo('jinming')} className="nav-link text-ink-300 hover:text-gold-400 transition-colors">今日吉名</button>
              <button onClick={() => scrollTo('process')} className="nav-link text-ink-300 hover:text-gold-400 transition-colors">推演</button>
              <button onClick={() => scrollTo('reviews')} className="nav-link text-ink-300 hover:text-gold-400 transition-colors">口碑</button>
              <GoldLine vertical className="h-4 mx-1" />
              <Link href="/test-name" className="nav-link text-vermilion hover:text-vermilion-light transition-colors">测名</Link>
              <Link href="/name/input" className="btn-gold px-5 py-2 rounded-sm text-[12px] font-serif">
                开始起名
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gold-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="菜单"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-5 space-y-1 bg-ink-900/96 backdrop-blur-[16px]">
            <button onClick={() => scrollTo('philosophy')} className="block py-2.5 text-sm text-ink-300 w-full text-left">理念</button>
            <button onClick={() => scrollTo('jinming')} className="block py-2.5 text-sm text-ink-300 w-full text-left">今日吉名</button>
            <button onClick={() => scrollTo('process')} className="block py-2.5 text-sm text-ink-300 w-full text-left">推演</button>
            <button onClick={() => scrollTo('reviews')} className="block py-2.5 text-sm text-ink-300 w-full text-left">口碑</button>
            <Link href="/test-name" className="block py-2.5 text-sm text-vermilion">测名</Link>
            <div className="pt-3">
              <Link href="/name/input" className="btn-gold block w-full py-2.5 rounded-sm text-xs text-center font-serif">
                开始起名
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ Hero 区域 ═══ */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden z-[1]">
        {/* 太极星盘 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[280px] h-[280px] md:w-[440px] md:h-[440px]">
            {/* 星盘经纬网格 */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 440 440"
              style={{ animation: 'astrolabe-spin 120s linear infinite, astrolabe-breathe 6s ease-in-out infinite' }}
            >
              <circle cx="220" cy="220" r="215" fill="none" stroke="#c8a45c" strokeWidth="0.6" opacity="0.12" />
              <circle cx="220" cy="220" r="198" fill="none" stroke="#c8a45c" strokeWidth="0.5" opacity="0.09" strokeDasharray="2 6" />
              <circle cx="220" cy="220" r="175" fill="none" stroke="#c8a45c" strokeWidth="0.5" opacity="0.10" strokeDasharray="5 10" />
              <circle cx="220" cy="220" r="148" fill="none" stroke="#c8a45c" strokeWidth="0.4" opacity="0.08" strokeDasharray="1.5 8" />
              <circle cx="220" cy="220" r="120" fill="none" stroke="#c8a45c" strokeWidth="0.4" opacity="0.07" strokeDasharray="3 12" />
              <circle cx="220" cy="220" r="88" fill="none" stroke="#c8a45c" strokeWidth="0.3" opacity="0.06" strokeDasharray="2 10" />
              {/* 8条径向线 */}
              <line x1="220" y1="5" x2="220" y2="435" stroke="#c8a45c" strokeWidth="0.4" opacity="0.08" strokeDasharray="3 7" />
              <line x1="220" y1="5" x2="220" y2="435" stroke="#c8a45c" strokeWidth="0.4" opacity="0.08" strokeDasharray="3 7" transform="rotate(45 220 220)" />
              <line x1="220" y1="5" x2="220" y2="435" stroke="#c8a45c" strokeWidth="0.4" opacity="0.08" strokeDasharray="3 7" transform="rotate(90 220 220)" />
              <line x1="220" y1="5" x2="220" y2="435" stroke="#c8a45c" strokeWidth="0.4" opacity="0.08" strokeDasharray="3 7" transform="rotate(135 220 220)" />
              {/* 外圈大刻度 */}
              <g fill="#c8a45c" opacity="0.2">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <circle key={deg} cx="220" cy="8" r="2.5" transform={`rotate(${deg} 220 220)`} />
                ))}
              </g>
              {/* 内圈小刻度 */}
              <g fill="#c8a45c" opacity="0.12">
                {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
                  <circle key={deg} cx="220" cy="32" r="1.5" transform={`rotate(${deg} 220 220)`} />
                ))}
                {[45, 90, 135, 180, 225, 270, 315, 0].map((deg) => (
                  <circle key={`m${deg}`} cx="220" cy="32" r="2" transform={`rotate(${deg} 220 220)`} />
                ))}
              </g>
            </svg>

            {/* 外圈旋转 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 440" style={{ animation: 'taiji-spin 90s linear infinite' }}>
              <circle cx="220" cy="220" r="208" fill="none" stroke="rgba(200,164,92,0.07)" strokeWidth="0.5" strokeDasharray="4 8" />
            </svg>
            {/* 中圈反向旋转 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 440" style={{ animation: 'taiji-spin 60s linear infinite reverse' }}>
              <circle cx="220" cy="220" r="165" fill="none" stroke="rgba(200,164,92,0.05)" strokeWidth="0.5" strokeDasharray="2 12" />
            </svg>
            {/* 太极主体 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 440" style={{ animation: 'taiji-spin 120s linear infinite', opacity: 0.05 }}>
              <path d="M220 10 A210 210 0 0 1 220 430 A105 105 0 0 1 220 220 A105 105 0 0 0 220 10" fill="var(--color-gold-400)" />
              <path d="M220 10 A210 210 0 0 0 220 430 A105 105 0 0 0 220 220 A105 105 0 0 1 220 10" fill="var(--color-ink-100)" />
              <circle cx="220" cy="115" r="24" fill="var(--color-ink-100)" />
              <circle cx="220" cy="325" r="24" fill="var(--color-gold-400)" />
            </svg>

            {/* 八卦方位文字 */}
            {[
              { char: '乾', pos: 'top-[5%] left-1/2 -translate-x-1/2', delay: '0s' },
              { char: '坤', pos: 'bottom-[5%] left-1/2 -translate-x-1/2', delay: '1.5s' },
              { char: '坎', pos: 'top-1/2 left-[3%] -translate-y-1/2', delay: '0.8s' },
              { char: '离', pos: 'top-1/2 right-[3%] -translate-y-1/2', delay: '2.2s' },
              { char: '巽', pos: 'top-[14%] right-[12%]', delay: '0.5s', opacity: 'opacity-[0.12]' },
              { char: '艮', pos: 'bottom-[14%] left-[12%]', delay: '1.8s', opacity: 'opacity-[0.12]' },
              { char: '震', pos: 'top-[14%] left-[12%]', delay: '3s', opacity: 'opacity-[0.12]' },
              { char: '兑', pos: 'bottom-[14%] right-[12%]', delay: '1.2s', opacity: 'opacity-[0.12]' },
            ].map(({ char, pos, delay, opacity }) => (
              <span
                key={char}
                className={`absolute font-serif text-[11px] tracking-[0.3em] text-gold-400 ${opacity || 'opacity-[0.15]'} ${pos}`}
                style={{ animation: `breathe 5s ease-in-out infinite ${delay}` }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Hero 内容 */}
        <div className="text-center px-6 relative z-10 max-w-3xl mx-auto">
          <div className="mb-5 animate-fade-in-up stagger-1">
            <span className="inline-block font-serif text-[11px] tracking-[0.5em] uppercase text-muted-foreground">
              AI BAZI NAMING SYSTEM
            </span>
          </div>
          <h1
            className="font-serif font-black tracking-[0.18em] glow-gold-strong mb-5 text-gold-200 leading-[1.05] animate-fade-in-up stagger-2"
            style={{ fontSize: 'clamp(72px, 14vw, 150px)' }}
          >
            天衍
          </h1>
          <div className="gold-line max-w-[80px] mx-auto mb-7 animate-fade-in-up stagger-3" />
          <p className="font-serif text-xl md:text-2xl mb-2 tracking-[0.15em] font-light text-foreground animate-fade-in-up stagger-3">
            天机衍万象，一名定乾坤
          </p>
          <p className="font-sans text-sm md:text-base max-w-md mx-auto mb-11 leading-relaxed text-muted-foreground animate-fade-in-up stagger-4">
            千年易学智慧 × 前沿AI算法<br />为生命择一良名，承天时、合五行、润一生
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 animate-fade-in-up stagger-5">
            <Link href="/name/input" className="btn-gold px-10 py-3.5 rounded-sm font-serif text-[13px] tracking-[0.2em]">
              开始起名
            </Link>
            <Link href="/test-name" className="btn-vermilion px-8 py-3.5 rounded-sm text-[13px] tracking-[0.15em] inline-flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />测名评分
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-14 animate-fade-in-up stagger-5">
            <span className="text-[11px] text-muted-foreground">
              <span className="font-serif font-bold text-sm mr-1 glow-score text-gold-400">128,600</span>已起名
            </span>
            <span className="text-gold-400/20">|</span>
            <span className="text-[11px] text-muted-foreground">
              <span className="font-serif font-bold text-sm mr-1 glow-score text-gold-400">98.7%</span>好评
            </span>
            <span className="text-gold-400/20">|</span>
            <span className="text-[11px] text-muted-foreground">
              <span className="font-serif font-bold text-sm mr-1 glow-score text-gold-400">36</span>命理师
            </span>
          </div>
        </div>

        {/* Scroll 指示器 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-25" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <span className="text-[10px] tracking-widest text-muted-foreground">SCROLL</span>
          <ChevronDown className="w-2.5 h-2.5 text-gold-400" />
        </div>
      </header>

      {/* ═══ 理念区 ═══ */}
      <section id="philosophy" className="relative py-24 md:py-32 px-6 z-[1]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="inline-block font-serif text-[11px] tracking-[0.35em] mb-4 text-gold-600">PHILOSOPHY</span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold tracking-wider mb-4 text-foreground">千年易学，智启新章</h2>
            <p className="text-sm max-w-lg mx-auto text-muted-foreground leading-[1.8]">
              不是对传统的复刻，而是用科技延续命理的根脉——<br />让每一个名字，都有据可依、有理可循
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* 卡1：易学根基 */}
            <div className="card rounded-sm p-8 text-center reveal">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center bg-vermilion/10 border border-vermilion/20">
                <Flame className="w-5 h-5 text-vermilion" />
              </div>
              <h3 className="font-serif text-lg font-semibold tracking-wider mb-3 text-gold-200">千年易学根基</h3>
              <p className="text-[13px] leading-[1.85] text-muted-foreground">
                四柱八字、天干地支、阴阳五行、三才五格——千年命理体系一脉相承，非玄学臆测，乃数理推演
              </p>
              <div className="gold-line mt-6 mb-4" />
              <div className="flex justify-center gap-2">
                {['甲', '乙', '丙', '丁'].map((ch) => (
                  <span key={ch} className="bazi-tag w-[34px] h-[34px] text-xs font-serif font-medium text-gold-200">{ch}</span>
                ))}
              </div>
            </div>

            {/* 卡2：AI推衍 (取景框+脉冲+扫描线) */}
            <div
              className="card rounded-sm p-8 text-center reveal reveal-delay-1 tech-corners pulse-card tech-scan relative"
              style={{
                borderColor: 'rgba(200,164,92,0.25)',
                background: 'linear-gradient(160deg,rgba(200,164,92,0.09) 0%,rgba(200,164,92,0.01) 100%)',
              }}
            >
              <span className="corner corner-tl" />
              <span className="corner corner-tr" />
              <span className="corner corner-bl" />
              <span className="corner corner-br" />
              <div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center bg-gold-400/12 border border-gold-400/30">
                <Cpu className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-serif text-lg font-semibold tracking-wider mb-3 text-gold-200">AI 深度推衍</h3>
              <p className="text-[13px] leading-[1.85] text-muted-foreground">
                亿级古典语料训练的深度学习引擎，毫秒间完成万次五行生克推演，精准匹配命理与名理
              </p>
              <div className="gold-line mt-6 mb-4" />
              {/* 数据流闪烁节点 */}
              <div className="flex justify-center gap-2 items-center h-[34px]">
                <span className="bazi-tag w-[34px] h-[34px] text-xs font-serif font-medium text-gold-200">子</span>
                <div className="flex gap-1.5 items-center mx-3">
                  {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gold-400"
                      style={{ animation: `data-dot 1.2s ease-in-out infinite ${delay}s` }}
                    />
                  ))}
                </div>
                <span className="bazi-tag w-[34px] h-[34px] text-xs font-serif font-medium text-gold-200">卯</span>
              </div>
            </div>

            {/* 卡3：专属定制 */}
            <div className="card rounded-sm p-8 text-center reveal reveal-delay-2">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center bg-wuxing-mu/10 border border-wuxing-mu/20">
                <Leaf className="w-5 h-5 text-wuxing-mu" />
              </div>
              <h3 className="font-serif text-lg font-semibold tracking-wider mb-3 text-gold-200">量体裁衣定制</h3>
              <p className="text-[13px] leading-[1.85] text-muted-foreground">
                每名皆经八字排盘、五行喜忌、三才五格、音韵字义层层严选，绝非模板套用，而是专属推演
              </p>
              <div className="gold-line mt-6 mb-4" />
              <div className="flex justify-center gap-2">
                {['金', '木', '水', '火'].map((wx, i) => (
                  <span key={wx + "-" + i} className="bazi-tag w-[34px] h-[34px] text-xs font-serif font-medium text-gold-200">{wx}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 今日吉名区 ═══ */}
      <section id="jinming" className="relative py-24 md:py-32 px-6 z-[1]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal">
            <span className="inline-block font-serif text-[11px] tracking-[0.35em] mb-4 text-gold-600">DAILY NAMES</span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold tracking-wider mb-4 text-foreground">今日吉名</h2>
            <p className="text-sm text-muted-foreground">每日依天干地支流转，AI精选良名</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {dailyNames.map((p, i) => (
              <div key={i} className={`jinming-card rounded-sm p-6 reveal ${i > 0 ? `reveal-delay-${i}` : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[11px] tracking-wider text-muted-foreground">
                      今日干支 {p.todayGan}{p.todayZhi} · 补{p.wuxing}
                    </span>
                    <h3 className="font-serif text-[26px] font-bold tracking-wider mt-1 text-gold-200">
                      {p.full}
                    </h3>
                  </div>
                  <ScoreRing score={p.score} color={WX_COLORS[p.wuxing]} />
                </div>
                <p className="text-[13px] mb-2 font-serif text-foreground">{p.meaning}</p>
                <p className="text-[11px] mb-4 font-serif italic text-muted-foreground">——{p.source}</p>
                <div className="flex flex-wrap gap-2.5 text-[11px] text-muted-foreground">
                  {p.tags.map((t) => {
                    const isWxTag = ['补金', '补木', '补水', '补火', '补土', '助金', '助木', '助水', '助火', '助土'].includes(t);
                    const wxKey = t.replace(/[补助]/, '');
                    const color = isWxTag ? WX_COLORS[wxKey] || '#e8d09a' : '#81c784';
                    return (
                      <span key={t} className="inline-flex items-center gap-1">
                        <span style={{ color }}>{getWxTagIcon(wxKey, isWxTag)}</span>
                        {t}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 reveal">
            <p className="text-xs mb-4 text-muted-foreground">以上吉名依据今日天干地支与五行流转，由AI推衍精选。以上内容仅供传统文化参考，不构成人生决策依据</p>
            <Link href="/name/input" className="btn-gold px-9 py-3 rounded-sm font-serif text-[13px] tracking-[0.2em] inline-block">
              为您专属推演
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 推演流程区 ═══ */}
      <section id="process" className="relative py-24 md:py-32 px-6 z-[1]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="inline-block font-serif text-[11px] tracking-[0.35em] mb-4 text-gold-600">PROCESS</span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold tracking-wider mb-4 text-foreground">六道工序，层层严选</h2>
            <p className="text-sm text-muted-foreground">每一个名字，都经历从排盘到终审的完整推演</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
            {STEPS.map((step, i) => (
              <div key={step.num} className={`reveal ${i === 1 || i === 4 ? 'reveal-delay-1' : ''} ${i === 2 || i === 5 ? 'reveal-delay-2' : ''} flex gap-4`}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-bold shrink-0 ${
                      step.pulse
                        ? 'text-gold-200'
                        : 'text-gold-400'
                    }`}
                    style={
                      step.pulse
                        ? {
                            background: 'linear-gradient(135deg,rgba(200,164,92,0.28),rgba(200,164,92,0.1))',
                            border: '1px solid rgba(200,164,92,0.45)',
                            animation: 'node-pulse 2s ease-in-out infinite',
                          }
                        : {
                            background: 'linear-gradient(135deg,rgba(200,164,92,0.18),rgba(200,164,92,0.05))',
                            border: '1px solid rgba(200,164,92,0.25)',
                          }
                    }
                  >
                    {step.num}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="gold-line-v flex-1 mt-2 hidden md:block" />
                  )}
                </div>
                <div>
                  <h4 className="font-serif text-[15px] font-semibold tracking-wider mb-1.5 text-gold-200">{step.title}</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 案例展示区 ═══ */}
      <section id="cases" className="relative py-24 md:py-32 px-6 z-[1]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="inline-block font-serif text-[11px] tracking-[0.35em] mb-4 text-gold-600">CASES</span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold tracking-wider mb-4 text-foreground">名之所至</h2>
            <p className="text-sm text-muted-foreground">每一个名字背后，都是一场精心推演</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CASES.map((c, i) => (
              <div key={i} className={`jinming-card rounded-sm p-7 reveal ${i % 2 === 1 ? 'reveal-delay-1' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[11px] tracking-wider text-muted-foreground">
                      {c.gender} · {c.birthYear} · {c.wuxingDesc}
                    </span>
                    <h3 className="font-serif text-[28px] font-bold tracking-wider mt-1 text-gold-200">{c.name}</h3>
                  </div>
                  <ScoreRing score={c.score} />
                </div>
                <p className="text-[13px] mb-4 font-serif leading-[1.9] text-foreground">{c.desc}</p>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  {c.tags.map((tag, j) => (
                    <span key={j} className={`inline-flex items-center gap-1 ${tag.color}`}>
                      {tag.icon}{tag.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-8 reveal">以上内容仅供传统文化参考，不构成人生决策依据</p>
        </div>
      </section>

      {/* ═══ 用户口碑区 ═══ */}
      <section id="reviews" className="relative py-24 md:py-32 px-6 z-[1]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="inline-block font-serif text-[11px] tracking-[0.35em] mb-4 text-gold-600">TESTIMONIALS</span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold tracking-wider mb-4 text-foreground">名传有据</h2>
            <p className="text-sm text-muted-foreground">来自真实用户的声音</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {REVIEWS.map((r, i) => (
              <div key={i} className={`review-card rounded-sm p-7 reveal ${i % 2 === 1 ? 'reveal-delay-1' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm font-bold ${r.surnameBg} ${r.surnameColor}`}>
                    {r.surname}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground">{r.time}</div>
                  </div>
                  <StarRating count={r.stars} half={r.halfStar} />
                </div>
                <p className="text-[13px] leading-[1.85] font-serif text-foreground">{r.text}</p>
              </div>
            ))}
          </div>

          {/* 统计数字 */}
          <div ref={counterSectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 reveal">
            {COUNTER_DATA.map((c, i) => (
              <div
                key={i}
                className="text-center py-6 rounded-sm bg-gold-400/[0.03] border border-gold-400/[0.08]"
              >
                <div
                  id={`counter-${i}`}
                  className="font-serif text-2xl md:text-3xl font-bold mb-1 glow-score text-gold-200"
                >
                  0
                </div>
                <div className="text-[11px] tracking-wider text-muted-foreground">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 底部双CTA ═══ */}
      <section className="relative py-24 md:py-32 px-6 z-[1]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wider mb-4 text-foreground">
              赐子千金，不如赐子良名
            </h2>
            <p className="text-sm text-muted-foreground">让千年易学与AI，为您的孩子择一承载天时之良名</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 reveal">
            {/* 起名 CTA */}
            <div className="jinming-card rounded-sm p-8 md:p-10 text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center bg-gold-400/12 border border-gold-400/25">
                <PenTool className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-serif text-xl font-bold tracking-wider mb-2 text-gold-200">AI 八字起名</h3>
              <p className="text-[13px] mb-6 leading-relaxed text-muted-foreground">
                输入生辰信息，AI即刻为您推演良名<br />五行补益 · 三才五格 · 诗词出处
              </p>
              <Link href="/name/input" className="btn-gold w-full py-3.5 rounded-sm font-serif text-[13px] tracking-[0.2em] inline-block text-center">
                立即起名
              </Link>
            </div>

            {/* 测名 CTA */}
            <div
              className="rounded-sm p-8 md:p-10 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(155deg,rgba(196,86,74,0.06) 0%,rgba(196,86,74,0.01) 100%)',
                border: '1px solid rgba(196,86,74,0.15)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg,transparent,var(--color-vermilion),transparent)' }} />
              <div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center bg-vermilion/10 border border-vermilion/20">
                <Search className="w-5 h-5 text-vermilion" />
              </div>
              <h3 className="font-serif text-xl font-bold tracking-wider mb-2 glow-vermilion text-vermilion-light">姓名评分</h3>
              <p className="text-[13px] mb-6 leading-relaxed text-muted-foreground">
                已有名字？输入姓名与生辰，即刻测评<br />五行匹配 · 音韵分析 · 重名风险
              </p>
              <Link href="/test-name" className="btn-vermilion w-full py-3.5 rounded-sm text-[13px] tracking-[0.2em] inline-block text-center">
                立即测名
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative py-14 px-6 z-[1]">
        <div className="max-w-6xl mx-auto">
          <div className="gold-line mb-10" />
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* 品牌 */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <svg width="22" height="22" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(200,164,92,0.3)" strokeWidth="1.5" />
                  <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2" fill="rgba(200,164,92,0.55)" />
                  <path d="M50 2 A48 48 0 0 0 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2" fill="rgba(232,224,212,0.12)" />
                </svg>
                <span className="font-serif font-bold tracking-[0.2em] text-sm text-gold-200">天衍</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                天机衍万象，一名定乾坤。<br />千年易学智慧 × 前沿AI算法
              </p>
            </div>

            {/* 服务 */}
            <div>
              <h4 className="font-serif text-[12px] tracking-wider mb-3 text-gold-400">服务</h4>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li><Link href="/name/input" className="hover:text-gold-300 transition-colors">八字起名</Link></li>
                <li><Link href="#" className="hover:text-gold-300 transition-colors">公司起名</Link></li>
                <li><Link href="#" className="hover:text-gold-300 transition-colors">改名咨询</Link></li>
                <li><Link href="/test-name" className="hover:text-gold-300 transition-colors">姓名测评</Link></li>
              </ul>
            </div>

            {/* 了解 */}
            <div>
              <h4 className="font-serif text-[12px] tracking-wider mb-3 text-gold-400">了解</h4>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li><button onClick={() => scrollTo('philosophy')} className="hover:text-gold-300 transition-colors">理念</button></li>
                <li><button onClick={() => scrollTo('process')} className="hover:text-gold-300 transition-colors">推演流程</button></li>
                <li><button onClick={() => scrollTo('cases')} className="hover:text-gold-300 transition-colors">案例</button></li>
                <li><Link href="#" className="hover:text-gold-300 transition-colors">命理顾问</Link></li>
              </ul>
            </div>

            {/* 联系 */}
            <div>
              <h4 className="font-serif text-[12px] tracking-wider mb-3 text-gold-400">联系</h4>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="inline-flex items-center gap-1.5"><Mail className="w-2.5 h-2.5" />hello@tianyan.ai</li>
                <li className="inline-flex items-center gap-1.5"><Phone className="w-2.5 h-2.5" />400-888-6688</li>
                <li className="inline-flex items-center gap-1.5">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  天衍AI起名
                </li>
              </ul>
            </div>
          </div>

          <div className="gold-line mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span>2025 天衍科技 · 传统文化与现代科技的交汇</span>
            <span>以上内容仅供传统文化参考，不构成人生决策依据</span>
          </div>
        </div>
      </footer>

      {/* ═══ CSS 动画关键帧 (非 globals.css 已定义的) ═══ */}
      <style jsx global>{`
        @keyframes taiji-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes astrolabe-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes astrolabe-breathe {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.14; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.04); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes data-dot {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes node-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,164,92,0.35); }
          50% { box-shadow: 0 0 0 10px rgba(200,164,92,0); }
        }
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(200,164,92,0.22); box-shadow: 0 0 0 rgba(200,164,92,0); }
          50% { border-color: rgba(200,164,92,0.55); box-shadow: 0 0 20px rgba(200,164,92,0.06); }
        }
        @keyframes scan-line {
          0% { top: -2px; opacity: 0; }
          8% { opacity: 0.8; }
          92% { opacity: 0.8; }
          100% { top: calc(100% + 2px); opacity: 0; }
        }

        /* Reveal 滚动揭示 */
        .reveal {
          opacity: 0;
          transform: translateY(36px);
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }

        /* AI 取景框角标 */
        .tech-corners .corner {
          position: absolute;
          width: 18px;
          height: 18px;
          pointer-events: none;
          z-index: 2;
        }
        .tech-corners .corner-tl { top: 8px; left: 8px; border-top: 2px solid rgba(200,164,92,0.5); border-left: 2px solid rgba(200,164,92,0.5); }
        .tech-corners .corner-tr { top: 8px; right: 8px; border-top: 2px solid rgba(200,164,92,0.5); border-right: 2px solid rgba(200,164,92,0.5); }
        .tech-corners .corner-bl { bottom: 8px; left: 8px; border-bottom: 2px solid rgba(200,164,92,0.5); border-left: 2px solid rgba(200,164,92,0.5); }
        .tech-corners .corner-br { bottom: 8px; right: 8px; border-bottom: 2px solid rgba(200,164,92,0.5); border-right: 2px solid rgba(200,164,92,0.5); }

        /* 脉冲边框 */
        .pulse-card { animation: pulse-border 2.5s ease-in-out infinite; }

        /* 扫描线 */
        .tech-scan::after {
          content: '';
          position: absolute;
          left: 12px;
          right: 12px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.6), rgba(200,164,92,0.6), transparent);
          animation: scan-line 3.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }

        /* 评价卡片 */
        .review-card {
          background: linear-gradient(160deg, rgba(200,164,92,0.05), rgba(200,164,92,0.01));
          border: 1px solid rgba(200,164,92,0.1);
          position: relative;
        }
        .review-card::before {
          content: '\\201C';
          position: absolute;
          top: 12px;
          left: 16px;
          font-family: 'Noto Serif SC', serif;
          font-size: 48px;
          line-height: 1;
          color: rgba(200,164,92,0.08);
          pointer-events: none;
        }

        /* 通用卡片 */
        .card {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          border: 1px solid rgba(200,164,92,0.12);
          background: rgba(200,164,92,0.03);
        }
        .card:hover {
          border-color: rgba(200,164,92,0.28);
          background: rgba(200,164,92,0.06);
          transform: translateY(-3px);
          box-shadow: 0 24px 64px rgba(200,164,92,0.05);
        }

        /* 干支标签 */
        .bazi-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(200,164,92,0.18);
          background: rgba(200,164,92,0.04);
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s;
        }
        .bazi-tag:hover {
          border-color: var(--color-gold-400);
          background: rgba(200,164,92,0.1);
        }

        /* 导航链接 */
        .nav-link {
          position: relative;
          transition: color 0.3s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--color-gold-400);
          transition: width 0.3s;
        }
        .nav-link:hover::after {
          width: 100%;
        }

        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
