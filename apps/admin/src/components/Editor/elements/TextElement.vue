<template>
  <div
    class="el-text"
    v-html="val.text || '<p>（空白文字）</p>'"
  />
</template>

<script setup>
defineProps({
  val:  { type: Object, default: () => ({}) },
  meta: { type: Object, default: () => ({}) },
})
</script>

<style scoped lang="scss">
.el-text {
  line-height: 1.6;
  word-break: break-word;
  :deep(p)      { margin: 0 0 6px; &:last-child { margin-bottom: 0; } }
  :deep(h1)     { margin: 0 0 8px; font-size: 2em; }
  :deep(h2)     { margin: 0 0 8px; font-size: 1.5em; }
  :deep(h3)     { margin: 0 0 6px; font-size: 1.17em; }
  :deep(ul, ol) { margin: 0 0 6px; padding-left: 1.4em; }
  :deep(strong) { font-weight: 700; }
  :deep(em)     { font-style: italic; }
  :deep(a)      { color: #0891B2; text-decoration: underline; }
}
</style>
