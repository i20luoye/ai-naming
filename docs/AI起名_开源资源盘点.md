---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 965799332296643_0/project_7650447357674471680-files/docs/AI起名_开源资源盘点.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 965799332296643#1781913743786
    ReservedCode2: ""
---
# AI起名工具 — 开源资源盘点

> 整理时间：2026-06-12 | 产品经理Agent

---

## 一、核心八字排盘库（npm，可直接安装）

### 🥇 首选：`lunar-typescript`（推荐！）
- **仓库**：https://github.com/isee15/Lunar-TS
- **协议**：MIT
- **特点**：轻量（<50KB），含八字排盘、节气计算、黄历查询，TypeScript类型定义完善，单元测试覆盖
- **用法**：`import { Lunar } from 'lunar-typescript'; lunar.getEightChar().toString();`
- **适用**：前端/小程序直接用，无需后端

### 🥈 备选：`bazi-calculator-by-alvamind-for-browser`
- **npm**：`bazi-calculator-by-alvamind-for-browser`
- **协议**：MIT
- **特点**：浏览器+Node.js同构，四柱+五行+十神+神煞+八宅风水，TypeScript严格模式
- **适用**：需要完整命理分析的场景

### 🥉 备选：`shunshi-bazi-core`
- **npm**：`shunshi-bazi-core`
- **协议**：MIT
- **特点**：纯TypeScript，零框架依赖，内置真太阳时校正
- **适用**：需要精准真太阳时的场景

### 其他可参考
| 库名 | 特点 | 协议 |
|------|------|------|
| `chinese-astrology-skill` | MCP服务，八字+称骨+黄历，基于tyme4ts引擎 | MIT |
| `bazi-mcp` (Cantian AI) | MCP服务，精准排盘，GPT Store热门应用开源版 | ISC |
| `@gracefullight/saju` | TypeScript四柱计算器，灵活日期适配 | MIT |
| `@mingai/core` | 综合命理SDK，八字+紫微+六爻+奇门+塔罗 | MIT |
| `@orrery/core` | 四柱八字+紫微斗数 | AGPL-3.0 |

---

## 二、GitHub 完整开源项目

### Python 生态
| 项目 | 仓库 | 特点 |
|------|------|------|
| **bazi** | `CrystalMarch/bazi` | 八字排盘+五行分析+**姓名学**，可直接复用起名逻辑 |
| **fate-php** | CSDN开源 | 纯PHP，<1500行，八字+大运+五行，MIT协议，极简部署 |

### Node.js / TypeScript 生态
| 项目 | 仓库 | 特点 |
|------|------|------|
| **Bazi-Calendar** | `yuanyan3060/Bazi-Calendar` | Node.js+TS+React全栈，八字排盘+流年+神煞，核心模块可独立调用 |
| **chinese_astrology** | `kfatehi/chinese_astrology` | TypeScript命理引擎，五行+十神+大运，1900-2100年范围 |
| **gushi_namer** | `holynova/gushi_namer` | 古诗文起名工具，Node.js，诗经/楚辞/唐诗/宋词起名，可直接复用诗词库 |
| **bazi-mcp** | `cantian-ai/bazi-mcp` | MCP协议八字服务，支持公历/农历/真太阳时 |

---

## 三、汉字五行数据库（可直接获取）

### 开源/可获取资源
1. **康熙字典数据库**（含汉字五行属性、字义、笔画）
   - 互站网有售：诗词起名+康熙字典DB+五行查询整站源码，PHP+MySQL，¥199
   - 包含：汉字五行属性、取名寓意、诗词来源、康熙字典解释
   
2. **汉字五行判断规则**（可自建）
   - **字形法**（最常用）：木(木艹竹禾)、火(火灬日光)、土(土山石田)、金(金钅刂刀戈)、水(水氵冫雨鱼)
   - **字义法**（最根本）：根据汉字本义判断，如"沐"虽有木部但本义为润泽→属水
   - 参考《康熙字典》综合判断

---

## 四、可直接参考的起名源码（商业）

| 来源 | 内容 | 价格 | 技术栈 |
|------|------|------|--------|
| 互站网 | 诗词起名+姓名打分+康熙字典DB+汉字五行查询 整站 | ¥199 | PHP+MySQL |
| 互站网 | 宝宝起名+公司起名+周易测算 整站 | ¥199 | PHP+MySQL |
| 一讯科技 | 30+种术数软件源码（八字/紫微/奇门/六壬等） | 询价 | 多技术栈 |

---

## 五、推荐技术方案（站在巨人肩膀上）

### 方案A：纯前端轻量版（最快MVP）
```
前端：React/Next.js + lunar-typescript（八字排盘）
字库：自建JSON（康熙字典常用3000字+五行属性）
起名：规则引擎（五行匹配+诗词库匹配）+ AI大模型润色
部署：Vercel（零服务器成本）
周期：2人×2周
```

### 方案B：全栈完整版
```
前端：Next.js + lunar-typescript
后端：NestJS(Node.js) + bazi-calculator（八字核心）
数据库：PostgreSQL + 康熙字典DB
AI层：DeepSeek/通义千问API（名字生成+寓意解读）
部署：阿里云/腾讯云
周期：3人×4周
```

### 方案C：最快启动（买源码二次开发）
```
基础：互站网¥199整站源码（PHP+MySQL）
升级：替换八字引擎为lunar-typescript
叠加：接入AI大模型做智能起名+解读
周期：1人×1周
```

---

## 六、关键结论

1. **八字排盘不要自己写**：npm上至少5个成熟库，MIT协议可商用，精准度经验证
2. **汉字五行库可以买到**：互站网¥199整站含完整康熙字典DB+五行属性
3. **诗词起名有现成项目**：`gushi_namer` 开源可复用，诗经楚辞唐诗宋词全覆盖
4. **最大差距在AI层**：现有开源项目都是规则引擎起名，缺少真正的AI大模型参与，这是我们的差异化切入点
5. **合规改造需要自己做**：所有现成源码都偏"算命"定位，需要自行改造为"AI起名工具"

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
