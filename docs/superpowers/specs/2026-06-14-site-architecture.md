# 《从0到1理解AI》网站架构 Spec

> 日期：2026-06-14
> 状态：架构已定（VitePress 外壳 + Vue 3 SFC 演示，参数控件驱动），待作者审阅 → writing-plans
>
> **范围声明**：本文档只定义技术架构与平台基础设施。内容（章节清单、正文、演示逻辑）见 [内容创作 spec](./2026-06-14-content-creation.md)。核心：演示是 Vue 组件，用户通过界面参数控件交互，**不编辑代码**。

---

## 1. 范围与原则

- **平台与内容解耦**：架构定义插槽与契约，内容侧按契约填入，互不耦合。
- **演示交互模型**：演示是 Vue 组件，界面上有参数控件（滑块 / 输入 / 按钮）；用户调参数看效果，**不编辑代码**。受控、安全可发布——没有读者任意代码执行，没有沙盒泄 key 风险。

---

## 2. 选型：VitePress + Vue 3 + TypeScript

VitePress（Vue 3 静态文档 / 书籍生成器）+ Vue 3 SFC（`<script setup lang="ts">`）演示 + 全场 TS。

- Vue 3 + VitePress 训练数据覆盖最广、最稳，AI 幻觉风险最低
- 侧边栏 / 搜索 / 暗色 / 代码高亮（Shiki）全在 config 开，平台代码最少
- 单一 Vue 心智模型；Markdown 优先 = AI 写作最强格式

---

## 3. 站点骨架

```
ai-learn/
├── .vitepress/
│   ├── config.ts            # nav / sidebar / base / 主题
│   ├── theme/index.ts       # 主题扩展、注册全局组件
│   └── cache/
├── public/                  # 静态资源
├── chapters/                # 章节 Markdown
├── demos/                   # 演示 SFC（.vue，每个独立、自包含）
├── components/
│   ├── ApiKeyInput.vue      # 统一"粘 key"输入
│   └── DemoFrame.vue        # 演示外框（标题 / 说明 / 重置 / 错误）
├── composables/
│   └── useApiKey.ts         # API key 读写（localStorage 单例）
├── index.md
└── package.json
```

Node ≥ 18（VitePress 要求）。

---

## 4. 内容接入契约（核心）

### 4.1 章节契约
- 一个章节 = `chapters/` 下一个 `.md`，命名 `chNN-<slug>.md`
- frontmatter：`title` / `order` / `part` / `draft`（true 则不进侧边栏）
- `part` 取值与大纲对应：`导览`(Part 0) / `原理骨`(A) / `LLM 核心`(B) / `LLM 工程应用`(C)
- **侧边栏由 config 自动生成**（读 `chapters/` + frontmatter），新增章节无需手改 config

### 4.2 演示组件契约
每个演示 = `demos/` 下一个 `.vue` SFC：
- **自包含**：不 import 章节特定代码；只依赖共享基础设施（`useApiKey`、`components/*`）
- **参数控件驱动**：交互通过界面控件，用户不改代码
- **接口**：可选 props（如 `{ title? }`）；内部自管状态；可 reset
- **样式**：scoped，无全局副作用
- **可视化优先**：原理章用 canvas（高 DPI、响应式）

### 4.3 在章节里挂入
```md
<script setup>
import LineFitDemo from '../demos/LineFitDemo.vue'
</script>

<DemoFrame title="线性回归：参数自己滑到对的位置" hint="拖动学习率，看点怎么收敛">
  <LineFitDemo />
</DemoFrame>
```
VitePress 原生支持 Markdown 内写 Vue。一章可挂多个演示。

---

## 5. 演示组件的两种原型

### 5.1 Simulation（无网络）
纯原理可视化（参数滑动、动画、热力图、曲线）—— **原理章（Part A / B）的主形态**。canvas 用 `ref` + `onMounted` + `requestAnimationFrame`，控件用 Vue 响应式；**canvas 高 DPI 缩放 + 容器响应式**。零或仅轻量依赖，离线可跑。

### 5.2 API-backed（真实模型）
看真实模型响应的演示 —— 工程应用章（Part C）。`useApiKey()` 取 key → `fetch` 直连 provider → 响应式管理 请求 / loading / 结果（可流式）/ 错误。**必须处理"无 key"分支**（渲染 `<ApiKeyInput>`）。Anthropic 需 header `anthropic-dangerous-direct-browser-access: true`；OpenAI 标准 CORS。

---

## 6. 共享基础设施

- **`useApiKey`**：key 存 localStorage，全站复用；就 get / set 两件事。
- **`<ApiKeyInput>`**：一行提示 + 输入框，用户粘贴自己的 key。
- **`<DemoFrame>`**：演示外框——标题 / 一句话说明 / reset / 错误提示位；让所有演示视觉一致。

---

## 7. 数据流（API 演示）

读者粘 key → `useApiKey` 存 localStorage → 演示组件读 key → `fetch` 直连 provider → 渲染结果。**全程只在浏览器，没有后端。** GitHub Pages 静态站 + 浏览器直连 provider，零运维。

---

## 8. 错误处理

- **API 演示**：网络 / 401（key 错）/ 429（限流）/ 超时 → `<DemoFrame>` 统一捕获，中文提示 + 重试；key 错引导回 `<ApiKeyInput>`。
- **演示内部**：canvas / 动画异常用组件级 try-catch，不崩整页。
- **构建**：build 失败 → CI 红，阻塞部署。

---

## 9. 构建与部署

### 9.1 本地（Node ≥ 18）
```bash
npm install
npm run docs:dev      # 开发预览
npm run docs:build    # 输出到 .vitepress/dist
npm run docs:preview  # 预览构建产物
```

### 9.2 GitHub Pages
- **base 路径（关键 gotcha）**：项目站 `https://<user>.github.io/<repo>/` → `base: '/<repo>/'`；用户 / 组织站 → `base: '/'`。这是 VitePress 上 Pages 最常见的"白屏 / 资源 404"原因。
- **CI**：GitHub Actions，默认分支推送 → `docs:build` → 部署 Pages artifact。发布源 `dist/` 纯静态。

### 9.3 渲染
代码高亮用 VitePress 内置 Shiki；**不需要 KaTeX**（内容侧不写数学公式）；流程图按需 Mermaid。演示容器响应式、移动端可用、控件键盘可达。

---

## 10. 平台验收

- `run` / `verify`：本地起站，确认骨架（首页 / 侧边栏 / 搜索 / 暗色 / 代码高亮）正常。
- 用 **1 个 Simulation 样板 + 1 个 API 样板**验证两类原型与 §4 契约打通（样板仅为验证平台）。
- `code-review` / `simplify` 审平台代码。
- 章节 / 演示的具体验收属内容阶段。

---

## 11. 后续步骤

1. 作者审阅本架构 spec。
2. 进 `writing-plans`，拆**平台**实现计划（VitePress 外壳 + DemoFrame / useApiKey + 两类样板演示）。
3. 内容侧按 §4 契约生成章节 + 演示（与平台工作互不阻塞；Ch1 梯度下降逻辑待落成 Vue SFC 演示）。
