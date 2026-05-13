<template>
  <div class="el-hline">
    <hr :style="{
      borderColor:    val.color     || '#E0E0E0',
      borderTopWidth: ensureUnit(val.thickness, '2px'),
      borderTopStyle: val.style     || 'solid',
      width:          ensureUnit(val.width, '100%'),
    }" />
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
.el-hline {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;

  hr {
    margin: 0;
    border: none;
    border-top-style: solid;
  }
}
</style>
