<script setup lang="ts">
// 首页签名视觉：坐标纸上一条下降的 loss 曲线 ——「学习」长这样
</script>

<template>
  <div class="sketch">
    <svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg" role="img"
         aria-label="坐标纸上一条持续下降的损失曲线">
      <!-- 纸卡 -->
      <rect class="paper" x="1" y="1" width="638" height="198" rx="8" />
      <!-- 本地细格，让纸卡成形 -->
      <g class="grid">
        <line v-for="n in 19" :key="'v' + n" :x1="n * 32" y1="6" :x2="n * 32" y2="172" />
        <line v-for="n in 5" :key="'h' + n" x1="6" :y1="n * 32 + 8" x2="634" :y2="n * 32 + 8" />
      </g>
      <!-- 坐标轴 -->
      <g class="axes">
        <line x1="40" y1="20" x2="40" y2="168" />
        <line x1="40" y1="168" x2="624" y2="168" />
      </g>
      <!-- loss 面积 + 曲线 -->
      <path class="area"
            d="M40,44 C140,46 260,120 360,142 S520,156 612,152 L612,168 L40,168 Z" />
      <path class="curve"
            d="M40,44 C140,46 260,120 360,142 S520,156 612,152" />
      <!-- 起点 / 终点 -->
      <circle class="dot" cx="40" cy="44" r="3.5" />
      <circle class="dot" cx="612" cy="152" r="3.5" />
      <!-- 标注 -->
      <text class="lbl" x="40" y="14" text-anchor="start">loss</text>
      <text class="lbl" x="624" y="186" text-anchor="end">step →</text>
      <text class="ann" x="320" y="98" text-anchor="middle">学习 = loss 一路下降</text>
    </svg>
    <p class="sketch__caption">
      这就是「学习」——误差一点点往下掉，参数自己滑到对的位置。
    </p>
  </div>
</template>

<style scoped>
.sketch {
  max-width: 1152px;
  margin: 12px auto 0;
  padding: 0 24px;
}
svg {
  width: 100%;
  height: auto;
  display: block;
  max-height: 240px;
}
.paper {
  fill: var(--vp-c-bg-soft);
  stroke: var(--vp-c-divider);
  stroke-width: 1;
}
.grid line {
  stroke: var(--grid);
  stroke-width: 1;
}
.axes line {
  stroke: var(--vp-c-border);
  stroke-width: 1.4;
}
.area {
  fill: var(--vp-c-brand-1);
  fill-opacity: 0.08;
}
.curve {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.dot { fill: var(--vp-c-brand-1); }
.lbl {
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-axis);
  fill: var(--vp-c-text-3);
  letter-spacing: 0.04em;
}
.ann {
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-anno);
  fill: var(--vp-c-brand-1);
  letter-spacing: 0.02em;
}
.sketch__caption {
  margin: 10px 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-eyebrow);
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>
