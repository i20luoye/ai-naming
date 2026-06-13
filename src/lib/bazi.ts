/**
 * 八字排盘核心计算库
 * 基于子平术规则引擎，计算四柱八字、五行分布、喜用神
 */

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

// ===== 日主强弱判定 =====

type WuxingCount = Record<string, number>;

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

function getDayMasterStrength(dayGan: string, wuxingCount: WuxingCount): '旺' | '弱' {
  const dayWx = TIAN_GAN_WUXING[dayGan];
  const shengWx = WUXING_BEI_SHENG[dayWx]; // 生日主的五行
  const sameWx = dayWx; // 同类五行

  const helperCount = wuxingCount[sameWx] + wuxingCount[shengWx];
  const total = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
  const ratio = helperCount / total;

  return ratio >= 0.45 ? '旺' : '弱';
}

// ===== 喜用神推断 =====

function deriveXiYong(dayGan: string, strength: '旺' | '弱'): { xiYong: string[]; jiShen: string[] } {
  const dayWx = TIAN_GAN_WUXING[dayGan];

  if (strength === '弱') {
    // 日主弱：喜生（印星）、喜同类（比劫）
    return {
      xiYong: [WUXING_BEI_SHENG[dayWx], dayWx],
      jiShen: [WUXING_KE[dayWx], WUXING_SHENG[dayWx]],
    };
  } else {
    // 日主旺：喜克（官杀）、喜泄（食伤）、喜耗（财星）
    return {
      xiYong: [WUXING_KE[dayWx], WUXING_SHENG[dayWx]],
      jiShen: [dayWx, WUXING_BEI_SHENG[dayWx]],
    };
  }
}

// ===== 格局判定（简化版） =====

function determinePattern(dayGan: string, monthZhi: string): string {
  const monthGan = getMonthGanForZhi(dayGan, monthZhi);
  const monthWx = TIAN_GAN_WUXING[monthGan];
  const dayWx = TIAN_GAN_WUXING[dayGan];

  // 简化：根据月令天干与日主关系判定十神格
  if (WUXING_SHENG[dayWx] === monthWx) return '食神格';
  if (WUXING_KE[dayWx] === monthWx) return '正官格';
  if (WUXING_BEI_KE[dayWx] === monthWx) return '七杀格';
  if (WUXING_SHENG[monthWx] === dayWx) return '正印格';
  if (monthWx === dayWx) return '比肩格';
  if (WUXING_BEI_SHENG[monthWx] === dayWx) return '偏财格';
  return '正财格';
}

function getMonthGanForZhi(dayGan: string, monthZhi: string): string {
  const zhiIdx = DI_ZHI.indexOf(monthZhi as typeof DI_ZHI[number]);
  const dayIdx = TIAN_GAN.indexOf(dayGan as typeof TIAN_GAN[number]);
  // 年上起月法简化
  const base = (dayIdx % 5) * 2;
  const ganIdx = (base + zhiIdx) % 10;
  return TIAN_GAN[ganIdx];
}

// ===== 核心排盘计算 =====

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
  strength: '旺' | '弱';
  xiYong: string[];
  jiShen: string[];
  pattern: string;
}

function getYearGanZhi(year: number): [string, string] {
  // 以立春为界简化：直接用年份计算
  const ganIdx = (year - 4) % 10;
  const zhiIdx = (year - 4) % 12;
  return [TIAN_GAN[ganIdx >= 0 ? ganIdx : ganIdx + 10], DI_ZHI[zhiIdx >= 0 ? zhiIdx : zhiIdx + 12]];
}

function getMonthGanZhi(year: number, month: number): [string, string] {
  // 月支固定：寅月=1月(农历)，简化用公历近似
  const zhiIdx = (month + 1) % 12; // 简化映射
  const zhi = DI_ZHI[zhiIdx];

  // 年上起月法
  const yearGanIdx = (year - 4) % 10;
  const base = Math.floor(yearGanIdx / 2) * 2 + 2;
  const ganIdx = (base + zhiIdx) % 10;
  const gan = TIAN_GAN[ganIdx >= 0 ? ganIdx : ganIdx + 10];

  return [gan, zhi];
}

function getDayGanZhi(year: number, month: number, day: number): [string, string] {
  // 简化日柱计算：基于基准日推算
  const baseDate = new Date(2000, 0, 1); // 2000年1月1日 = 庚辰年丙子月甲子日 (简化)
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 2000-01-01 简化为甲子日
  const ganIdx = ((diffDays % 10) + 10) % 10;
  const zhiIdx = ((diffDays % 12) + 12) % 12;

  return [TIAN_GAN[ganIdx], DI_ZHI[zhiIdx]];
}

function getHourGanZhi(dayGan: string, hour: number): [string, string] {
  // 时支：23-1子, 1-3丑, ...
  const zhiIdx = Math.floor(((hour + 1) % 24) / 2);
  const zhi = DI_ZHI[zhiIdx];

  // 日上起时法
  const dayGanIdx = TIAN_GAN.indexOf(dayGan as typeof TIAN_GAN[number]);
  const base = (dayGanIdx % 5) * 2;
  const ganIdx = (base + zhiIdx) % 10;

  return [TIAN_GAN[ganIdx], zhi];
}

export function calculateBazi(
  birthDate: string,
  birthTime: string,
): BaziResult {
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  const hour = parseInt(birthTime.split(':')[0]);

  // 四柱计算
  const [yearGan, yearZhi] = getYearGanZhi(year);
  const [monthGan, monthZhi] = getMonthGanZhi(year, month);
  const [dayGan, dayZhi] = getDayGanZhi(year, month, day);
  const [hourGan, hourZhi] = getHourGanZhi(dayGan, hour);

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

  // 日主强弱
  const strength = getDayMasterStrength(dayGan, wuxingCount);

  // 喜用神
  const { xiYong, jiShen } = deriveXiYong(dayGan, strength);

  // 格局
  const pattern = determinePattern(dayGan, monthZhi);

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
