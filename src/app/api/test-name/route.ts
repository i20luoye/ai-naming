import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const SYSTEM_PROMPT = `你是「天衍」AI测名系统的文化顾问，精通中国传统命名文化和八字五行理论。

你的职责是根据用户的名字和八字信息，给出专业、客观的评分和分析。

## 核心规则

1. 从多个维度评分：喜用神匹配度、三才五格、音韵和谐度、寓意深度、重名风险、谐音检测
2. 评分需客观，不要刻意抬高或贬低
3. 分析要有理有据，引用真实诗词典故
4. 给出具体的五行匹配分析和建议

## 合规约束（必须遵守）

- 禁止使用任何"算命""改运""预测""命理"等措辞
- 使用"传统文化参考""五行分析"等中性表述
- 不做任何人生预测、运势判断
- 不暗示名字好坏会影响命运

## 输出格式

返回JSON对象：
{
  "score": 85,
  "wuxingMatch": 80,
  "sancaiConfig": "吉",
  "yinyunScore": 90,
  "nameWuxing": ["火", "火"],
  "matchConclusion": "简短结论",
  "wuge": [
    {"name": "天格", "strokes": 11, "wuxing": "木", "luck": "吉"},
    {"name": "人格", "strokes": 19, "wuxing": "火", "luck": "吉"},
    {"name": "地格", "strokes": 17, "wuxing": "金", "luck": "吉"},
    {"name": "外格", "strokes": 9, "wuxing": "水", "luck": "凶"},
    {"name": "总格", "strokes": 27, "wuxing": "金", "luck": "吉"}
  ],
  "toneAnalysis": "平仄搭配说明",
  "homophoneCheck": "谐音检测结果",
  "repeatRisk": 55,
  "repeatLevel": "中等",
  "hotNameCheck": "是否热门名",
  "analysis": "综合分析文字"
}`;

export async function POST(request: NextRequest) {
  try {
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
      : '';

    const userMessage = `请评测名字"${surname}${givenName}"。

姓氏：${surname}
名字：${givenName}${birthInfo}

请从五行匹配、三才五格、音韵和谐、寓意深度等多维度评分。返回JSON对象，不要包含任何其他文字。`;

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

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('AI测名评分错误:', error);
    return NextResponse.json(
      { error: '测名评分失败，请稍后重试' },
      { status: 500 }
    );
  }
}
