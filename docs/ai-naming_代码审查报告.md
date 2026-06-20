---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 965799332296643_0/project_7650447357674471680-files/docs/ai-naming_代码审查报告.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 965799332296643#1781913683232
    ReservedCode2: ""
---
# 天衍 AI 起名工具 — 代码审查报告

**审查者**: 产品经理Agent  
**审查日期**: 2026-06-14  
**仓库**: https://github.com/i20luoye/ai-naming  
**提交**: 19 commits, 全部 2026-06-14  
**技术栈**: Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui + pnpm

---

## 一、项目概览

| 维度 | 状态 |
|------|------|
| 品牌名 | 天衍 |
| 代码量 | 首页 1233行、八字引擎 229行、3个API路由（bazi/generate-names/test-name） |
| 页面结构 | 首页 + 起名流程5步（input → bazi → preference → result → detail）+ 测名流程2步 |
| 包管理器 | pnpm 9+ |
| LLM 集成 | coze-coding-dev-sdk，模型 doubao-seed-2-0-lite-260215 |
| 数据库依赖 | drizzle-orm + @supabase/supabase-js + pg（已安装但 API 未使用） |

---

## 二、做得好的 ✅

### 1. 品牌设计非常到位
`DESIGN.md` 是一份专业级的设计规范文档。墨韵金辉配色体系完整（墨黑底 #0A0806 + 金箔主色 #C8A45C + 朱砂强调 #C4564A），从色彩、字体（思源宋体+思源黑体）、圆角、阴影到动效都有明确规范。五行专属色和设计禁忌清单（禁止浅色背景/蓝紫科技风/卡通道教图案/"大师"人像）也很实用。

### 2. 合规意识强
三个 API 的 System Prompt 都内置了合规约束：
- 禁止"算命/改运/预测/命理"等措辞
- 使用"传统文化参考/五行分析"等中性表述
- 不做人生预测、运势判断
- 不暗示名字可以改变命运

在八字起名这个政策敏感赛道，这是上线前的必要保障。

### 3. 纯前端八字引擎选型合理
`lib/bazi.ts` 229 行纯 TypeScript 实现，不依赖任何第三方八字库。避免了 GPL 协议风险，且服务端/客户端都能复用。五行生克、藏干、喜用神推断逻辑完整。

### 4. API 设计清晰
- `POST /api/bazi`：八字排盘计算
- `POST /api/generate-names`：AI 起名生成（含偏好参数）
- `POST /api/test-name`：测名评分（多维分析）

入参/出参规范、错误处理、LLM JSON 解析失败时的降级策略都有考虑。

### 5. 组件基础设施完备
shadcn/ui 全量集成（30+ Radix UI 组件），表单（react-hook-form+zod）、图表（recharts）、轮播（embla-carousel）等都已就位。`AGENTS.md` 为 AI Agent 协作提供了清晰的指引。

---

## 三、需要改进的 ⚠️

### 🔴 高优先级

#### 1. 八字排盘精度不足 — 产品核心致命短板

`lib/bazi.ts` 存在多个算法精度问题：

**问题 A：月份用公历而非农历/节气**
```typescript
// 当前实现（错误）
const zhiIdx = (month + 1) % 12; // 直接映射公历月份
```
八字排盘必须以节气为界（如立春后才算寅月）。公历 2 月 3 日（立春前）和 2 月 5 日（立春后），月柱完全不同。

**问题 B：日柱基准日未验证**
```typescript
const baseDate = new Date(2000, 0, 1); // 假设为甲子日
```
代码注释写"简化"，但 2000-01-01 的真实日柱需要精确验证。基准日差一天，所有计算结果全错。

**问题 C：年柱未考虑立春分界**
1 月出生的人如果还没到立春，年柱应该用前一年的干支。

**问题 D：缺真太阳时校正**
不同经度的出生时辰应该根据真太阳时调整，当前直接使用公历小时。

**建议方案**：
- 引入 `lunar-typescript`（MIT 协议，npm 已成熟）处理农历转换、节气、真太阳时
- 或至少对照 `lunar-typescript` 的输出验证当前算法准确性
- 八字排盘是用户信任的基础，一个错误会导致喜用神完全颠倒

#### 2. 首页组件 1233 行 — 严重违反单一职责

`src/app/(home)/page.tsx` 包含 Hero、特色功能、每日推荐、案例展示、用户评价、FAQ、CTA、Footer 全部内容，还内嵌大量 CSS 动画关键帧。

**影响**：
- 首屏 JS 59KB，加载过重
- 维护困难（改一个 section 要翻几百行）
- SEO 不友好（大量客户端组件）

**建议拆分**：
```
src/components/tianyan/
├── HeroSection.tsx
├── FeatureSection.tsx
├── DailyNamesSection.tsx
├── CaseSection.tsx
├── ReviewSection.tsx
├── FAQSection.tsx
├── CTASection.tsx
└── FooterSection.tsx
```
每个组件独立 `lazy()` 加载。

#### 3. README 是项目模板 — 缺少产品说明

当前 README.md 是 Next.js 脚手架默认内容，没有"天衍"的任何产品说明。

**建议补充**：
- 项目简介（天衍是什么、解决什么问题）
- 功能列表（八字排盘 / AI 起名 / 测名评分）
- 技术栈
- 本地运行步骤
- API 文档链接
- 合规声明
- 产品截图

---

### 🟡 中优先级

#### 4. API 层缺少数据库持久化

三个 API 都是纯计算 + LLM 调用，结果不存库：
- 用户刷新后起名/测名结果丢失
- 无法做历史记录
- 无法分析用户行为

package.json 已装 `drizzle-orm` + `@supabase/supabase-js` + `pg`，但 API 中完全未使用。

**建议**：先做最小持久化 — 每次起名/测名结果存入 Supabase，返回 `resultId`。

#### 5. 首页推荐数据硬编码

`page.tsx` 的"今日推荐"使用 `NAME_POOL` 硬编码 15 个名字。起名流程结果页如果也是硬编码而非真实 API 调用，核心流程就是断的。

#### 6. 缺少环境变量管理

`.env.example` 不在仓库中，Supabase / Coze SDK / AWS S3 的配置方式不明确。

#### 7. 没有测试

无测试脚本、无 jest/vitest 依赖。八字引擎作为核心算法，至少需要：
- 单元测试：日柱/时柱/喜用神计算
- 快照测试：已知八字案例的结果对比

---

### 🟢 低优先级

#### 8. 日柱计算代码重复
`page.tsx` 的 `getTodayGanZhi` 和 `lib/bazi.ts` 的 `getDayGanZhi` 功能重叠但实现不同。应统一到 `lib/bazi.ts`。

#### 9. 移动端适配需系统化
DESIGN.md 声明"移动端优先"，但代码中缺乏系统性的响应式断点策略。

#### 10. AGENTS.md 可增加操作场景指引
可以增加"常见修改场景"（加新页面、改配色、改 API），让后续 Agent 协作更高效。

---

## 四、综合评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 产品设计 | ⭐⭐⭐⭐ | 品牌体系完整，设计规范专业 |
| 技术架构 | ⭐⭐⭐ | 选型合理，但核心算法精度不足 |
| 代码质量 | ⭐⭐⭐ | 功能完整但首页过大、缺测试 |
| 合规意识 | ⭐⭐⭐⭐⭐ | System Prompt 合规约束到位 |
| 文档完整度 | ⭐⭐⭐⭐ | DESIGN/AGENTS 都很好，缺产品 README |
| 可上线程度 | ⭐⭐ | 八字精度问题不解决不能上线 |

---

## 五、结论

**产品骨架搭得很好，品牌和合规层面有惊喜，但八字引擎的精度是致命短板 — 这个不修，产品就是建在沙子上。**

建议修复优先级：
1. **P0**：修复八字排盘精度（引入 lunar-typescript 或至少验证算法）
2. **P0**：补充产品 README
3. **P1**：拆分首页组件
4. **P1**：接入数据库持久化
5. **P2**：添加八字引擎单元测试
6. **P2**：补充 .env.example

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
