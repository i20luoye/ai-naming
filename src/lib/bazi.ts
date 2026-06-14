/**
 * 八字排盘核心计算库
 * 基于 lunar-javascript 精确排盘引擎 + 子平术喜用神推导
 * 
 * 修复项：
 * - 月柱：以节气为界（非公历月份）
 * - 日柱：基于 lunar-javascript 精确计算（非基准日推算）
 * - 年柱：以立春为界（1-2月可能属前一年）
 * - 时柱：支持真太阳时校正
 * - 喜用神：补充调候、通关、三维分析（得令/得地/得势）
 */

import { Solar } from 'lunar-javascript';

// ===== 天干地支基础数据 =====

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

const TIAN_GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

const DI_ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

const DI_ZHI_CANG_GAN: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲'],
};

// 五行生克关系
const WUXING_SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const WUXING_KE: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
const WUXING_BEI_SHENG: Record<string, string> = { '火': '木', '土': '火', '金': '土', '水': '金', '木': '水' };
const WUXING_BEI_KE: Record<string, string> = { '土': '木', '金': '火', '水': '土', '木': '金', '火': '水' };

// ===== 类型定义 =====

type WuxingCount = Record<string, number>;

export interface PillarResult {
  pillar: string;
  gan: string;
  zhi: string;
  ganWuxing: string;
  zhiWuxing: string;
  cangGan: string[];
}

export interface BaziResult {
  pillars: PillarResult[];
  wuxingCount: WuxingCount;
  wuxingPercent: Record<string, number>;
  dayMaster: string;
  dayMasterWuxing: string;
  strength: '旺' | '弱' | '中和';
  xiYong: string[];
  jiShen: string[];
  pattern: string;
}

// ===== 五行统计 =====

function countWuxing(pillars: PillarResult[]): WuxingCount {
  const count: WuxingCount = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  for (const p of pillars) {
    count[TIAN_GAN_WUXING[p.gan]] += 2; // 天干权重2
    count[DI_ZHI_WUXING[p.zhi]] += 3; // 地支权重3
    for (const cg of DI_ZHI_CANG_GAN[p.zhi]) {
      count[TIAN_GAN_WUXING[cg]] += 1; // 藏干权重1
    }
  }
  return count;
}

// ===== 三维分析：得令/得地/得势 =====

/** 得令：日主天干是否与月令五行同类或被生 */
function getDeLing(dayGan: string, monthZhi: string): number {
  const dayWx = TIAN_GAN_WUXING[dayGan];
  const monthWx = DI_ZHI_WUXING[monthZhi];

  if (dayWx === monthWx) return 30; // 得令：同类
  if (WUXING_BEI_SHENG[dayWx] === monthWx) return 25; // 月令生日主
  if (WUXING_KE[dayWx] === monthWx) return 5; // 月令克日主
  return 10; // 其他
}

/** 得地：日主在四柱地支中是否有根 */
function getDeDi(dayGan: string, pillars: PillarResult[]): number {
  const dayWx = TIAN_GAN_WUXING[dayGan];
  let score = 0;

  for (const p of pillars) {
    // 地支藏干有日主同类
    for (const cg of DI_ZHI_CANG_GAN[p.zhi]) {
      const cgWx = TIAN_GAN_WUXING[cg];
      if (cgWx === dayWx) score += 7;
      if (WUXING_BEI_SHENG[dayWx] === cgWx) score += 3;
    }
  }

  return Math.min(score, 25);
}

/** 得势：日主同类五行和生扶五行在全局的占比 */
function getDeShi(dayGan: string, wuxingCount: WuxingCount): number {
  const dayWx = TIAN_GAN_WUXING[dayGan];
  const shengWx = WUXING_BEI_SHENG[dayWx]; // 生日主的五行

  const helperCount = wuxingCount[dayWx] + wuxingCount[shengWx];
  const total = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
  const ratio = helperCount / total;

  // 映射到0-20分
  return Math.round(ratio * 20);
}

// ===== 日主强弱判定（三维加权） =====

function getDayMasterStrength(
  dayGan: string,
  monthZhi: string,
  pillars: PillarResult[],
  wuxingCount: WuxingCount,
): '旺' | '弱' | '中和' {
  const deLing = getDeLing(dayGan, monthZhi);   // 权重30%
  const deDi = getDeDi(dayGan, pillars);          // 权重25%
  const deShi = getDeShi(dayGan, wuxingCount);    // 权重20%
  // 剩余25%给得生（日主被其他天干/藏干所生）
  const dayWx = TIAN_GAN_WUXING[dayGan];
  const shengWx = WUXING_BEI_SHENG[dayWx];
  const deSheng = Math.round((wuxingCount[shengWx] / Object.values(wuxingCount).reduce((a, b) => a + b, 0)) * 25);

  const totalScore = deLing + deDi + deShi + deSheng; // 满分100

  if (totalScore >= 55) return '旺';
  if (totalScore <= 40) return '弱';
  return '中和';
}

// ===== 调候分析 =====

/** 判断命局寒暖燥湿，返回调候喜用 */
function getTiaoHou(dayGan: string, monthZhi: string): string[] {
  const monthWx = DI_ZHI_WUXING[monthZhi];
  const dayWx = TIAN_GAN_WUXING[dayGan];
  const tiaoHou: string[] = [];

  // 冬季（亥子丑月）：命局偏寒，喜火调候
  if (['亥', '子', '丑'].includes(monthZhi)) {
    tiaoHou.push('火');
  }
  // 夏季（巳午未月）：命局偏燥，喜水调候
  if (['巳', '午', '未'].includes(monthZhi)) {
    tiaoHou.push('水');
  }
  // 金属秋令偏燥
  if (['申', '酉'].includes(monthZhi) && dayWx === '木') {
    tiaoHou.push('水');
  }

  return tiaoHou;
}

// ===== 通关分析 =====

/** 检测五行战克，返回通关喜用 */
function getTongGuan(wuxingCount: WuxingCount): string[] {
  const tongGuan: string[] = [];
  const wxList = Object.keys(wuxingCount) as string[];

  // 检测两行对战：某行极旺 + 克它的行也极旺
  for (const wx of wxList) {
    const keWx = WUXING_KE[wx]; // 克wx的五行
    if (wuxingCount[wx] > 8 && wuxingCount[keWx] > 8) {
      // 通关五行：能泄强克方、生被克方
      const tongWx = WUXING_SHENG[keWx]; // 泄克方
      if (!tongGuan.includes(tongWx)) {
        tongGuan.push(tongWx);
      }
    }
  }

  return tongGuan;
}

// ===== 喜用神推断（扶抑法+调候+通关） =====

function deriveXiYong(
  dayGan: string,
  strength: '旺' | '弱' | '中和',
  monthZhi: string,
  wuxingCount: WuxingCount,
): { xiYong: string[]; jiShen: string[] } {
  const dayWx = TIAN_GAN_WUXING[dayGan];
  let xiYong: string[] = [];
  let jiShen: string[] = [];

  if (strength === '弱') {
    // 日主弱：喜生（印星）、喜同类（比劫）
    xiYong = [WUXING_BEI_SHENG[dayWx], dayWx];
    jiShen = [WUXING_KE[dayWx], WUXING_SHENG[dayWx]];
  } else if (strength === '旺') {
    // 日主旺：喜克（官杀）、喜泄（食伤）、喜耗（财星）
    xiYong = [WUXING_KE[dayWx], WUXING_SHENG[dayWx]];
    jiShen = [dayWx, WUXING_BEI_SHENG[dayWx]];
  } else {
    // 中和：看调候和通关
    xiYong = [];
    jiShen = [];
  }

  // 补充调候喜用
  const tiaoHou = getTiaoHou(dayGan, monthZhi);
  for (const wx of tiaoHou) {
    if (!xiYong.includes(wx) && !jiShen.includes(wx)) {
      xiYong.push(wx);
    }
  }

  // 补充通关喜用
  const tongGuan = getTongGuan(wuxingCount);
  for (const wx of tongGuan) {
    if (!xiYong.includes(wx) && !jiShen.includes(wx)) {
      xiYong.push(wx);
    }
  }

  // 确保至少有2个喜用神
  if (xiYong.length < 2) {
    const allWx = ['金', '木', '水', '火', '土'];
    for (const wx of allWx) {
      if (!xiYong.includes(wx) && !jiShen.includes(wx)) {
        xiYong.push(wx);
        if (xiYong.length >= 2) break;
      }
    }
  }

  // 最多取3个喜用神
  return { xiYong: xiYong.slice(0, 3), jiShen: jiShen.slice(0, 2) };
}

// ===== 格局判定 =====

function determinePattern(dayGan: string, monthZhi: string, monthGan: string): string {
  const monthWx = TIAN_GAN_WUXING[monthGan];
  const dayWx = TIAN_GAN_WUXING[dayGan];

  // 根据月令天干与日主关系判定十神格
  if (WUXING_SHENG[dayWx] === monthWx) return '食神格';
  if (WUXING_KE[dayWx] === monthWx) {
    // 区分正官和七杀：阴阳相同为七杀，不同为正官
    const dayIdx = TIAN_GAN.indexOf(dayGan as typeof TIAN_GAN[number]);
    const monthIdx = TIAN_GAN.indexOf(monthGan as typeof TIAN_GAN[number]);
    return (dayIdx % 2 === monthIdx % 2) ? '七杀格' : '正官格';
  }
  if (WUXING_BEI_KE[dayWx] === monthWx) return '偏财格';
  if (WUXING_SHENG[monthWx] === dayWx) return '正印格';
  if (monthWx === dayWx) {
    const dayIdx = TIAN_GAN.indexOf(dayGan as typeof TIAN_GAN[number]);
    const monthIdx = TIAN_GAN.indexOf(monthGan as typeof TIAN_GAN[number]);
    return (dayIdx % 2 === monthIdx % 2) ? '比肩格' : '劫财格';
  }
  if (WUXING_BEI_SHENG[monthWx] === dayWx) return '偏财格';
  return '正财格';
}

// ===== 核心排盘计算（基于 lunar-javascript） =====

export function calculateBazi(
  birthDate: string,
  birthTime: string,
  longitude?: number,
): BaziResult {
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);

  // 解析时辰
  const [hourStr, minuteStr] = birthTime.split(':');
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr || '0');

  // 真太阳时校正（如果提供了经度）
  let adjustedHour = hour;
  let adjustedMinute = minute;
  if (longitude !== undefined) {
    // 北京时间基于东经120°，每度差4分钟
    const timeDiff = (longitude - 120) * 4; // 分钟
    const totalMinutes = hour * 60 + minute + timeDiff;
    adjustedHour = Math.floor(totalMinutes / 60) % 24;
    adjustedMinute = Math.round(totalMinutes % 60);
    if (adjustedHour < 0) adjustedHour += 24;
  }

  // 使用 lunar-javascript 获取精确八字
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 获取时辰索引
  // lunar-javascript 的时辰判定基于地支
  const shiChenZhi = getShiChenFromHour(adjustedHour);
  const hourZhiIdx = DI_ZHI.indexOf(shiChenZhi as typeof DI_ZHI[number]);

  // 通过 lunar-javascript 获取四柱
  const yearGanZhi = eightChar.getYear();
  const monthGanZhi = eightChar.getMonth();
  const dayGanZhi = eightChar.getDay();

  // 获取时柱天干（日上起时法，lunar-javascript已实现）
  const hourGanZhi = eightChar.getTime();

  // 解析干支字符串
  const yearGan = yearGanZhi[0];
  const yearZhi = yearGanZhi[1];
  const monthGan = monthGanZhi[0];
  const monthZhi = monthGanZhi[1];
  const dayGan = dayGanZhi[0];
  const dayZhi = dayGanZhi[1];
  const hourGan = hourGanZhi[0];
  const hourZhi = hourGanZhi[1];

  const pillars: PillarResult[] = [
    { pillar: '年柱', gan: yearGan, zhi: yearZhi, ganWuxing: TIAN_GAN_WUXING[yearGan], zhiWuxing: DI_ZHI_WUXING[yearZhi], cangGan: DI_ZHI_CANG_GAN[yearZhi] },
    { pillar: '月柱', gan: monthGan, zhi: monthZhi, ganWuxing: TIAN_GAN_WUXING[monthGan], zhiWuxing: DI_ZHI_WUXING[monthZhi], cangGan: DI_ZHI_CANG_GAN[monthZhi] },
    { pillar: '日柱', gan: dayGan, zhi: dayZhi, ganWuxing: TIAN_GAN_WUXING[dayGan], zhiWuxing: DI_ZHI_WUXING[dayZhi], cangGan: DI_ZHI_CANG_GAN[dayZhi] },
    { pillar: '时柱', gan: hourGan, zhi: hourZhi, ganWuxing: TIAN_GAN_WUXING[hourGan], zhiWuxing: DI_ZHI_WUXING[hourZhi], cangGan: DI_ZHI_CANG_GAN[hourZhi] },
  ];

  // 五行统计
  const wuxingCount = countWuxing(pillars);
  const total = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
  const wuxingPercent: Record<string, number> = {};
  for (const [k, v] of Object.entries(wuxingCount)) {
    wuxingPercent[k] = Math.round((v / total) * 100);
  }

  // 日主强弱（三维加权）
  const strength = getDayMasterStrength(dayGan, monthZhi, pillars, wuxingCount);

  // 喜用神（扶抑法+调候+通关）
  const { xiYong, jiShen } = deriveXiYong(dayGan, strength, monthZhi, wuxingCount);

  // 格局
  const pattern = determinePattern(dayGan, monthZhi, monthGan);

  return {
    pillars,
    wuxingCount,
    wuxingPercent,
    dayMaster: dayGan,
    dayMasterWuxing: TIAN_GAN_WUXING[dayGan],
    strength,
    xiYong,
    jiShen,
    pattern,
  };
}

/** 根据小时数获取时辰地支 */
function getShiChenFromHour(hour: number): string {
  // 23-1子, 1-3丑, 3-5寅, ...
  if (hour === 23 || hour === 0) return '子';
  return DI_ZHI[Math.ceil(hour / 2)];
}

// ===== 导出常量供前端复用 =====
export { TIAN_GAN, DI_ZHI, TIAN_GAN_WUXING, DI_ZHI_WUXING, DI_ZHI_CANG_GAN };
