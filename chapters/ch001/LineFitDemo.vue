<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// ---- 固定种子的数据：y ≈ 2x + 3 + 噪声 ----
function makeRand(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
}
const rand = makeRand(1)
const TRUE_W = 2
const TRUE_B = 3
const xs: number[] = []
const ys: number[] = []
for (let i = -20; i <= 20; i++) {
  const x = 0.1 * i
  xs.push(x)
  ys.push(TRUE_W * x + TRUE_B + (rand() - 0.5) * 0.4)
}
const N = xs.length

// 画布坐标范围
const X_MIN = -2.2, X_MAX = 2.2
const Y_MIN = -2, Y_MAX = 9

// ---- 状态 ----
const w = ref(0)
const b = ref(0)
const lr = ref(0.02)
const running = ref(false)
const stepCount = ref(0)
const currentLoss = ref(0)
const lossHistory = ref<number[]>([])

const root = ref<HTMLElement | null>(null)
const scatter = ref<HTMLCanvasElement | null>(null)
const lossCv = ref<HTMLCanvasElement | null>(null)
let raf = 0
let ro: ResizeObserver | null = null

// ---- 梯度下降（全批量）----
function gradStep() {
  let gw = 0, gb = 0
  for (let i = 0; i < N; i++) {
    const err = w.value * xs[i] + b.value - ys[i]
    gw += 2 * err * xs[i]
    gb += 2 * err
  }
  gw /= N
  gb /= N
  w.value -= lr.value * gw
  b.value -= lr.value * gb
  let l = 0
  for (let i = 0; i < N; i++) {
    const e = w.value * xs[i] + b.value - ys[i]
    l += e * e
  }
  currentLoss.value = l / N
  lossHistory.value.push(currentLoss.value)
  stepCount.value++
}

function tick() {
  for (let k = 0; k < 3; k++) {
    if (stepCount.value < 3000) gradStep()
  }
  draw()
  const diverged = !isFinite(currentLoss.value) || currentLoss.value > 1e4
  if (running.value && stepCount.value < 3000 && !diverged) {
    raf = requestAnimationFrame(tick)
  } else {
    running.value = false
  }
}

function toggleRun() {
  if (running.value) {
    running.value = false
    if (raf) cancelAnimationFrame(raf)
  } else {
    running.value = true
    raf = requestAnimationFrame(tick)
  }
}

// ---- 画布尺寸（高 DPI + 响应式）----
function sizeAll() {
  for (const c of [scatter.value, lossCv.value]) {
    if (!c) continue
    const dpr = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = Math.round(rect.width * dpr)
    c.height = Math.round(rect.height * dpr)
    c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
}

function drawScatter() {
  const c = scatter.value
  if (!c) return
  const ctx = c.getContext('2d')!
  const rect = c.getBoundingClientRect()
  const W = rect.width, H = rect.height
  ctx.clearRect(0, 0, W, H)
  const pad = 30
  const px = (x: number) => pad + (x - X_MIN) / (X_MAX - X_MIN) * (W - 2 * pad)
  const py = (y: number) => H - pad - (y - Y_MIN) / (Y_MAX - Y_MIN) * (H - 2 * pad)
  // 坐标轴
  ctx.strokeStyle = '#999'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(pad, py(0)); ctx.lineTo(W - pad, py(0)); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(px(0), pad); ctx.lineTo(px(0), H - pad); ctx.stroke()
  // 数据点
  ctx.fillStyle = '#3aa76d'
  for (let i = 0; i < N; i++) {
    ctx.beginPath(); ctx.arc(px(xs[i]), py(ys[i]), 3, 0, Math.PI * 2); ctx.fill()
  }
  // 拟合直线
  ctx.strokeStyle = '#e5484d'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(px(X_MIN), py(w.value * X_MIN + b.value))
  ctx.lineTo(px(X_MAX), py(w.value * X_MAX + b.value))
  ctx.stroke()
}

function drawLoss() {
  const c = lossCv.value
  if (!c) return
  const ctx = c.getContext('2d')!
  const rect = c.getBoundingClientRect()
  const W = rect.width, H = rect.height
  ctx.clearRect(0, 0, W, H)
  const pad = 24
  const hist = lossHistory.value
  if (hist.length < 2) {
    ctx.fillStyle = '#999'
    ctx.font = '13px sans-serif'
    ctx.fillText('点"运行"开始训练', pad, H / 2)
    return
  }
  const maxL = Math.max(...hist)
  const px = (i: number) => pad + (i / (hist.length - 1)) * (W - 2 * pad)
  const py = (l: number) => H - pad - (l / maxL) * (H - 2 * pad)
  ctx.strokeStyle = '#4a90e2'
  ctx.lineWidth = 2
  ctx.beginPath()
  hist.forEach((l, i) => (i ? ctx.lineTo(px(i), py(l)) : ctx.moveTo(px(i), py(l))))
  ctx.stroke()
}

function draw() {
  drawScatter()
  drawLoss()
}

onMounted(() => {
  sizeAll()
  draw()
  ro = new ResizeObserver(() => { sizeAll(); draw() })
  if (root.value) ro.observe(root.value)
})

onBeforeUnmount(() => {
  running.value = false
  if (raf) cancelAnimationFrame(raf)
  ro?.disconnect()
})
</script>

<template>
  <div ref="root" class="lfd">
    <div class="lfd__row">
      <div class="lfd__panel">
        <div class="lfd__label">数据点 + 拟合直线</div>
        <canvas ref="scatter" class="lfd__canvas"></canvas>
      </div>
      <div class="lfd__panel">
        <div class="lfd__label">损失曲线</div>
        <canvas ref="lossCv" class="lfd__canvas lfd__canvas--sm"></canvas>
      </div>
    </div>
    <div class="lfd__ctrl">
      <button class="lfd__btn" type="button" @click="toggleRun">
        {{ running ? '暂停' : (stepCount > 0 ? '继续' : '运行') }}
      </button>
      <label class="lfd__slider">
        学习率 lr = <b>{{ lr.toFixed(3) }}</b>
        <input type="range" min="0.001" max="0.2" step="0.001" v-model.number="lr" />
      </label>
      <span class="lfd__stat">
        步骤 {{ stepCount }} · w = {{ w.toFixed(3) }} · b = {{ b.toFixed(3) }} · loss = {{ currentLoss.toFixed(4) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.lfd__row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.lfd__panel {
  flex: 1 1 280px;
}
.lfd__label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}
.lfd__canvas {
  width: 100%;
  height: 260px;
  display: block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}
.lfd__canvas--sm {
  height: 160px;
}
.lfd__ctrl {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 12px;
  font-size: 0.85rem;
}
.lfd__btn {
  padding: 4px 16px;
  border: 1px solid var(--vp-c-brand);
  border-radius: 6px;
  background: var(--vp-c-brand);
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
}
.lfd__slider input[type='range'] {
  width: 180px;
  vertical-align: middle;
}
.lfd__stat {
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}
</style>
