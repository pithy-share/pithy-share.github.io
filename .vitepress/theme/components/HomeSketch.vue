<script setup lang="ts">
import { ref, onMounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

// 固定种子随机
function makeRand(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
}
const rand = makeRand(42)

// 生成 loss 曲线数据：从高 loss 逐渐下降
const steps = 120
const lossData: number[] = []
let currentLoss = 8.0
for (let i = 0; i < steps; i++) {
  const progress = i / steps
  const noise = (rand() - 0.5) * 0.3
  const decay = 8.0 * Math.exp(-progress * 4)
  currentLoss = Math.max(0.1, decay + noise)
  lossData.push(currentLoss)
}

// 画布尺寸
const CANVAS_W = 640
const CANVAS_H = 200

onMounted(() => {
  const c = canvasRef.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  c.width = CANVAS_W * dpr
  c.height = CANVAS_H * dpr
  c.style.width = CANVAS_W + 'px'
  c.style.height = CANVAS_H + 'px'

  const ctx = c.getContext('2d')!
  ctx.scale(dpr, dpr)

  // 主题色
  const isDark = document.documentElement.classList.contains('dark')
  const colors = {
    grid: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(26,29,35,0.05)',
    axis: isDark ? '#222838' : '#E1E4EA',
    brand: isDark ? '#6E8AFF' : '#2D4EF5',
    brandSoft: isDark ? 'rgba(110,138,255,0.12)' : 'rgba(45,78,245,0.08)',
    text: isDark ? '#6B7384' : '#8A91A0',
    paper: isDark ? '#161A24' : '#FFFFFF',
  }

  // 坐标映射
  const pad = { top: 20, right: 40, bottom: 30, left: 50 }
  const plotW = CANVAS_W - pad.left - pad.right
  const plotH = CANVAS_H - pad.top - pad.bottom
  const maxLoss = Math.max(...lossData) * 1.1

  const px = (i: number) => pad.left + (i / (steps - 1)) * plotW
  const py = (l: number) => pad.top + plotH - (l / maxLoss) * plotH

  // 绘制背景网格
  function drawGrid() {
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 1
    for (let i = 0; i <= 8; i++) {
      const y = pad.top + (i / 8) * plotH
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(CANVAS_W - pad.right, y); ctx.stroke()
    }
    for (let i = 0; i <= 10; i++) {
      const x = pad.left + (i / 10) * plotW
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, CANVAS_H - pad.bottom); ctx.stroke()
    }
  }

  // 绘制坐标轴
  function drawAxes() {
    ctx.strokeStyle = colors.axis
    ctx.lineWidth = 1.5
    // Y轴
    ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, CANVAS_H - pad.bottom); ctx.stroke()
    // X轴
    ctx.beginPath(); ctx.moveTo(pad.left, CANVAS_H - pad.bottom); ctx.lineTo(CANVAS_W - pad.right, CANVAS_H - pad.bottom); ctx.stroke()

    // 标签
    ctx.fillStyle = colors.text
    ctx.font = '11px "JetBrains Mono", monospace'
    ctx.textAlign = 'right'
    ctx.fillText('loss', pad.left - 8, pad.top + 4)
    ctx.textAlign = 'end'
    ctx.fillText('step →', CANVAS_W - pad.right, CANVAS_H - 6)
  }

  // 动画绘制
  let currentStep = 0
  const speed = 2 // 每帧前进的步数

  function animate() {
    if (currentStep >= steps) return

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    drawGrid()
    drawAxes()

    // 绘制已完成的曲线区域
    if (currentStep > 1) {
      ctx.beginPath()
      ctx.moveTo(px(0), py(lossData[0]))
      for (let i = 1; i < currentStep; i++) {
        ctx.lineTo(px(i), py(lossData[i]))
      }
      ctx.lineTo(px(currentStep - 1), CANVAS_H - pad.bottom)
      ctx.lineTo(px(0), CANVAS_H - pad.bottom)
      ctx.closePath()
      ctx.fillStyle = colors.brandSoft
      ctx.fill()
    }

    // 绘制已完成的曲线
    if (currentStep > 1) {
      ctx.beginPath()
      ctx.moveTo(px(0), py(lossData[0]))
      for (let i = 1; i < currentStep; i++) {
        ctx.lineTo(px(i), py(lossData[i]))
      }
      ctx.strokeStyle = colors.brand
      ctx.lineWidth = 2.6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    }

    // 绘制当前点
    if (currentStep > 0) {
      const cx = px(currentStep - 1)
      const cy = py(lossData[currentStep - 1])
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = colors.brand
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, 8, 0, Math.PI * 2)
      ctx.fillStyle = colors.brandSoft
      ctx.fill()
    }

    // 浮动数据标签
    if (currentStep > 10 && currentStep < steps - 10) {
      const idx = Math.floor(currentStep / 2)
      const lx = px(idx)
      const ly = py(lossData[idx])
      ctx.fillStyle = colors.text
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`step ${idx}`, lx, ly - 12)
    }

    currentStep += speed
    requestAnimationFrame(animate)
  }

  drawGrid()
  drawAxes()
  setTimeout(() => animate(), 300)
})
</script>

<template>
  <div class="sketch">
    <canvas ref="canvasRef" class="sketch__canvas"></canvas>
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
.sketch__canvas {
  width: 100%;
  max-width: 640px;
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.sketch__caption {
  margin: 10px 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-eyebrow);
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>
