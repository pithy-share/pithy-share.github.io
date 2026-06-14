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
  margin: 28px 0;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}
.demo-frame__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
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
.demo-frame__reset {
  flex-shrink: 0;
  font-family: var(--vp-font-family-mono);
  font-size: var(--fs-label);
  padding: 4px 12px;
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
  padding: 18px;
  min-height: 40px;
}
@media (max-width: 500px) {
  .demo-frame__head { padding: 12px 14px; }
  .demo-frame__body { padding: 14px; }
}
</style>
