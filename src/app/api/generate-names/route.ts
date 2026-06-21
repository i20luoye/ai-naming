import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { filterComplianceDeep } from '@/lib/compliance';
import { parseGeneratedNamesContent, type GeneratedNameApiItem } from '@/lib/name-generation';
import { filterChars } from '@/lib/knowledge/retrieval/filter-chars';
import { searchClassics } from '@/lib/knowledge/retrieval/search-classics';
import { buildNamingPrompt } from '@/lib/knowledge/prompt/build-naming-prompt';
import { validateGeneratedNames } from '@/lib/knowledge/validation/validate-generated-names';
import { scoreGeneratedNames } from '@/lib/knowledge/scoring/score-generated-names';
import { checkLlmPreflight, getLlmModel } from '@/lib/llm/preflight';
import { invokeLlm } from '@/lib/llm/client';
import type { ClassicQuoteCard, HanziKnowledgeCard } from '@/lib/knowledge/schema';

const SYSTEM_PROMPT = `你是「天衍」AI起名系统的文化顾问，精通中国传统命名文化和八字五行理论。

你的职责是根据用户的八字喜用神信息和起名偏好，生成合适的名字建议。

## 核心规则

1. 名字必须基于喜用神方向选择用字，不是简单的"缺啥补啥"
2. 每个名字必须包含：名字、每个字的五行属性、综合评分(60-95)、三才评级(吉/中/凶)、风格标签、诗词出处
3. 名字用字需兼顾：五行补益、音韵和谐、寓意深远、避免生僻字
4. 诗词出处必须真实可查，不可编造

## 合规约束（必须遵守）

- 禁止使用任何"算命""改运""预测""命理"等措辞
- 使用"传统文化参考""五行分析"等中性表述
- 不做任何人生预测、运势判断
- 不暗示名字可以改变命运

## 输出格式

返回JSON数组，每个元素格式：
{
  "name": "名字（不含姓氏）",
  "wuxing": ["木", "火"],
  "score": 88,
  "sancai": "吉",
  "style": "温润",
  "poem": "泽及万世",
  "poemSource": "《庄子》",
  "wuxingAnalysis": "简短的五行补益说明"
}

生成5-8个名字。`;

/** 候选字池上限（从 30 提升到 45） */
const CANDIDATE_CHAR_LIMIT = 45;
/** 出处卡上限（从 10 提升到 16） */
const CLASSIC_QUOTE_LIMIT = 16;

/**
 * Vercel Serverless Function 最大执行时长（秒）
 * Fluid Compute 默认启用时 Hobby 可到 60s，设 45s 留余量
 * 确保 LLM 调用 + repair 重试在超时前完成
 */
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    // IP 限流
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip, { maxRequests: 10, windowMs: 60 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { surname, birthDate, birthTime, gender, xiYong, jiShen, pattern, preferences } = body;

    if (!surname || !birthDate || !birthTime || !xiYong) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      );
    }

    const preflight = checkLlmPreflight();
    if (!preflight.ok) {
      console.error('LLM preflight failed before /api/generate-names invocation:', {
        reason: preflight.reason,
        missingKeys: preflight.missingKeys,
      });
      return NextResponse.json(
        {
          success: false,
          code: 'LLM_CREDENTIALS_MISSING',
          error: 'AI 服务未配置，请稍后再试',
        },
        { status: 503 }
      );
    }

    const xiYongList = normalizeStringList(xiYong);
    const jiShenList = normalizeStringList(jiShen);
    const styleTags = normalizeStringList(preferences?.styles);
    const excludeChars = normalizeStringList(preferences?.excludeChars);
    const blockedRiskTags = ['negative', 'hard-to-read'];
    if (preferences?.avoidHotNames || preferences?.avoidHot) {
      blockedRiskTags.push('overused');
    }

    const candidateChars = filterChars({
      xiYong: xiYongList,
      gender,
      styleTags,
      excludeChars,
      blockedRiskTags,
      limit: CANDIDATE_CHAR_LIMIT,
    });
    const classicQuotes = searchClassics({
      sourcePreferences: normalizeStringList(preferences?.poemSources),
      styleTags,
      usableChars: candidateChars.map((card) => card.char),
      limit: CLASSIC_QUOTE_LIMIT,
    });
    const knowledgeBacked = candidateChars.length > 0;

    const prefStr = preferences
      ? `\n\n用户偏好：字数=${preferences.charCount || '双字'}，风格=${preferences.styles?.join('/') || '不限'}，诗词出处=${preferences.poemSources?.join('/') || '不限'}，排除字=${preferences.excludeChars || '无'}，避网红=${preferences.avoidHotNames || preferences.avoidHot ? '是' : '否'}，避谐音=${preferences.avoidHomophone ? '是' : '否'}`
      : '';

    const userMessage = `请为"${surname}"姓宝宝起名。

基本信息：
- 性别：${gender || '未指定'}
- 出生日期：${birthDate}
- 出生时间：${birthTime}
- 八字格局：${pattern || '未指定'}
- 喜用神：${xiYongList.join('、')}
${prefStr}

请基于喜用神"${xiYongList.join('、')}"方向，生成5-8个名字建议。返回JSON数组，不要包含任何其他文字。`;

    const knowledgePrompt = knowledgeBacked
      ? buildNamingPrompt({
          surname,
          gender,
          xiYong: xiYongList,
          jiShen: jiShenList,
          preferences: {
            styles: styleTags,
            poemSources: normalizeStringList(preferences?.poemSources),
            excludeChars,
            charCount: preferences?.charCount,
          },
          candidateChars,
          classicQuotes,
          complianceRules: [
            '保持"传统文化参考""五行分析"等中性表达',
            '不做命运预测，不暗示名字可以改变人生结果',
            '不编造诗词出处',
          ],
        })
      : null;

    const messages = [
      { role: 'system' as const, content: knowledgePrompt?.systemPrompt || SYSTEM_PROMPT },
      { role: 'user' as const, content: knowledgePrompt?.userPrompt || userMessage },
    ];

    // 第一次 LLM 生成
    const response = await invokeLlm(messages, {
      model: getLlmModel(),
      temperature: 0.8,
    });

    const parsed = parseGeneratedNamesContent(response.content);
    if (!parsed.ok) {
      // 不暴露 raw AI output（避免泄露 LLM 内部输出），只返回友好错误 + 诊断字段
      console.error('AI起名返回格式解析失败:', parsed.error);
      return NextResponse.json(
        {
          success: false,
          error: 'AI 返回格式解析失败，请稍后重试',
          errorType: 'PARSE_FAILURE',
          detail: parsed.error?.substring(0, 200) || 'unknown parse error',
          data: { names: [] },
        },
        { status: 502 }
      );
    }

    const validationInput = {
      candidateChars: knowledgeBacked ? candidateChars : [],
      classicQuotes: knowledgeBacked ? classicQuotes : [],
      complianceTerms: ['算命', '改运', '预测', '命理'],
      surname,
    };

    // 第一次校验
    let validation = validateGeneratedNames(parsed.names, validationInput);
    let names = parsed.names;
    const repairWarnings: string[] = [];
    let repairedFromReject = false;

    // reject 修复机制：最多重试 1 次
    if (validation.invalidNames.some((invalid) => invalid.severity === 'reject') && knowledgeBacked) {
      const repairResult = await attemptRepair({
        rejectedNames: validation.invalidNames
          .filter((invalid) => invalid.severity === 'reject')
          .map((invalid) => ({ name: invalid.name, reasons: invalid.reasons })),
        surname,
        candidateChars,
        classicQuotes,
        knowledgePrompt,
        excludeChars,
      });

      if (repairResult.repairedNames.length > 0) {
        // 用修复后的名字替换被 reject 的名字
        const rejectedNameSet = new Set(
          validation.invalidNames
            .filter((invalid) => invalid.severity === 'reject')
            .map((invalid) => invalid.name),
        );
        const keptNames = names.filter(
          (item) => !rejectedNameSet.has(item.name || item.givenName || ''),
        );
        const repairedNames = repairResult.repairedNames.map((item) => ({
          ...item,
          repairedFromReject: true,
        }));
        names = [...keptNames, ...repairedNames];
        repairedFromReject = true;
        if (repairResult.warnings.length > 0) {
          repairWarnings.push(...repairResult.warnings);
        }
        // 重新校验合并后的结果
        validation = validateGeneratedNames(names, validationInput);
      }
    }

    // 硬过滤兜底：最终返回前再次确认没有名字命中用户避用字
    // 即使 repair 后仍命中避用字，也不允许作为正常推荐展示
    const excludeCharSet = new Set(excludeChars);
    const fallbackWarnings = knowledgeBacked
      ? []
      : ['知识层无可用候选字，已使用基础生成提示', '当前知识样例暂无充足典籍支撑，已提供基础候选'];
    const scoredNames = scoreGeneratedNames(names, {
      xiYong: xiYongList,
      candidateChars: knowledgeBacked ? candidateChars : [],
      classicQuotes: knowledgeBacked ? classicQuotes : [],
      validation,
    });
    const displayableNames = scoredNames.filter((item) => {
      const givenName = item.name || item.givenName || '';
      // reject 不展示
      const issue = validation.invalidNames.find((invalid) => invalid.name === givenName);
      if (issue?.severity === 'reject') return false;
      // 命中用户避用字不展示为正常推荐
      if (excludeCharSet.size > 0 && Array.from(givenName).some((char) => excludeCharSet.has(char))) {
        return false;
      }
      return true;
    });
    const namesWithValidation = attachValidationWarnings(
      displayableNames.length > 0 ? displayableNames : scoredNames,
      validation.invalidNames,
      knowledgeBacked,
      validation,
    );
    // knowledgeBacked=false 时，所有名字标记为 fallback 基础候选，避免被误读为"失败"或"0 分正式质量分"
    const namesWithFallbackMarker = namesWithValidation.map((item) => {
      if (!knowledgeBacked) {
        return {
          ...item,
          knowledgeBacked: false,
          sourceStatus: 'fallback' as const,
          // 避免 score=0 被当作正式质量分展示：fallback 名字统一展示为「基础候选」
          qualityLevel: '基础候选',
          validationWarnings: [
            ...(item.validationWarnings || []),
            '当前知识样例暂无充足典籍支撑，已提供基础候选参考',
          ],
        };
      }
      // knowledgeBacked=true 但 qualityScore=0 的名字（如编造出处被重罚）也不得以正式质量分展示
      if (typeof item.qualityScore === 'number' && item.qualityScore === 0) {
        return {
          ...item,
          qualityLevel: '基础候选',
        };
      }
      return item;
    });
    const validationWarnings = [
      ...fallbackWarnings,
      ...validation.warnings,
      ...validation.downgrades,
      ...validation.rejects,
      ...repairWarnings,
    ];

    // 合规过滤
    const filteredNames = filterComplianceDeep(namesWithFallbackMarker);

    // 0 名字兜底：不允许 success=true 且 names.length=0
    // 如果所有名字都被过滤/reject，走基础候选 fallback
    let finalNames = filteredNames;
    let finalKnowledgeBacked = knowledgeBacked;
    let finalValidationWarnings = validationWarnings;
    if (finalNames.length === 0) {
      // 尝试用未过滤的 scoredNames 作为基础候选（移除 reject 项后）
      const nonRejectNames = scoredNames.filter((item) => {
        const givenName = item.name || item.givenName || '';
        const issue = validation.invalidNames.find((invalid) => invalid.name === givenName);
        return issue?.severity !== 'reject';
      });
      if (nonRejectNames.length > 0) {
        finalNames = filterComplianceDeep(
          nonRejectNames.map((item) => ({
            ...item,
            knowledgeBacked: false,
            sourceStatus: 'fallback' as const,
            qualityLevel: '基础候选',
            validationWarnings: [
              ...(item.validationWarnings || []),
              '本次知识约束结果不足，已提供基础候选参考',
            ],
          })),
        );
      }
      // 如果仍然为 0，构造明确错误而非返回空数组
      if (finalNames.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: '本次生成未能产出有效名字，请稍后重试或调整偏好',
            errorType: 'ZERO_NAMES_AFTER_FILTER',
            detail: `parsed=${scoredNames.length} invalid=${validation.invalidNames.length} rejectCount=${validation.invalidNames.filter((n) => n.severity === 'reject').length}`,
            data: { names: [] },
          },
          { status: 502 },
        );
      }
      finalKnowledgeBacked = false;
      finalValidationWarnings = [
        ...validationWarnings,
        '本次知识约束结果不足，已提供基础候选参考',
      ];
    }

    return NextResponse.json({
      success: true,
      knowledgeBacked: finalKnowledgeBacked,
      validationWarnings: finalValidationWarnings,
      data: {
        names: finalNames,
        knowledgeBacked: finalKnowledgeBacked,
        validationWarnings: finalValidationWarnings,
        repairedFromReject,
        repairWarnings,
      },
    });
  } catch (error) {
    const errMsg = (error as Error)?.message || 'unknown error';
    const isTimeout = errMsg.includes('超时') || errMsg.includes('aborted') || (error as Error)?.name === 'AbortError';
    console.error('AI起名生成错误:', isTimeout ? 'TIMEOUT' : 'UPSTREAM_ERROR', errMsg.substring(0, 200));
    return NextResponse.json(
      {
        error: '名字生成失败，请稍后重试',
        errorType: isTimeout ? 'LLM_TIMEOUT' : 'LLM_UPSTREAM_ERROR',
        detail: errMsg.substring(0, 200),
      },
      { status: 500 }
    );
  }
}

/**
 * reject 修复机制：把 reject 原因反馈给 LLM，只要求重写被 reject 的名字
 * 最多重试 1 次
 */
async function attemptRepair(params: {
  rejectedNames: Array<{ name: string; reasons: string[] }>;
  surname: string;
  candidateChars: HanziKnowledgeCard[];
  classicQuotes: ClassicQuoteCard[];
  knowledgePrompt: ReturnType<typeof buildNamingPrompt> | null;
  /** 用户避用字列表，repair 时必须强制约束不得使用 */
  excludeChars: string[];
}): Promise<{ repairedNames: GeneratedNameApiItem[]; warnings: string[] }> {
  const warnings: string[] = [];
  if (!params.knowledgePrompt) {
    return { repairedNames: [], warnings };
  }

  const rejectList = params.rejectedNames
    .map((item) => `- 名字"${item.name}"被 reject 原因：${item.reasons.join('；')}`)
    .join('\n');

  const candidateText = params.candidateChars
    .map((card) => `${card.char}(${card.wuxing})：${card.meaning}`)
    .join('、');
  const quoteText = params.classicQuotes
    .map((quote) => `quoteId=${quote.id}｜source=${quote.source.title}｜可用字=${quote.usableChars.join('、')}`)
    .join('\n');

  // 强约束：用户避用字绝对禁止使用
  const excludeCharsLine = params.excludeChars.length > 0
    ? params.excludeChars.join('、')
    : '（用户未指定避用字）';

  const repairPrompt = `以下名字在上一轮生成中被 reject，请根据 reject 原因重新生成等量的替换名字。

被 reject 的名字及原因：
${rejectList}

修复要求（必须严格遵守）：
1. 只生成 ${params.rejectedNames.length} 个替换名字，不要重写其他名字。
2. 名字必须优先使用候选字池中的字：${candidateText}
3. 出处必须使用给定出处卡的 quoteId，不要编造出处。可用出处卡：
${quoteText || '（无可用出处卡，使用 poemSourceId: null, sourceStatus: "none"）'}
4. 如果之前是出处问题，请选择合法的 quoteId，或使用 poemSourceId: null + sourceStatus: "none"。
5. 如果之前是合规禁词问题，请避免使用"算命""改运""预测""命理"等禁词。
6. 姓氏"${params.surname}"的字符允许出现在名字中。
7. 【避用字强约束·最重要】用户避用字列表：${excludeCharsLine}
   - 重写的名字中绝对不能包含上述任何一个避用字。
   - 即使避用字在候选字池中，也严禁使用。
   - 如果无法避开某个避用字，请改用其他候选字重新组合。
   - 违反此约束的名字将被硬过滤，不会展示给用户。
8. 只输出 JSON 数组，格式与之前一致。

JSON 元素格式：
{
  "name": "名字（不含姓氏）",
  "wuxing": ["水", "木"],
  "score": 88,
  "sancai": "吉",
  "style": "清雅",
  "poem": "出处原句或短句",
  "poemSourceId": "quoteId 或 null",
  "poemSource": "对应出处卡 source.title 或留空",
  "sourceStatus": "verified 或 none",
  "wuxingAnalysis": "传统文化参考口径的简短说明"
}`;

  try {
    const repairResponse = await invokeLlm(
      [
        { role: 'system', content: params.knowledgePrompt.systemPrompt },
        { role: 'user', content: repairPrompt },
      ],
      {
        model: getLlmModel(),
        temperature: 0.6,
      },
    );

    const repairParsed = parseGeneratedNamesContent(repairResponse.content);
    if (!repairParsed.ok || repairParsed.names.length === 0) {
      warnings.push('修复重试未返回有效结果，保留原始生成');
      return { repairedNames: [], warnings };
    }

    // repair 后立即过滤掉仍命中避用字的结果，这些不会进入后续 validate/score
    const excludeSet = new Set(params.excludeChars);
    const safeNames = repairParsed.names.filter((item) => {
      const given = item.name || item.givenName || '';
      return !Array.from(given).some((char) => excludeSet.has(char));
    });
    if (safeNames.length < repairParsed.names.length) {
      warnings.push(`修复重试有 ${repairParsed.names.length - safeNames.length} 个名字仍命中避用字，已剔除`);
    }

    return { repairedNames: safeNames, warnings };
  } catch {
    warnings.push('修复重试调用失败，保留原始生成');
    return { repairedNames: [], warnings };
  }
}

function normalizeStringList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  return String(value)
    .split(/[\s,，、/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function attachValidationWarnings(
  names: GeneratedNameApiItem[],
  invalidNames: { item: GeneratedNameApiItem; name: string; reasons: string[]; severity: string }[],
  knowledgeBacked: boolean,
  validation: { warnings: string[]; downgrades: string[]; rejects: string[] },
): Array<GeneratedNameApiItem & { knowledgeBacked: boolean; validationWarnings?: string[] }> {
  return names.map((item) => {
    const givenName = item.name || item.givenName || '';
    const issue = invalidNames.find((invalid) => invalid.item === item || invalid.name === givenName);
    const warningTexts = [
      ...validation.warnings,
      ...validation.downgrades,
      ...validation.rejects,
    ].filter((warning) => warning.startsWith(`${givenName}：`));

    return {
      ...item,
      knowledgeBacked: knowledgeBacked && issue?.severity !== 'reject',
      validationWarnings: issue?.reasons || (warningTexts.length > 0 ? warningTexts : undefined),
    };
  });
}
