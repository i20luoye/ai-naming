import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { surname, birthDate, birthTime, gender, xiYong, pattern, preferences } = body;

    if (!surname || !birthDate || !birthTime || !xiYong) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prefStr = preferences
      ? `\n\n用户偏好：字数=${preferences.charCount || '双字'}，风格=${preferences.styles?.join('/') || '不限'}，诗词出处=${preferences.poemSources?.join('/') || '不限'}，排除字=${preferences.excludeChars || '无'}，避网红=${preferences.avoidHot ? '是' : '否'}，避谐音=${preferences.avoidHomophone ? '是' : '否'}`
      : '';

    const userMessage = `请为"${surname}"姓宝宝起名。

基本信息：
- 性别：${gender || '未指定'}
- 出生日期：${birthDate}
- 出生时间：${birthTime}
- 八字格局：${pattern || '未指定'}
- 喜用神：${xiYong.join('、')}
${prefStr}

请基于喜用神"${xiYong.join('、')}"方向，生成5-8个名字建议。返回JSON数组，不要包含任何其他文字。`;

    const response = await client.invoke(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.8,
      }
    );

    // 解析 LLM 返回的 JSON
    let names;
    try {
      const content = response.content.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      names = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      // 如果解析失败，返回原始内容
      return NextResponse.json({
        success: true,
        data: { raw: response.content, names: [] },
      });
    }

    return NextResponse.json({
      success: true,
      data: { names },
    });
  } catch (error) {
    console.error('AI起名生成错误:', error);
    return NextResponse.json(
      { error: '名字生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
