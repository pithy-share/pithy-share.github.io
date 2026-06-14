# 《从0到1理解AI》网站架构 Spec

> 日期：2026-06-14
> 状态：架构已定（混合模型：VitePress 外壳 + 零依赖 vanilla JS 演示 + 实时编辑 Playground），待作者审阅 → writing-plans
>
> **范围声明**：本文档只定义技术架构与平台基础设施。内容（章节清单、正文、具体演示逻辑）见 [内容创作 spec](./2026-06-14-content-creation.md)。核心约束：**演示代码零依赖、浏览器可单独运行**；站点外壳保留构建工具。

---

## 1. 核心约束与原则

- **演示代码零依赖、可单独运行**：演示是 vanilla JavaScript，只用浏览器原生 API（canvas / fetch / DOM 等），无 npm、无框架、无构建。复制出来粘进 `.html` 双击就能跑。
  - 为什么不能用 Vue SFC / TS：`.vue` 要编译、TS 类型注解要转译、Vue 依赖运行时——三者都违背"零依赖、直接跑"。**所以演示语言锁死 JavaScript。**
- **站点外壳保留构建工具**：用 VitePress 拿侧边栏 / 搜索 / 暗色 / 代码高亮，构建成纯静态发 GitHub Pages。
- **演示可实时改、实时看效果**：每个演示内嵌一个 **Playground**——文本框显示源码，读者改完点运行，立刻看到输出。
- **平台与内容解耦**：平台提供 Playground 容器与契约；内容侧只写 vanilla JS 演示片段往里塞，互不耦合。
- **AI 可建性优先**：选型让 AI 要写的平台代码最少、幻觉面最小。

---

## 2. 选型

- **站点外壳**：VitePress（Vue 3 静态文档/书籍生成器）。侧边栏/搜索/暗色/Shiki 高亮全在 config 开，Markdown 优先 = AI 写作最强格式。
- **演示**：**vanilla JavaScript**，零依赖。**不进 Vite 模块图参与构建**，作为字符串（`?raw` 导入）喂给 Playground。
- **不选**：Vue SFC 演示（违背零依赖）、Astro/Next（大材小用）、纯手写无框架外壳（14 章缺导航/搜索，维护累）。

---

## 3. 站点骨架

```
ai-learn/
├── .vitepress/
│   ├── config.ts            # nav / sidebar / base / 主题
│   ├── theme/index.ts       # 注册 Playground 等全局组件
│   └── cache/
├── public/                  # 静态资源（favicon、图解等）
├── chapters/                # 章节 Markdown（数量/命名由内容侧定）
├── demos/                   # 演示源码（.js，零依赖 vanilla），每个一个文件
├── components/
│   ├── Playground.vue       # 核心：编辑器 + 运行 + 输出
│   └── ApiKeyInput.vue      # 粘 API key 入口
├── composables/
│   └── useApiKey.ts         # API key 读写（localStorage 单例）
├── index.md                 # 首页
└── package.json
```

`demos/*.js` 是**纯 vanilla JS 源码**，不 import 任何站点代码；Playground 读它当编辑器默认值。

---

## 4. 内容接入契约（平台与内容解耦的落点）

### 4.1 章节契约
- 一个章节 = `chapters/` 下一个 `.md`
- frontmatter：`title` / `order` / `part` / `draft`
- 正文 = 标准 Markdown + 嵌入 `<Playground>`
- 侧边栏由 config 按 frontmatter 自动生成，新增章节无需手改 config

### 4.2 演示契约（vanilla JS）
每个演示 = `demos/` 下一个 `.js` 文件，必须满足：
- **零依赖**：只用浏览器原生 API，不 import 任何东西
- **自包含**：单文件可独立运行（粘进 `.html` 的 `<script>` 就能跑）
- **输出约定**：
  - 文本 → `console.log(...)`（Playground 自动捕获到输出面板）
  - 图形 → 往一个 id 为 `canvas` 的 canvas 画（Playground 提供）
  - API → 用全局 `API_KEY`（Playground 运行前注入）调 `fetch`
- **可重入**：每次运行从干净状态开始（Playground 每次重建 iframe）

### 4.3 在章节里挂演示
```md
<script setup>
import lineFit from '../demos/line-fitting.js?raw'
</script>

<Playground :code="lineFit" title="线性回归：看参数自己滑到对的位置" />
```
（`?raw` 把 `.js` 当字符串导入。）→ 内容侧只"写 .js + 引用"，不碰平台。

---

## 5. `<Playground>` 组件（核心新增）

职责：给读者一个"改代码 + 运行 + 看结果"的沙盒。

- **编辑器**：`<textarea>`（等宽、Tab 缩进），预填演示源码；"重置"恢复原文
- **运行**：取 textarea 内容，丢进一个 **iframe（srcdoc）** 执行
- **输出**：
  - 监听 iframe 的 `postMessage`，把 `console.log` 显示到 `<pre>` 面板
  - canvas 演示：iframe 内有 `<canvas id="canvas">`，直接渲染
- **隔离**：iframe 沙盒，读者代码崩了不殃及页面
- **错误**：捕获 → 中文提示到输出面板
- **API key**：演示运行前，把 key 作为全局 `API_KEY` 注入 iframe

iframe srcdoc 模板（示意）：
```html
<!DOCTYPE html><body>
<canvas id="canvas"></canvas>
<script>
  const log = (...a) => parent.postMessage({ type:'log', data: a.join(' ') }, '*');
  console.log = log; console.error = log;
  window.API_KEY = '<注入的 key，无则空串>';
  try {
    /* ===== 读者代码 ===== */
  } catch (e) {
    parent.postMessage({ type:'error', data: String(e) }, '*');
  }
</script>
</body>
```

全浏览器原生 API，**演示逻辑零依赖**；这段 bootstrap 是平台管道，不算演示的依赖。

---

## 6. 演示的两种原型

- **Simulation（无网络）**：canvas 动画 / 曲线 / 热力图，演示原理（梯度下降、注意力、采样）。vanilla JS + canvas + `requestAnimationFrame`，离线可跑。**这是原理章（Part A / B）演示的主形态——可视化是这类教程的重头，平台须把 canvas 支持做成一等公民。**
- **API-backed（真实模型）**：`fetch` 直连 provider，用注入的 `API_KEY`，演示提示词 / 采样 / agent。须处理"无 key"分支（渲染 `<ApiKeyInput>`）。Anthropic 需 header `anthropic-dangerous-direct-browser-access: true`。

两种都是 vanilla JS，区别只是用不用 `fetch`。

---

## 7. 共享基础设施

- **`useApiKey`**：localStorage 单例，键名 `ai-learn:api-key:<provider>`；暴露 `getKey/setKey/clearKey/hasKey`（响应式）；模块级 + `ref`，无需 pinia
- **`<ApiKeyInput>`**：粘 key 入口 + provider 选择 + 记住/清除；key 不入 URL、不 `console.log`、清除时移出内存
- **`<Playground>`**：见 §5

---

## 8. 数据流（API 演示）

```
读者粘 key → useApiKey 存 localStorage
   ↓
Playground 运行前把 key 注入 iframe 全局 API_KEY
   ↓
演示 fetch(provider, { headers: { Authorization: API_KEY } })
   ↓
provider 直接返回 → 演示渲染 → key 全程只在浏览器
```

**没有后端。** GitHub Pages 静态站 + 浏览器直连 provider，零运维、零 key 托管。

---

## 9. 错误处理

- **演示运行**：iframe 内 try-catch → postMessage `error` → Playground 输出面板中文提示
- **API**：401（key 错）/ 429（限流）/ 网络 / 超时 → 演示自行 catch 提示，或 Playground 兜底；key 错引导回 `<ApiKeyInput>`
- **构建**：build 失败 → CI 红，阻塞部署

---

## 10. 构建与部署

### 10.1 本地
```bash
npm install
npm run docs:dev      # 开发预览
npm run docs:build    # 输出到 .vitepress/dist
npm run docs:preview  # 预览构建产物
```

### 10.2 GitHub Pages
- **base 路径（关键 gotcha）**：项目站 `https://<user>.github.io/<repo>/` → `base: '/<repo>/'`；用户/组织站 → `base: '/'`。这是 VitePress 上 Pages 最常见的"白屏/资源 404"原因。
- **CI**：GitHub Actions，`main` 推送 → `docs:build` → 部署 Pages artifact
- 发布源：`dist/` 纯静态

### 10.3 渲染
- 代码高亮：VitePress 内置 Shiki
- **不需要 KaTeX**（内容侧不写数学公式，省一个依赖）
- 流程图按需 Mermaid

---

## 11. 平台验收

- `run` / `verify`：本地起站，确认骨架（首页 / 侧边栏 / 搜索 / 暗色 / 代码高亮）正常
- **Playground 验收（关键）**：1 个 console 演示（梯度下降打印）+ 1 个 canvas 演示 + 1 个 API 演示，验证：预填代码能跑、改完重跑生效、console 捕获、canvas 渲染、key 注入、错误提示
- `security-review`：API key 处理；iframe 沙盒不外泄
- 章节验收属内容阶段，不在本 spec

---

## 12. AI 实现 skill 链（平台阶段）

| 阶段 | Skill | 产出 |
|---|---|---|
| 架构 | brainstorming（本文件） | 本 spec |
| 拆计划 | writing-plans | 平台实现计划 |
| 隔离 | using-git-worktrees | 独立 worktree |
| 实现 | subagent-driven-development | 按模块搭平台 |
| API 设施 | claude-api | provider 调用 / CORS / key |
| 质量 | code-review + simplify | 干净 diff |
| 验收 | run + verify | 平台 + Playground 跑起来 |
| 安全 | security-review | key 不外泄、沙盒安全 |
| 收尾 | finishing-a-development-branch | 合并 / PR |

---

## 13. 后续步骤

1. 作者审阅本架构 spec
2. 架构定后进 `writing-plans`，拆**平台**实现计划（VitePress 外壳 + Playground + API 设施）
3. 内容侧按 §4 契约生成章节 + 演示（与平台工作互不阻塞；Ch1 的 vanilla JS 已符合契约，待 Playground 接入）
