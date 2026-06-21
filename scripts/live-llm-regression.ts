import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { LIVE_LLM_REGRESSION_CASES, type LiveLlmRegressionCase } from '../src/lib/knowledge/fixtures/live-llm-cases';
import { checkLlmPreflight, type LlmPreflightResult } from '../src/lib/llm/preflight';

interface ApiName {
  name?: string;
  givenName?: string;
  poemSource?: string;
  knowledgeBacked?: boolean;
  validationWarnings?: string[];
  qualityScore?: number;
  qualityLevel?: string;
  riskLevel?: string;
}

interface CaseResult {
  id: string;
  surname: string;
  ok: boolean;
  fallback: boolean;
  error?: string;
  names: ApiName[];
  knowledgeBacked: boolean;
  validationWarnings: string[];
}

interface RegressionStats {
  caseCount: number;
  totalGeneratedNames: number;
  knowledgeBackedRate: number;
  warningRate: number;
  downgradeRate: number;
  rejectRate: number;
  averageQualityScore: number;
  fallbackRate: number;
  duplicateNameRate: number;
  forbiddenCharFailureRate: number;
  fabricatedSourceRisk: number;
  complianceViolationRate: number;
}

type RegressionStatus = 'COMPLETED' | 'BLOCKED_BY_CREDENTIALS';

interface RegressionPayload {
  generatedAt: string;
  model: string;
  baseUrl: string;
  status: RegressionStatus;
  stats: RegressionStats;
  results: CaseResult[];
  preflight?: LlmPreflightResult;
  notes?: string[];
}

const DEFAULT_BASE_URL = 'http://localhost:5000';
const MODEL_NAME = process.env.LLM_MODEL || 'agnes-2.0-flash';
const FORBIDDEN_COMPLIANCE_TERMS = ['算命', '改运', '预测', '命理', '逆天改命', '趋吉避凶'];

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const outputPath = options.output || join('docs', 'current', 'live-llm-regression-report.md');
  const preflight = checkLlmPreflight();

  if (!preflight.ok) {
    console.error('Live LLM regression blocked by missing SDK configuration:', {
      reason: preflight.reason,
      missingKeys: preflight.missingKeys,
    });
    writeBlockedCredentialsReport(outputPath, options.format, options.baseUrl, preflight);
    return;
  }

  const cases = LIVE_LLM_REGRESSION_CASES.slice(options.start, options.limit ? options.start + options.limit : undefined);
  const results: CaseResult[] = [];

  for (let index = 0; index < cases.length; index++) {
    const current = cases[index];
    const result = await runCase(current, options.baseUrl, index);
    results.push(result);
    console.log(`[${index + 1}/${cases.length}] ${current.id} ${result.ok ? 'ok' : 'failed'} names=${result.names.length}`);
    if (options.delayMs > 0 && index < cases.length - 1) {
      await sleep(options.delayMs);
    }
  }

  const stats = calculateStats(results, cases);
  const payload = {
    generatedAt: new Date().toISOString(),
    model: MODEL_NAME,
    baseUrl: options.baseUrl,
    status: 'COMPLETED' as const,
    stats,
    results,
  };

  writeRegressionReport(outputPath, options.format, payload);
}

async function runCase(testCase: LiveLlmRegressionCase, baseUrl: string, index: number): Promise<CaseResult> {
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate-names`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `127.77.0.${(index % 240) + 1}`,
      },
      body: JSON.stringify({
        surname: testCase.surname,
        birthDate: testCase.birthDate,
        birthTime: testCase.birthTime,
        gender: testCase.gender,
        xiYong: testCase.xiYong,
        jiShen: testCase.jiShen,
        pattern: testCase.pattern,
        preferences: testCase.preferences,
      }),
    });

    if (!response.ok) {
      return {
        id: testCase.id,
        surname: testCase.surname,
        ok: false,
        fallback: true,
        error: `HTTP ${response.status}`,
        names: [],
        knowledgeBacked: false,
        validationWarnings: [`API request failed: HTTP ${response.status}`],
      };
    }

    const payload = await response.json() as {
      success?: boolean;
      knowledgeBacked?: boolean;
      validationWarnings?: string[];
      data?: { names?: ApiName[]; knowledgeBacked?: boolean; validationWarnings?: string[] };
      error?: string;
    };
    const names = payload.data?.names || [];
    const knowledgeBacked = Boolean(payload.knowledgeBacked ?? payload.data?.knowledgeBacked);
    const validationWarnings = payload.validationWarnings || payload.data?.validationWarnings || [];

    return {
      id: testCase.id,
      surname: testCase.surname,
      ok: Boolean(payload.success),
      fallback: !payload.success || names.length === 0,
      error: payload.success ? undefined : payload.error || 'API returned success=false',
      names,
      knowledgeBacked,
      validationWarnings,
    };
  } catch (error) {
    return {
      id: testCase.id,
      surname: testCase.surname,
      ok: false,
      fallback: true,
      error: error instanceof Error ? error.message : String(error),
      names: [],
      knowledgeBacked: false,
      validationWarnings: ['API request failed before response'],
    };
  }
}

function calculateStats(results: CaseResult[], cases: LiveLlmRegressionCase[]): RegressionStats {
  const allNames = results.flatMap((result) => result.names.map((name) => ({ result, name })));
  const totalGeneratedNames = allNames.length;
  const warnings = allNames.filter(({ name }) => (name.validationWarnings || []).length > 0);
  const downgrades = allNames.filter(({ name }) => name.qualityLevel === '降级' || (name.validationWarnings || []).some((warning) => warning.includes('候选字池外')));
  const rejects = results.flatMap((result) => result.validationWarnings).filter((warning) => warning.includes('不在给定出处池') || warning.includes('合规禁词') || warning.includes('结构不完整'));
  const qualityScores = allNames.map(({ name }) => name.qualityScore).filter((score): score is number => typeof score === 'number');
  const fullNames = allNames.map(({ result, name }) => `${result.surname}${name.name || name.givenName || ''}`);
  const duplicateCount = fullNames.length - new Set(fullNames).size;
  const forbiddenFailures = allNames.filter(({ result, name }) => {
    const testCase = cases.find((item) => item.id === result.id);
    const forbidden = new Set((testCase?.preferences.excludeChars || '').split(/[\s,，、/]+/).filter(Boolean));
    return Array.from(name.name || name.givenName || '').some((char) => forbidden.has(char));
  });
  const fabricatedSources = allNames.filter(({ name }) => (name.validationWarnings || []).some((warning) => warning.includes('出处不在给定出处池')));
  const complianceViolations = allNames.filter(({ name }) => {
    const text = [name.name, name.givenName, name.poemSource, ...(name.validationWarnings || [])].filter(Boolean).join(' ');
    return FORBIDDEN_COMPLIANCE_TERMS.some((term) => text.includes(term));
  });

  return {
    caseCount: results.length,
    totalGeneratedNames,
    knowledgeBackedRate: ratio(results.filter((result) => result.knowledgeBacked).length, results.length),
    warningRate: ratio(warnings.length, totalGeneratedNames),
    downgradeRate: ratio(downgrades.length, totalGeneratedNames),
    rejectRate: ratio(rejects.length, totalGeneratedNames || results.length),
    averageQualityScore: qualityScores.length ? round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length) : 0,
    fallbackRate: ratio(results.filter((result) => result.fallback).length, results.length),
    duplicateNameRate: ratio(duplicateCount, totalGeneratedNames),
    forbiddenCharFailureRate: ratio(forbiddenFailures.length, totalGeneratedNames),
    fabricatedSourceRisk: ratio(fabricatedSources.length, totalGeneratedNames),
    complianceViolationRate: ratio(complianceViolations.length, totalGeneratedNames),
  };
}

function writeBlockedCredentialsReport(
  outputPath: string,
  format: 'markdown' | 'json',
  baseUrl: string,
  preflight: LlmPreflightResult,
) {
  const payload: RegressionPayload = {
    generatedAt: new Date().toISOString(),
    model: MODEL_NAME,
    baseUrl,
    status: 'BLOCKED_BY_CREDENTIALS',
    stats: emptyStats(LIVE_LLM_REGRESSION_CASES.length),
    results: [],
    preflight,
    notes: [
      '未执行全量真实 LLM 回归',
      '当前统计不可作为模型质量结论',
      '需要补齐凭证后重跑',
    ],
  };

  writeRegressionReport(outputPath, format, payload);
}

function writeRegressionReport(outputPath: string, format: 'markdown' | 'json', payload: RegressionPayload) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    format === 'json' ? `${JSON.stringify(payload, null, 2)}\n` : renderMarkdown(payload),
    'utf8',
  );
  console.log(`Wrote ${outputPath}`);
}

function emptyStats(caseCount: number): RegressionStats {
  return {
    caseCount,
    totalGeneratedNames: 0,
    knowledgeBackedRate: 0,
    warningRate: 0,
    downgradeRate: 0,
    rejectRate: 0,
    averageQualityScore: 0,
    fallbackRate: 0,
    duplicateNameRate: 0,
    forbiddenCharFailureRate: 0,
    fabricatedSourceRisk: 0,
    complianceViolationRate: 0,
  };
}

function renderMarkdown(payload: RegressionPayload) {
  const stats = payload.stats;
  const rows = payload.results.map((result) => {
    const names = result.names.map((name) => `${name.name || name.givenName || '未命名'}(${name.qualityScore ?? '-'} / ${name.qualityLevel || '-'} / ${name.riskLevel || '-'})`).join('; ') || '-';
    return `| ${result.id} | ${result.surname} | ${result.ok ? '是' : '否'} | ${result.knowledgeBacked ? '是' : '否'} | ${result.fallback ? '是' : '否'} | ${names} | ${(result.validationWarnings || []).join('<br>') || '-'} |`;
  }).join('\n');
  const credentialBlock = payload.status === 'BLOCKED_BY_CREDENTIALS'
    ? `\n## 阻断状态\n\n- 状态：BLOCKED_BY_CREDENTIALS\n- 未执行全量真实 LLM 回归。\n- 当前统计不可作为模型质量结论。\n- 需要补齐凭证后重跑。\n- 缺失配置：${payload.preflight?.missingKeys?.join(', ') || '未知'}\n`
    : '';

  return `# Live LLM Regression Report

## 测试概要

- 状态：${payload.status}
- 测试时间：${payload.generatedAt}
- 测试模型：${payload.model}
- API Base URL：${payload.baseUrl}
- 测试案例数量：${stats.caseCount}
- 总生成名字数量：${stats.totalGeneratedNames}
${credentialBlock}

## 通过标准

- knowledgeBacked ≥ 90%
- reject = 0
- 编造出处风险 = 0
- 避用字失败率 = 0
- fallback ≤ 10%
- 平均 qualityScore ≥ 80
- 人工可用率 ≥ 75%
- 重复名字率 ≤ 5%
- validationWarnings ≤ 45%

## 核心统计

| 指标 | 值 |
|---|---:|
| knowledgeBackedRate | ${stats.knowledgeBackedRate}% |
| warningRate | ${stats.warningRate}% |
| downgradeRate | ${stats.downgradeRate}% |
| rejectRate | ${stats.rejectRate}% |
| averageQualityScore | ${stats.averageQualityScore} |
| fallbackRate | ${stats.fallbackRate}% |
| duplicateNameRate | ${stats.duplicateNameRate}% |
| forbiddenCharFailureRate | ${stats.forbiddenCharFailureRate}% |
| fabricatedSourceRisk | ${stats.fabricatedSourceRisk}% |
| complianceViolationRate | ${stats.complianceViolationRate}% |

## 案例结果

| Case | 姓氏 | API 成功 | knowledgeBacked | fallback | names | validationWarnings |
|---|---|---:|---:|---:|---|---|
${rows}

## 人工抽样评价区域

| Case | 名字 | 好听度 | 文化感 | 可信度 | 独特性 | 易读易记 | 生僻风险 | 是否像 AI 编的 | 是否愿意收藏 | 是否愿意付费看完整报告 | 备注 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 待人工抽样 | - | - | - | - | - | - | - | - | - | - | live 批跑后填写 |

## 问题清单

- 若 fallbackRate > 10%，优先检查 API 可用性或 LLM 凭证。
- 若 fabricatedSourceRisk > 0，优先检查 validate 对 poemSource 的拦截。
- 若 forbiddenCharFailureRate > 0，优先检查避用字过滤。
- 若 warningRate > 45%，优先补充小规模高频出处卡。

## 是否建议进入 SEO / 付费前置阶段

需要结合真实批跑结果判断；若任一硬指标未达标，不建议进入 SEO / 付费前置阶段。
`;
}

function parseArgs(args: string[]) {
  const options = {
    baseUrl: process.env.LIVE_LLM_BASE_URL || DEFAULT_BASE_URL,
    limit: 0,
    start: 0,
    delayMs: Number(process.env.LIVE_LLM_DELAY_MS || 0),
    format: 'markdown' as 'markdown' | 'json',
    output: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--base-url' && next) options.baseUrl = next;
    if (arg === '--limit' && next) options.limit = Number(next);
    if (arg === '--start' && next) options.start = Number(next);
    if (arg === '--delay-ms' && next) options.delayMs = Number(next);
    if (arg === '--format' && (next === 'json' || next === 'markdown')) options.format = next;
    if (arg === '--output' && next) options.output = next;
  }

  return options;
}

function ratio(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return round((numerator / denominator) * 100);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
