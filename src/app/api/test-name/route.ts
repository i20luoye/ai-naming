import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { filterComplianceDeep } from '@/lib/compliance';

const SYSTEM_PROMPT = `你是「天衍」AI测名系统的文化顾问，精通中国传统命名文化、八字五行理论、三才五格和音韵学。

你的职责是对用户提供的名字进行全方位、深层次的评测分析，让用户获得真正有价值的参考信息。

## 评分维度与规则

1. **喜用神匹配度**（0-100）：若有出生信息，分析名字五行与命盘喜用神的契合程度；若无出生信息，仅评估五行搭配是否均衡流通
2. **三才五格**（0-100）：计算天格、人格、地格、外格、总格的笔画数理和吉凶，评估三才配置
3. **音韵和谐**（0-100）：分析声调平仄搭配、声母韵母组合是否拗口、整体韵律美感
4. **寓意深度**（0-100）：评估名字的文化内涵深度、是否有经典出处、寓意是否积极
5. **综合评分**（0-100）：以上维度的加权综合

## 合规约束（必须遵守）

- 禁止使用任何"算命""改运""预测""命理""消灾""避祸""大吉大利""一生富贵"等迷信措辞
- 使用"传统文化参考""五行分析""文化民俗参考"等中性表述
- 不做任何人生预测、运势判断
- 不暗示名字好坏会影响命运
- 语气定位为"文化民俗参考"

## 输出格式

返回严格的JSON对象（不要包含任何markdown标记或其他文字）：
{
  "score": 85,
  "wuxingMatch": 80,
  "meaningDepth": 88,
  "sancaiConfig": "木火土·吉",
  "yinyunScore": 90,
  "wugeScore": 85,
  "nameWuxing": ["火", "火"],
  "wuxing": {"金": 1, "木": 2, "水": 1, "火": 3, "土": 1},
  "matchConclusion": "简短结论（20字以内）",

  "characterAnalysis": [
    {
      "char": "悦",
      "pinyin": "yuè",
      "wuxing": "火",
      "strokes": 11,
      "structure": "左右结构",
      "radical": "忄",
      "meaning": "喜悦、高兴，内心愉悦",
      "classicRef": {
        "source": "《诗经·周南》",
        "quote": "悠哉悠哉，辗转反侧",
        "interpretation": "表达内心安然喜悦之意"
      }
    }
  ],

  "wuge": [
    {"name": "天格", "strokes": 11, "wx": "木", "luck": "吉", "meaning": "先天运，祖上福泽与早年根基"},
    {"name": "人格", "strokes": 19, "wx": "火", "luck": "吉", "meaning": "主运，一生核心性格特质"},
    {"name": "地格", "strokes": 17, "wx": "金", "luck": "吉", "meaning": "前运，中年以前的发展际遇"},
    {"name": "外格", "strokes": 9, "wx": "水", "luck": "凶", "meaning": "副运，人际社交与外部助力"},
    {"name": "总格", "strokes": 27, "wx": "金", "luck": "吉", "meaning": "后运，晚年运势与人生总结"}
  ],

  "wuxingBenefit": {
    "description": "名字整体五行补益路径分析（50-80字）",
    "flow": "火生土，土生金，五行流通有情",
    "xiyongAdvice": "命盘喜用神为水木，名字中火偏旺，建议补充水属性字以平衡五行"
  },

  "phoneticAnalysis": {
    "tones": [
      {"char": "张", "tone": 1, "toneName": "阴平", "pingze": "平"},
      {"char": "悦", "tone": 4, "toneName": "去声", "pingze": "仄"},
      {"char": "宁", "tone": 2, "toneName": "阳平", "pingze": "平"}
    ],
    "pingzePattern": "平仄平",
    "pingzeEval": "平仄相间，抑扬有致，读来朗朗上口",
    "rhymeEval": "韵母搭配和谐，尾音开口呼，余韵悠长"
  },

  "homophoneCheck": {
    "result": "安全",
    "details": "未发现常见不良谐音",
    "dialectNotes": "粤语中"悦宁"近似"阅人"，无不良含义"
  },

  "repeatRisk": 55,
  "repeatLevel": "中等",
  "charFrequency": [
    {"char": "张", "freq": "极高频姓氏"},
    {"char": "悦", "freq": "中高频"},
    {"char": "宁", "freq": "中频"}
  ],

  "suggestions": [
    {
      "aspect": "五行补益",
      "content": ""宁"字近年使用率上升，若喜水木，可考虑替换一火字为水属性字"
    },
    {
      "aspect": "音韵优化",
      "content": "当前平仄搭配已较佳，无需特别调整"
    }
  ],

  "overallComment": "「张悦宁」五行偏火、寓意积极、音韵和谐，综合表现优良。若命盘喜水木，可适度补益。以上解读为传统文化视角的赏析，仅供参考。"
}`;

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
    const { surname, givenName, birthDate, birthTime, gender } = body;

    if (!surname || !givenName) {
      return NextResponse.json(
        { error: '缺少必填参数: surname, givenName' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const birthInfo = birthDate
      ? `\n- 出生日期：${birthDate}\n- 出生时间：${birthTime || '未指定'}\n- 性别：${gender || '未指定'}`
      : '\n（未提供出生信息，仅做音韵、寓意、五行搭配分析，不做喜用神匹配分析）';

    const userMessage = `请评测名字"${surname}${givenName}"。

姓氏：${surname}
名字：${givenName}${birthInfo}

请从以下维度进行深度评测，并返回完整JSON：
1. 逐字解析：每个字的拼音、五行、笔画（康熙笔画）、部首、结构、字义、经典出处
2. 五行匹配：名字五行与命盘的契合度（若有出生信息），五行流通路径
3. 三才五格：完整五格计算及吉凶、三才配置
4. 音韵分析：声调、平仄搭配评价、韵母和谐度
5. 谐音检测：普通话及常见方言（粤语/闽南语）谐音排查
6. 重名风险：各字使用频率及组合独特性
7. 寓意深度：名字整体文化内涵评价
8. 优化建议：具体可操作的改进方向
9. 总体评价

返回JSON对象，不要包含任何其他文字或markdown标记。`;

    const response = await client.invoke(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.5,
      }
    );

    let result;
    try {
      const content = response.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      return NextResponse.json({
        success: true,
        data: { raw: response.content },
      });
    }

    // 合规过滤
    const filteredResult = filterComplianceDeep(result);

    return NextResponse.json({
      success: true,
      data: filteredResult,
    });
  } catch (error) {
    console.error('AI测名评分错误:', error);
    return NextResponse.json(
      { error: '测名评分失败，请稍后重试' },
      { status: 500 }
    );
  }
}
