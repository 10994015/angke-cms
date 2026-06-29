<template>
  <div class="el-button-wrap" :style="{ textAlign: val.align || 'center' }">
    <a
      class="el-button"
      :class="{ 'el-button--hover-colors': hasHoverColors }"
      :href="val.href || '#'"
      :target="val.href ? (val.target || '_blank') : undefined"
      :rel="val.href ? 'noopener noreferrer' : undefined"
      :style="{
        '--btn-color':       val.textColor || '#fff',
        '--btn-bg':          val.bgColor   || '#0891B2',
        '--btn-color-hover': val.hoverTextColor || val.textColor || '#fff',
        '--btn-bg-hover':    val.hoverBgColor   || val.bgColor   || '#0891B2',
        fontSize:        ensureUnit(val.fontSize, '16px'),
        padding:         ensureUnit(val.padding,  '12px 32px'),
        borderRadius:    val.borderRadius || '6px',
      }"
    >{{ val.text || '按鈕' }}</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ensureUnit } from '../../utils/ensureUnit.js'

const props = defineProps<{ val: Record<string, any>; meta?: Record<string, any> }>()

// 有設定任一 hover 顏色時，hover 改用該顏色（且不做半透明變暗）
const hasHoverColors = computed(() => !!(props.val.hoverBgColor || props.val.hoverTextColor))
</script>

<style scoped>
.el-button-wrap { width: 100%; padding: 0.5rem 0; }
.el-button {
  display: inline-block;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  /* 底色寫在 CSS（非 inline），:hover 才蓋得過 */
  background-color: var(--btn-bg);
  color: var(--btn-color);
  transition: background-color 0.2s, color 0.2s, opacity 0.2s;
}
/* 預設（未設定 hover 色）：沿用原本的微透明變暗 */
.el-button:hover {
  background-color: var(--btn-bg-hover);
  color: var(--btn-color-hover);
  opacity: 0.85;
}
/* 有設定 hover 色：精準套用該色、不變暗 */
.el-button--hover-colors:hover { opacity: 1; }
</style>
