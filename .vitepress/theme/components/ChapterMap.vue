<script setup lang="ts">
import { withBase } from 'vitepress'

type Ch = { n: string; title: string; link?: string }
type Part = { tag: string; name: string; chapters: Ch[] }

// 全书 14 章地图；已写成的给 link，待写的灰显
const parts: Part[] = [
  {
    tag: 'Part 0',
    name: '导览',
    chapters: [
      { n: '00', title: '全景导览 + 先跑一个 agent' }
    ]
  },
  {
    tag: 'Part A',
    name: '原理骨',
    chapters: [
      { n: '01', title: '机器到底怎么"学"', link: withBase('/chapters/ch001') },
      { n: '02', title: '神经网络：把简单的拼成强大的' },
      { n: '03', title: '监督学习：给答案，学规律' },
      { n: '04', title: '强化学习：给奖励，学策略' }
    ]
  },
  {
    tag: 'Part B',
    name: 'LLM 核心',
    chapters: [
      { n: '05', title: '大模型 = 下一个 token 的概率函数' },
      { n: '06', title: 'Transformer：读懂上下文的架构' },
      { n: '07', title: '训练：把概率函数烤进去' },
      { n: '08', title: '推理：概率函数跑起来' }
    ]
  },
  {
    tag: 'Part C',
    name: 'LLM 工程应用',
    chapters: [
      { n: '09', title: '提示词工程' },
      { n: '10', title: '上下文工程' },
      { n: '11', title: 'Harness 工程' },
      { n: '12', title: 'Agent 工程' },
      { n: '13', title: '收尾：把整条线收起来' }
    ]
  }
]
</script>

<template>
  <section class="cmap">
    <header class="cmap__head">
      <span class="cmap__eyebrow">全书地图</span>
      <h2 class="cmap__title">从一个神经元到一个 agent，一根线串起 14 章</h2>
    </header>
    <div class="cmap__grid">
      <div v-for="p in parts" :key="p.tag" class="cmap__part">
        <div class="cmap__parthead">
          <span class="cmap__tag">{{ p.tag }}</span>
          <span class="cmap__pname">{{ p.name }}</span>
        </div>
        <ul class="cmap__list">
          <li
            v-for="c in p.chapters"
            :key="c.n"
            :class="['cmap__item', c.link ? 'is-link' : 'is-plan']"
          >
            <a v-if="c.link" :href="c.link">
              <span class="cmap__num">{{ c.n }}</span>
              <span class="cmap__label">{{ c.title }}</span>
              <span class="cmap__arrow">→</span>
            </a>
            <span v-else>
              <span class="cmap__num">{{ c.n }}</span>
              <span class="cmap__label">{{ c.title }}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cmap {
  max-width: 1152px;
  margin: 0 auto;
  padding: 56px 24px 24px;
}
.cmap__head { margin-bottom: 28px; }
.cmap__eyebrow {
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-eyebrow);
  letter-spacing: 0.06em;
  color: var(--vp-c-brand-1);
}
.cmap__title {
  margin: 8px 0 0;
  font-size: var(--fs-display);
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.cmap__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.cmap__part {
  padding: 20px 18px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.cmap__part:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}
.cmap__parthead {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cmap__tag {
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
}
.cmap__pname {
  font-size: var(--fs-title);
  font-weight: 650;
  color: var(--vp-c-text-1);
}
.cmap__list { list-style: none; margin: 0; padding: 0; }
.cmap__item { margin-bottom: 10px; line-height: 1.45; }
.cmap__item a,
.cmap__item > span {
  display: flex;
  align-items: baseline;
  gap: 8px;
  text-decoration: none;
  padding: 4px 0;
}
.cmap__num {
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-label);
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  min-width: 1.5em;
}
.cmap__label { font-size: var(--fs-meta); }
.is-link .cmap__label { color: var(--vp-c-brand-1); font-weight: 500; }
.is-link .cmap__arrow { margin-left: auto; color: var(--vp-c-brand-1); opacity: 0; transition: opacity 0.2s, transform 0.2s; }
.is-link:hover .cmap__arrow { opacity: 1; transform: translateX(3px); }
.is-plan .cmap__label { color: var(--vp-c-text-3); }
.is-plan .cmap__num { color: var(--vp-c-text-3); opacity: 0.5; }

@media (max-width: 900px) {
  .cmap__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .cmap__grid { grid-template-columns: 1fr; }
  .cmap__title { font-size: 1.3rem; }
}
</style>
