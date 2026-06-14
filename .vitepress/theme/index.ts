import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ThemeLayout from './components/ThemeLayout.vue'
import DemoFrame from '../../components/DemoFrame.vue'
import './style.css'

// 全局注册共享组件，章节里直接用 <DemoFrame> 无需 import
export default {
  extends: DefaultTheme,
  Layout: ThemeLayout,
  enhanceApp({ app }) {
    app.component('DemoFrame', DemoFrame)
  }
} satisfies Theme
