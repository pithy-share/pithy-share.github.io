import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// 侧边栏分组顺序
const PART_ORDER = ['导览', '原理骨', 'LLM 核心', 'LLM 工程应用']

type Chapter = { title: string; order: number; part: string; link: string }

// 极简 frontmatter 解析（只认 key: value 单行），避免引入 gray-matter 依赖
function parseFrontmatter(src: string): Record<string, unknown> {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const fm: Record<string, unknown> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const k = line.slice(0, idx).trim()
    let v: unknown = line.slice(idx + 1).trim()
    if (typeof v === 'string') {
      if (/^-?\d+$/.test(v)) v = Number(v)
      else if (v === 'true') v = true
      else if (v === 'false') v = false
      else v = v.replace(/^["']|["']$/g, '')
    }
    fm[k] = v
  }
  return fm
}

// 扫描 chapters/ 下所有 .md，按 frontmatter 收集
function collectChapters(): Chapter[] {
  const root = join(process.cwd(), 'chapters')
  const out: Chapter[] = []
  function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) { walk(full); continue }
      if (!name.endsWith('.md')) continue
      const fm = parseFrontmatter(readFileSync(full, 'utf8'))
      if (fm.draft === true) continue
      const rel = relative(root, full).replace(/\\/g, '/').replace(/\.md$/, '')
      const link = '/chapters/' + rel.replace(/\/?index$/, '')
      out.push({
        title: (fm.title as string) || name.replace(/\.md$/, ''),
        order: Number(fm.order ?? 9999),
        part: (fm.part as string) || '其他',
        link: link || '/chapters/'
      })
    }
  }
  walk(root)
  return out
}

// 按 part 分组、按 order 排序，生成侧边栏
function buildSidebar() {
  const chapters = collectChapters()
  const byPart = new Map<string, Chapter[]>()
  for (const c of chapters) {
    if (!byPart.has(c.part)) byPart.set(c.part, [])
    byPart.get(c.part)!.push(c)
  }
  const groups: { text: string; items: { text: string; link: string }[] }[] = []
  for (const p of PART_ORDER) {
    const items = byPart.get(p)
    if (!items?.length) continue
    items.sort((a, b) => a.order - b.order)
    groups.push({ text: p, items: items.map(c => ({ text: c.title, link: c.link })) })
  }
  return groups
}

export default defineConfig({
  title: '从0到1理解AI',
  description: '一份自己也能学懂的 AI 科普教材',
  base: '/ai-learn/',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['docs/**', 'node_modules'],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '目录', link: '/chapters/outline' }
    ],
    sidebar: buildSidebar(),
    search: { provider: 'local' },
    outline: { label: '本章内容' },
    docFooter: { prev: '上一章', next: '下一章' },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部'
  }
})
