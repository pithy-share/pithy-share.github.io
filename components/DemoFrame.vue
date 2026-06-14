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
      <button class="demo-frame__reset" type="button" @click="reset">重置</button>
    </div>
    <div class="demo-frame__body" :key="resetKey">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.demo-frame {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  box-shadow: var(--vp-shadow-1);
}
.demo-frame__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.demo-frame__title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.demo-frame__hint {
  margin-top: 2px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}
.demo-frame__reset {
  flex-shrink: 0;
  font-size: 0.8rem;
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.demo-frame__reset:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}
.demo-frame__body {
  min-height: 40px;
}
</style>
