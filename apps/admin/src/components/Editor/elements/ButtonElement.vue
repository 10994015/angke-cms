<template>
  <div class="el-button-wrap" :style="{ textAlign: val.align || 'center' }">
    <a
      class="el-button"
      href="#"
      :style="{
        color:           val.textColor || '#fff',
        backgroundColor: val.bgColor   || '#0891B2',
        fontSize:        ensureUnit(val.fontSize, '16px'),
        padding:         ensureUnit(val.padding,  '12px 32px'),
        borderRadius:    val.borderRadius || '6px',
      }"
    >{{ val.text || '按鈕' }}</a>
  </div>
</template>

<script setup>
import { ensureUnit } from '@/utils/ensureUnit'

defineProps({
  val:  { type: Object, default: () => ({}) },
  meta: { type: Object, default: () => ({}) },
})
</script>

<style scoped lang="scss">
.el-button-wrap {
  width: 100%;
  padding: 0.5rem 0;
}

.el-button {
  display: inline-block;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: default;
  transition: opacity 0.2s;
}
</style>
