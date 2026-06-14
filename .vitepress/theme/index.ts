import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import DemoFrame from '../../components/DemoFrame.vue'

// 全局注册共享组件，章节里直接用 <DemoFrame> 无需 import
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoFrame', DemoFrame)
  }
} satisfies Theme
