---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 965799332296643_0/project_7650447357674471680-files/docs/开源项目清单-AI起名.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 965799332296643#1781913785731
    ReservedCode2: ""
---
# AI起名项目 · 可用开源项目清单

> 搜索时间：2026-06-12 | 按用途分类，标注许可证、技术栈、成熟度、推荐程度

---

## 一、🏆 核心依赖（强烈推荐直接用）

### 1. lunar-javascript / lunar-typescript
- **仓库**: https://github.com/6tail/lunar-javascript
- **许可证**: MIT
- **技术栈**: JavaScript / TypeScript
- **npm**: `lunar-javascript`（v1.7.7, 35k+ 周下载）
- **功能**: 公历农历互转、干支、生肖、节气、八字、五行、十神、纳音、星宿、彭祖百忌、每日宜忌、吉神凶煞、黄道黑道日
- **时间范围**: 1901-2099
- **成熟度**: ⭐⭐⭐⭐⭐（6tail 系列多语言版本，130+ commits，持续维护到2025年11月）
- **同系列**: Java / Python / C# / Go / PHP 版本均有
- **我们的用途**: **八字排盘核心引擎**——四柱计算、五行分布、十神、节气判断，直接用
- **注意**: 不含喜用神判定逻辑，需自行实现

### 2. bazi-calculator-by-alvamind
- **仓库**: https://github.com/alvamind/bazi-calculator-by-alvamind
- **许可证**: MIT
- **技术栈**: TypeScript / Node.js
- **npm**: `bazi-calculator-by-alvamind` (v1.0.2)
- **功能**: 四柱排盘、五行分析（含五行强度计算）、日主分析、十神、贵人/文昌/天马/桃花、八宅风水
- **亮点**: TypeScript 强类型、结构化 JSON 输出、SOLID 架构
- **成熟度**: ⭐⭐⭐⭐
- **我们的用途**: **比 lunar-javascript 更高层的八字分析**——直接输出五行分布+强度、日主属性、神煞，可作为分析层补充
- **注意**: 五行强度算法是权重计算，非专业命理的"格局分析→扶抑调候"

### 3. bazi-calculator-by-alvamind-for-browser
- **仓库**: npm `bazi-calculator-by-alvamind-for-browser` (v1.0.1)
- **许可证**: MIT
- **技术栈**: TypeScript / 浏览器 + Node.js 同构
- **功能**: 同上，但支持浏览器直接运行、CDN 加载、IIFE/ESM/CJS 多格式
- **我们的用途**: **前端排盘**——小程序/H5 可直接浏览器端计算，无需后端

---

## 二、📊 汉字五行字库（数据层）

### 4. 汉字资源数据库 (20,880条)
- **地址**: https://gitcode.com/Open-source-documentation-tutorial/8e036
- **内容**: 20,880条汉字，含拼音(带声调)、繁体、笔画数、五行属性、吉凶寓意、康熙字典解释、新华字典解释、字源图片
- **格式**: SQL 数据库
- **我们的用途**: **核心字库数据源**——五行属性、笔画数、吉凶寓意、康熙笔画，直接导入

### 5. 康熙字典数据库 (6万条)
- **地址**: https://gitcode.com/Universal-Tool/51dd5
- **内容**: 6万条汉字，简繁体、拼音、笔画、五行属性、吉凶解释
- **我们的用途**: **补充字库**——覆盖更全，尤其罕见字

### 6. cnchar（汉字工具库）
- **仓库**: https://github.com/theajack/cnchar
- **许可证**: MIT
- **技术栈**: TypeScript
- **npm**: `cnchar` (2.7K+ GitHub stars)
- **功能**: 拼音转换、笔画数、偏旁查询、五行属性、成语、组词等 20+ 功能
- **数据量**: 6万+ 汉字
- **我们的用途**: **前端汉字工具**——笔画查询、拼音转换、五行查询，可替代自建字库的部分功能

### 7. chinese-random-name（五行随机起名库）
- **仓库**: https://github.com/XadillaX/chinese-random-name
- **许可证**: MIT
- **技术栈**: JavaScript / Node.js + Browser
- **npm**: `chinese-random-name` (v2.0.1)
- **功能**: 按五行属性随机生成名字（支持"金金""木水"等组合）、字典对象暴露
- **我们的用途**: **起名字库参考**——五行字库字典可直接复用，按五行筛选名字的逻辑可参考

### 8. cnname（中文姓名生成器）
- **仓库**: npm `cnname` (v1.5.8)
- **许可证**: MIT
- **技术栈**: JavaScript
- **功能**: 随机中文姓名生成，支持指定姓氏、性别、五行（metal/wood/water/fire/earth）、名字长度
- **我们的用途**: **起名参考**——五行属性按名分类的字库数据

---

## 三、🔬 专业八字排盘（深度参考）

### 9. china-testing/bazi（Python专业排盘）
- **仓库**: https://github.com/china-testing/bazi
- **许可证**: 未明确
- **技术栈**: Python
- **功能**: 八字排盘、五行分数、强弱分析、通根、十神、刑冲合会、调候、金不换、格局分析、大运流年、穷通宝鉴、三命通会分析
- **成熟度**: ⭐⭐⭐⭐（145 commits，2026年5月仍在更新）
- **我们的用途**: **喜用神/格局分析的算法参考**——这是目前开源项目中功能最强的专业八字排盘工具，格局分析、调候用神、穷通宝鉴逻辑可直接移植
- **注意**: Python 实现，需移植为 TypeScript

### 10. CrystalMarch/bazi（Python基础排盘+起名）
- **仓库**: https://github.com/CrystalMarch/bazi
- **许可证**: MIT
- **技术栈**: Python
- **功能**: 八字排盘、五行分析、楚辞取名
- **我们的用途**: **起名逻辑参考**——含楚辞取名和五行匹配逻辑

### 11. bazica（Go 版八字排盘）
- **仓库**: https://github.com/tommitoan/bazica
- **许可证**: MIT
- **技术栈**: Go
- **功能**: 四柱排盘、公历转八字、时区支持、JSON数据
- **我们的用途**: **算法验证参考**——可交叉验证排盘结果准确性

---

## 四、🤖 AI起名完整项目（架构参考）

### 12. AI生辰八字算命系统
- **地址**: https://gitee.com/miklechun/ai-fortune-telling-software
- **许可证**: MIT
- **技术栈**: FastAPI + SQLAlchemy + OpenAI API + HTML5/CSS3/JS
- **功能**: 用户认证、八字计算、AI智能分析（五行平衡/性格/事业/感情/健康/财运）、历史记录
- **我们的用途**: **全栈架构参考**——FastAPI后端 + OpenAI分析 + 前端UI，直接参考项目结构和API设计

### 13. Fate（Go科学取名工具）
- **仓库**: https://github.com/godcong/fate
- **许可证**: MIT
- **技术栈**: Go
- **功能**: 基于周易卦象+三才五格的取名，支持八字+生肖，命令行工具
- **我们的用途**: **取名算法参考**——三才五格计算、周易卦象取名逻辑可移植

### 14. @mymcp-fun/bazi（MCP八字服务器）
- **仓库**: https://github.com/mymcp-fun/bazi
- **许可证**: MIT
- **技术栈**: TypeScript / MCP SDK / lunar-javascript
- **功能**: MCP协议八字计算服务器，四柱+五行+生肖+星座+农历，时区支持
- **我们的用途**: **MCP集成参考**——如果要做 AI Agent 集成，可直接用或参考

---

## 五、📚 语料库与辅助数据

### 15. Chinese-Names-Corpus（中文人名语料库）
- **仓库**: https://github.com/wainshine/Chinese-Names-Corpus
- **功能**: 大量中文姓名、姓氏、名字、称呼语料，含日本人名/翻译人名/英文人名
- **我们的用途**: **重名检测/热名统计**——结合公安姓名数据做重名避坑

### 16. pinyin-pro（拼音转换库）
- **仓库**: npm `pinyin-pro`
- **功能**: 精准中文拼音转换，支持声调、多音字
- **我们的用途**: **谐音检测**——名字拼音提取，做多方言谐音避坑

---

## 六、📋 推荐技术架构

基于以上开源项目，推荐的技术选型：

```
前端 (Next.js / 小程序)
├── lunar-javascript        → 八字排盘（四柱、五行、十神）
├── bazi-calculator (browser版) → 前端五行强度计算、神煞
├── cnchar                  → 汉字笔画/拼音/五行查询
├── pinyin-pro              → 谐音检测
└── chinese-random-name字典  → 五行字库数据

后端 (Node.js / Python)
├── lunar-typescript        → 服务端排盘验证
├── china-testing/bazi 算法  → 喜用神/格局分析逻辑（移植为TS）
├── 汉字资源数据库 (2万条)    → 完整字库（五行/笔画/吉凶/出处）
└── LLM API (DeepSeek/GPT)  → 名字创意生成+解释润色

数据层
├── 汉字资源数据库 (SQL)     → 主字库
├── 康熙字典数据库 (6万条)   → 补充字库
├── Chinese-Names-Corpus    → 重名/热名数据
└── 自建喜用神规则库         → 格局分析→扶抑调候通关
```

### 关键差距：需要自建的部分

以上开源项目**都不包含**以下核心能力，需要我们自建：

1. **喜用神智能判定**——从"缺啥补啥"升级到"格局分析→扶抑调候通关"
2. **名字质量评估**——避免"沐辰汐玥"网红名、俗名检测
3. **重名/热名数据库**——结合公安部姓名报告
4. **多方言谐音检测**——粤语/闽南语/客家话
5. **合规用词过滤**——自动替换"算命/改运"为"分析/参考"
6. **名字解释生成**——AI润色+诗词出处+寓意解读

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
