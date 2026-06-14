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
      <span class="demo-frame__title">{{ title }}</span>
      <button class="demo-frame__reset" type="button" @click="reset">重置</button>
    </div>
    <p v-if="hint" class="demo-frame__hint">{{ hint }}</p>
    <div class="demo-frame__body" :key="resetKey">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.demo-frame {
  margin: 16px 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}
.demo-frame__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.demo-frame__title {
  font-weight: 600;
  font-size: 0.95rem;
}
.demo-frame__reset {
  font-size: 0.8rem;
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.demo-frame__reset:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand);
}
.demo-frame__hint {
  margin: 0 0 12px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.demo-frame__body {
  min-height: 40px;
}
</style>
