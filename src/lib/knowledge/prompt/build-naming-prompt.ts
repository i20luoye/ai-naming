import type { NamingPromptContext } from '../schema';

export interface NamingPromptBuildResult {
  systemPrompt: string;
  userPrompt: string;
  context: NamingPromptContext;
}

export function buildNamingPrompt(context: NamingPromptContext): NamingPromptBuildResult {
  const candidateText = context.candidateChars
    .map((card) => `${card.char}(${card.wuxing})：${card.meaning}；风格=${card.styleTags.join('/')}`)
    .join('\n');
  // 向模型明确提供 quoteId、source、quote、usableChars，避免模型自由编写出处
  const quoteText = context.classicQuotes
    .map((quote) => `quoteId=${quote.id}｜source=${quote.source.title}｜quote=${quote.quote}｜可用字=${quote.usableChars.join('、')}｜说明=${quote.note}`)
    .join('\n');

  const systemPrompt = `你是「天衍」AI起名系统的传统文化命名顾问。

核心约束（必须严格遵守）：
1. 只能优先使用候选字池中的字生成名字；如果确需补充字，必须说明无法使用知识层完全覆盖。
2. 出处约束（最重要）：
   - 只能使用给定出处卡中已提供的出处，不允许编造诗词、篇名、作者或出处。
   - 每条名字必须输出 poemSourceId 字段，值为给定出处卡的 quoteId（如 shijing-qingyang）。
   - poemSource 必须与 poemSourceId 对应的出处卡 source.title 完全一致。
   - 如果没有合适出处，必须输出 poemSourceId: null，并标记 sourceStatus: "none"，此时 poemSource 留空。
   - 不要为了"每条名字都有出处"而编造出处；没有合适出处时果断使用 sourceStatus: "none"。
3. 只输出 JSON 数组，不输出 Markdown 或解释性前后缀。
4. 保持"传统文化参考""五行分析"等中性表达，不做命运预测，不暗示名字可以改变人生结果。

JSON 元素格式：
{
  "name": "名字（不含姓氏）",
  "wuxing": ["水", "木"],
  "score": 88,
  "sancai": "吉",
  "style": "清雅",
  "poem": "必须来自给定出处卡的原句或短句；sourceStatus 为 none 时留空",
  "poemSourceId": "给定出处卡的 quoteId，或 null",
  "poemSource": "必须等于 poemSourceId 对应出处卡的 source.title；poemSourceId 为 null 时留空",
  "sourceStatus": "verified 或 none",
  "wuxingAnalysis": "传统文化参考口径的简短说明"
}`;

  const userPrompt = `请为「${context.surname}」姓生成 5-8 个名字建议。

基本信息：
- 性别：${context.gender || '未指定'}
- 喜用方向：${context.xiYong.join('、') || '未指定'}
- 需避免方向：${context.jiShen.join('、') || '未指定'}
- 风格偏好：${context.preferences?.styles?.join('、') || '不限'}
- 出处偏好：${context.preferences?.poemSources?.join('、') || '不限'}
- 排除字：${formatExclude(context.preferences?.excludeChars)}

候选字池：
${candidateText || '（当前无可用候选字）'}

给定出处卡（poemSourceId 必须从这些 quoteId 中选取）：
${quoteText || '（当前无可用出处卡；此时所有名字使用 poemSourceId: null, sourceStatus: "none"）'}

合规规则：
${context.complianceRules.map((rule) => `- ${rule}`).join('\n')}

请优先使用候选字和给定出处生成名字。出处必须来自给定出处卡，不要编造。返回 JSON 数组。`;

  return { systemPrompt, userPrompt, context };
}

function formatExclude(value?: string[] | string): string {
  if (!value) return '无';
  if (Array.isArray(value)) return value.join('、') || '无';
  return value || '无';
}
