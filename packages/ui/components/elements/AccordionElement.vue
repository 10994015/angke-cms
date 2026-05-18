<template>
  <div class="el-accordion">
    <div
      v-for="(item, i) in (val.items || [])"
      :key="i"
      class="el-accordion-item"
      :class="{ 'is-open': openSet.has(i) }"
    >
      <div
        class="el-accordion-header"
        :style="{
          color:      openSet.has(i) ? '#0891B2' : (val.titleColor || '#333'),
          fontSize:   ensureUnit(val.titleFontSize, '16px'),
          fontWeight: val.titleFontWeight || '600',
        }"
        @click.stop="toggle(i)"
      >
        <span class="el-accordion-title">{{ item.title || '標題' }}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          :style="{ transform: openSet.has(i) ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <Transition name="accordion">
        <div
          v-if="openSet.has(i)"
          class="el-accordion-body"
          :style="{ color: val.contentColor || '#666', fontSize: ensureUnit(val.contentFontSize, '15px') }"
        >
          {{ item.content }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ensureUnit } from '../../utils/ensureUnit.js'

const props = defineProps<{ val: Record<string, any>; meta?: Record<string, any> }>()

const openSet = ref(new Set<number>())

const initOpen = () => {
  openSet.value = props.val.defaultOpen ? new Set([0]) : new Set()
}

initOpen()
watch(() => props.val.defaultOpen, initOpen)

const toggle = (i: number) => {
  const s = new Set(openSet.value)
  if (s.has(i)) s.delete(i)
  else s.add(i)
  openSet.value = s
}
</script>

<style scoped>
.el-accordion { width: 100%; display: flex; flex-direction: column; gap: 6px; }

.el-accordion-item {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}
.el-accordion-item.is-open { border-color: #0891B2; box-shadow: 0 3px 12px rgba(8,145,178,0.12); }

.el-accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}
.el-accordion-header:hover { opacity: 0.85; }

.el-accordion-title { flex: 1; line-height: 1.5; }

.el-accordion-body {
  padding: 0 16px 14px;
  line-height: 1.7;
  white-space: pre-line;
  overflow: hidden;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease, padding 0.3s ease;
  max-height: 600px;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; }
</style>
