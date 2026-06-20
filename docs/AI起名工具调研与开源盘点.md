---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 965799332296643_0/project_7650447357674471680-files/docs/AI起名工具调研与开源盘点.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 965799332296643#1781913754535
    ReservedCode2: ""
---
# AI起名工具 项目调研与开源盘点

> 项目群ID：7650447357674471680 | 调研时间：2026-06-12 | 6Agent调研+5Agent开源搜索

## 市场规模
- 玄学数字化总市场(2025)：142亿元(+21.5%) | 八字细分52.7亿(占43.8%)
- 新生儿命名市场(2024)：38亿元，CAGR 22.3% | 线上起名4.38亿
- AI起名用户860万人次(+39.2%) | 抖音"宝宝起名"419亿播放
- 付费转化率8-12%（全员交叉验证）| 客单价35元(2020)→128元(2026)
- 核心心理：怕后悔+转移决策责任 | 风险：新生儿降/低频/免费截流

## 竞品格局
市场极度分散（4.7万主体68%个体户），无品牌垄断。竞品共性缺陷：喜用神判定粗糙、缺深度命理逻辑、无多方言谐音检测。

## 盈利模式
付费报告(128-298元) > 人工专家(500-2000元) > VIP会员 > B端API > 企业命名

## 核心差异化（全员共识）
1. 喜用神精准分析（非"缺啥补啥"）2. LLM创意起名 3. 完整命名报告 4. 多方言谐音+俗名避坑 5. 双人协作起名+家庭投票 6. 魔鬼辩护机制

## 合规要点
定位"传统文化数字化工具"禁用"算命/预测"；合规备案4-6个月；需八字命理顾问；预算≥20万

## 开源项目首选
- **排盘**：6tail/lunar-javascript（MIT，5k+ stars，4/5推荐）> lunisolar > bazi-calculator-by-alvamind > shunshi-bazi-core
- **算法字库**：babyname/fate（康熙笔画+五行+拼音）> CrystalMarch/bazi
- **喜用神**：korean-saju（Python，竞品调研Agent杀手级发现）
- **前端UI**：Yangstud/BaZi_Calculator（React+Vite，技术栈最接近）
- **AI/LLM**：无开源方案，需自建（推荐DeepSeek/通义千问）

## 技术路线分歧
TypeScript（4/5 Agent：lunar-javascript+LLM，2-4周）vs Python（1/5：lunar-python+korean-saju，2-3周）

## MVP方案（Codex）
排盘→喜用分析→AI生成50名→每名详解→付费解锁→分享投票→预留人工入口

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
