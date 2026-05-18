<template>
  <div class="el-button-wrap" :style="{ textAlign: val.align || 'center' }">
    <a
      class="el-button"
      :href="val.href || '#'"
      :target="val.href ? (val.target || '_blank') : undefined"
      :rel="val.href ? 'noopener noreferrer' : undefined"
      :style="{
        color:           val.textColor   || '#fff',
        backgroundColor: val.bgColor     || '#0891B2',
        fontSize:        ensureUnit(val.fontSize, '16px'),
        padding:         ensureUnit(val.padding,  '12px 32px'),
        borderRadius:    val.borderRadius || '6px',
      }"
    >{{ val.text || '按鈕' }}</a>
  </div>
</template>

<script setup lang="ts">
import { ensureUnit } from '../../utils/ensureUnit.js'
defineProps<{ val: Record<string, any>; meta?: Record<string, any> }>()
</script>

<style scoped>
.el-button-wrap { width: 100%; padding: 0.5rem 0; }
.el-button {
  display: inline-block;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}
.el-button:hover { opacity: 0.85; }
</style>
