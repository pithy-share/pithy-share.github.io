<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ title?: string; hint?: string }>()

// 重置 = 改 key 让挂载的演示组件整个重建，状态归零
const resetKey = ref(0)
function reset() {
  resetKey.value++
}
</script>

<template>
  <div class="demo-frame">
    <div class="demo-frame__head">
      <div class="demo-frame__heading">
        <div v-if="title" class="demo-frame__title">{{ title }}</div>
        <div v-if="hint" class="demo-frame__hint">{{ hint }}</div>
      </div>
      <div class="demo-frame__status">
        <span class="demo-frame__status-dot"></span>
        <span class="demo-frame__status-text">交互演示</span>
      </div>
      <button class="demo-frame__reset" type="button" @click="reset">重置</button>
    </div>
    <div class="demo-frame__body" :key="resetKey">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.demo-frame {
  margin: 28px 0;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  position: relative;
}
.demo-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--vp-c-brand-1) 0%, var(--vp-c-brand-2) 100%);
  opacity: 0.6;
}
.demo-frame__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}
.demo-frame__heading {
  flex: 1;
  min-width: 0;
}
.demo-frame__title {
  font-weight: 650;
  font-size: var(--fs-title);
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.demo-frame__hint {
  margin-top: 3px;
  font-size: var(--fs-eyebrow);
  color: var(--vp-c-text-2);
  line-height: 1.4;
}
.demo-frame__status {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.demo-frame__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.demo-frame__status-text {
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-label);
  color: var(--vp-c-text-3);
}
.demo-frame__reset {
  flex-shrink: 0;
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-label);
  padding: 5px 14px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.demo-frame__reset:hover {
  background: var(--vp-c-brand-1);
  color: var(--vp-button-brand-text);
}
.demo-frame__body {
  padding: 20px;
  min-height: 40px;
}
@media (max-width: 500px) {
  .demo-frame__head { padding: 12px 14px; flex-wrap: wrap; }
  .demo-frame__body { padding: 14px; }
}
</style>
