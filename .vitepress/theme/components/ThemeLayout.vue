<script setup lang="ts">
// 包一层默认 Layout，注入首页自定义块（签名 loss 曲线 + 全书地图）
import DefaultTheme from 'vitepress/theme'
import HomeSketch from './HomeSketch.vue'
import ChapterMap from './ChapterMap.vue'

const { Layout: VPLayout } = DefaultTheme
</script>

<template>
  <VPLayout>
    <template #home-hero-after>
      <HomeSketch />
    </template>
    <template #home-features-after>
      <ChapterMap />
    </template>
  </VPLayout>
</template>
