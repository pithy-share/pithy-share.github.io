# 《从0到1理解AI》网站架构 Spec

> 日期：2026-06-14
> 状态：架构已定，待作者审阅 → writing-plans
>
> **范围声明**：本文档**只定义技术架构与平台基础设施**。内容（章节数量与清单、具体演示、正文文案、视觉设计）**尚未规划，不在本文范围**。架构的核心目标之一，就是让内容可以**独立、可插拔**地接入——内容后续怎么变，都不动平台。

---

## 1. 范围与原则

**本 spec 关心**：技术选型、站点骨架、组件模式、共享基础设施、构建部署、**内容接入契约**（新章节 / 新演示如何挂入）。

**本 spec 不关心（显式延后给"内容侧"）**：

- 章节数量、标题、正文
- 具体演示清单与各自交互细节
- 视觉设计（配色 / 字体 / 插画）—— VitePress 默认主题已专业

**核心原则：平台与内容解耦。** 架构定义"插槽"与"契约"；内容侧按契约往里填，互不耦合。

---

## 2. 选型：VitePress + Vue 3 + TypeScript

### 2.1 结论

VitePress（Vue 3 静态文档 / 书籍生成器）+ Vue 3 SFC（`<script setup lang="ts">`）演示 + 全场 TS。

### 2.2 为什么（以"AI 可建性"为首要标准）

- Vue 3 + VitePress 训练数据覆盖最广、最稳，幻觉风险最低
- 侧边栏 / 搜索 / 暗色 / 代码高亮（Shiki）/ 数学插件全在 config 开，**AI 要写的代码最少**
- 单一 Vue 心智模型，AI 不在框架间切上下文
- Markdown 优先 = AI 写作最强格式
- 演示即 Vue SFC → **消灭"演示用什么框架"的决策**

### 2.3 不选什么

- **Astro + Starlight**：性能 / 自由度优势对本量级（一页一两个 canvas/滑块）无用，版本迁移风险略高
- **Next.js / SvelteKit 静态导出**：boilerplate 过多，大材小用
- **手写 HTML 无框架**：缺组件模型，难一致维护

---

## 3. 站点骨架（与内容解耦）

```
ai-learn/
├── .vitepress/
│   ├── config.ts            # nav / sidebar / base / 主题 / 数学插件
│   ├── theme/index.ts       # 主题扩展、注册全局组件
│   └── cache/
├── public/                  # 静态资源（favicon、图解等）
├── content/                 # 章节 Markdown（数量 / 命名由内容侧定）
├── demos/                   # 演示 SFC（每个独立，按内容侧需要挂入）
├── composables/
│   └── useApiKey.ts         # API key 读写（localStorage 单例）
├── components/
│   ├── ApiKeyInput.vue      # 统一"粘 key"输入
│   └── DemoFrame.vue        # 演示外框（标题 / 说明 / 重置 / 错误）
├── index.md                 # 首页
└── package.json
```

`content/` 与 `demos/` 是**容器**：放什么、放多少由内容侧决定；平台只提供目录与接入约定。

---

## 4. 内容接入契约（架构的核心贡献）

这是"平台 / 内容解耦"的落点——架构定义插槽与接口，内容侧按此填入。

### 4.1 章节契约

- 一个章节 = `content/` 下一个 `.md` 文件
- frontmatter 约定（schema）：

  ```yaml
  ---
  title: <章节标题>
  order: <整数，决定排序>
  part: <string，用于侧边栏分组；分组集合由内容侧定>
  draft: <bool>        # true 则不进侧边栏
  ---
  ```

- 正文为标准 Markdown + 数学（KaTeX）+ 嵌入演示组件
- **侧边栏由 config 自动生成**（读取 `content/` + frontmatter），新增章节无需手改 config

### 4.2 演示组件契约

每个演示 = `demos/` 下一个 `.vue` SFC，需满足：

- **自包含**：不 import 任何章节特定代码；只依赖共享基础设施（`useApiKey`、`components/*`）
- **接口**：可选 props `{ title?: string }`；内部自管状态；可被 reset
- **样式**：scoped，无全局副作用
- **按原型实现**（见 §5）对应约定

### 4.3 在章节里挂入演示的标准方式

```md
<script setup>
import Demo from '../demos/SomeDemo.vue'
</script>

<DemoFrame title="演示标题" hint="一句话说明">
  <Demo />
</DemoFrame>
```

（VitePress 原生支持 Markdown 内写 Vue。）→ 内容侧只做"写 .md + 引用已有演示组件"，不碰平台。

---

## 5. 演示组件的两种原型（patterns，不是固定清单）

两种**可复用的实现模式**，内容侧按需选用：

### 5.1 Simulation 原型（无网络）

- 适用：纯原理可视化（参数滑动、动画、热力图等）
- 实现：canvas 用 `ref` + `onMounted` + `requestAnimationFrame`；控件用 Vue 响应式
- 依赖：零或仅轻量库
- 加载即用，离线可跑

### 5.2 API-backed 原型（真实模型）

- 适用：需要看真实模型响应的演示
- 实现：`useApiKey()` 取 key → `fetch` 直连 provider → 响应式状态管理 请求 / loading / 结果（可流式）/ 错误
- **必须处理"无 key"分支**：渲染 `<ApiKeyInput>` 引导
- Anthropic 需 header `anthropic-dangerous-direct-browser-access: true`；OpenAI 标准 CORS

---

## 6. 共享基础设施

### 6.1 `useApiKey` composable

- localStorage 单例，键名 `ai-learn:api-key:<provider>`
- 暴露 `getKey(provider)` / `setKey(provider, key)` / `clearKey(provider)` / `hasKey(provider)`（响应式）
- 模块级单例 + `ref`；本量级无需 pinia

### 6.2 `<ApiKeyInput>`

- 统一"粘 key"入口 + provider 选择 + 记住 / 清除
- key **永不**入 URL、**永不** `console.log`、清除时移出内存

### 6.3 `<DemoFrame>`

- 演示外框：标题 / 一句话说明 / reset / 错误提示位
- 让所有演示视觉一致；内容侧只关心演示本身

---

## 7. 数据流（API 演示）

```
读者粘 key → useApiKey 存 localStorage
   ↓
演示组件读 key → fetch(POST provider endpoint, { headers, body })
   ↓
provider 直接返回 → 演示渲染结果
   ↓
key 全程只在浏览器，不经任何第三方服务器
```

**没有后端。** GitHub Pages 静态站 + 浏览器直连 provider，零运维、零 key 托管。

---

## 8. 错误处理

- **API 演示**：网络 / 401（key 错）/ 429（限流）/ 超时 → `<DemoFrame>` 统一捕获，中文提示 + 重试；key 错引导回 `<ApiKeyInput>`
- **演示内部**：canvas 异常不崩整页（组件级 try-catch）
- **构建**：build 失败 → CI 红，阻塞部署

---

## 9. 构建与部署

### 9.1 本地

```bash
npm install
npm run docs:dev      # 开发预览
npm run docs:build    # 输出到 .vitepress/dist
npm run docs:preview  # 预览构建产物
```

### 9.2 GitHub Pages

- **base 路径（关键 gotcha）**：
  - 项目站 `https://<user>.github.io/<repo>/` → `base: '/<repo>/'`
  - 用户 / 组织站 → `base: '/'`
  - 按 repo 名配置；这是 VitePress 上 Pages 最常见的"白屏 / 资源 404"原因
- **CI**：GitHub Actions，`main` 推送 → `docs:build` → 部署 Pages artifact
- 发布源：`dist/` 纯静态

### 9.3 渲染与图表

- 代码高亮：VitePress 内置 Shiki
- 数学公式：`markdown-it-katex` 或 `vitepress-plugin-math` + KaTeX CSS
- 流程图：Mermaid（`vitepress-plugin-mermaid`）

---

## 10. 平台验收策略

- `run` / `verify`：本地起站，确认骨架（首页 / 侧边栏 / 搜索 / 暗色 / 代码高亮 / 数学渲染）正常
- 用 **1 个 Simulation 样板 + 1 个 API 样板**演示验证两类原型与 §4 契约打通（样板仅为验证平台，非正式内容）
- `code-review` / `simplify`：审平台代码
- `security-review`：审 API key 处理
- 具体章节 / 演示的验收属内容阶段，不在本 spec

---

## 11. AI 实现 skill 链（平台搭建阶段）

| 阶段 | Skill | 产出 |
|---|---|---|
| 架构 | brainstorming（本文件） | 本 spec |
| 拆计划 | writing-plans | **平台**实现计划 |
| 隔离 | using-git-worktrees | 独立 worktree |
| 实现 | subagent-driven-development / dispatching-parallel-agents | 按模块并行搭平台 |
| API 设施 | claude-api | provider 调用、CORS、key、定价 |
| 质量 | code-review + simplify | 干净 diff |
| 验收 | run + verify | 平台跑起来 |
| 安全 | security-review | key 不外泄 |
| 收尾 | finishing-a-development-branch | 合并 / PR |
| 辅助 | init（CLAUDE.md）+ fewer-permission-prompts | 减少 session 摩擦 |

> **内容侧**（章节 / 演示的批量生成）是**独立的后续 spec / 计划**，复用本平台的契约；skill 链类似，但产出是内容，不走本 spec。

---

## 12. 后续步骤

1. 作者审阅本架构 spec
2. 架构定后进 `writing-plans`，拆**平台**实现计划
3. 内容规划另行启动，按 §4 契约接入（与平台工作互不阻塞）
