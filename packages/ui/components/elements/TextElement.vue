<template>
  <div class="el-text" :style="boxStyle" v-html="val.text || ''" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ val: Record<string, any>; meta?: Record<string, any> }>()
const boxStyle = computed(() => {
  const v = props.val
  const bw = v.borderWidth ?? 0
  return {
    ...(bw > 0 ? { border: `${bw}px ${v.borderStyle || 'solid'} ${v.borderColor || '#e5e7eb'}` } : {}),
    borderRadius:    v.borderRadius ? `${v.borderRadius}px` : undefined,
    backgroundColor: v.bgColor      || undefined,
    padding:         v.padding      ? `${v.padding}px`      : undefined,
  }
})
</script>

<style scoped>
.el-text { line-height: 1.6; word-break: break-word; }
.el-text :deep(p)         { margin: 0 0 6px; }
.el-text :deep(p:last-child) { margin-bottom: 0; }
.el-text :deep(h1)        { margin: 0 0 8px; font-size: 2em; }
.el-text :deep(h2)        { margin: 0 0 8px; font-size: 1.5em; }
.el-text :deep(h3)        { margin: 0 0 6px; font-size: 1.17em; }
.el-text :deep(ul),
.el-text :deep(ol)        { margin: 0 0 6px; padding-left: 1.4em; }
.el-text :deep(strong)    { font-weight: 700; }
.el-text :deep(em)        { font-style: italic; }
.el-text :deep(a)         { color: #0891B2; text-decoration: underline; }
</style>
