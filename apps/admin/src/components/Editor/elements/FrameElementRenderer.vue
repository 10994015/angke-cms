<template>
  <div class="renderer" :class="{ 'is-empty': isEmpty, 'drag-over': isDragOver }">
    <!-- 空格子（僅編輯模式） -->
    <div v-if="isEmpty && isEditMode" class="drop-hint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>拖曳元件</span>
    </div>

    <!-- 元件內容 -->
    <template v-else-if="!isEmpty">
      <button v-if="isEditMode" class="delete-btn" @click.stop="$emit('delete', cellIndex)" title="刪除元件">✕</button>

      <component
        :is="currentComponent"
        v-if="currentComponent"
        :val="val"
        :meta="meta"
      />

      <!-- 未知類型 fallback -->
      <div v-else class="placeholder">
        <span>{{ type }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TextElement     from './TextElement.vue'
import ImageElement    from './ImageElement.vue'
import ButtonElement   from './ButtonElement.vue'
import CarouselElement from './CarouselElement.vue'
import MapElement      from './MapElement.vue'
import AccordionElement from './AccordionElement.vue'
import IframeElement   from './IframeElement.vue'
import HlineElement    from './HlineElement.vue'

const ELEMENT_MAP = {
  TEXT:         TextElement,
  IMG:          ImageElement,
  BUTTON:       ButtonElement,
  CAROUSEL_IMG: CarouselElement,
  GOOGLE_MAP:   MapElement,
  ACCORDION:    AccordionElement,
  IFRAME:       IframeElement,
  HORIZON_LINE: HlineElement,
}

const props = defineProps({
  element:    { type: Object, default: null },
  cellIndex:  { type: Number, required: true },
  cellKey:    { type: String, default: '' },
  isEditMode: { type: Boolean, default: false },
  isDragOver: { type: Boolean, default: false },
})

defineEmits(['delete'])

const isEmpty         = computed(() => !props.element || !props.element.type)
const type            = computed(() => props.element?.type)
const val             = computed(() => props.element?.value    || {})
const meta            = computed(() => props.element?.metadata || {})
const currentComponent = computed(() => ELEMENT_MAP[type.value] ?? null)
</script>

<style scoped lang="scss">
.renderer {
  width: 100%;
  min-height: 60px;
  height: auto;
  position: relative;
  transition: all 0.15s;

  &.drag-over {
    background: rgba(8, 145, 178, 0.08);
    outline: 2px dashed #0891B2;
    outline-offset: -2px;
    border-radius: 4px;
  }

  &.is-empty.drag-over .drop-hint { color: #0891B2; }
}

.drop-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 60px;
  color: #d1d5db;
  font-size: 11px;
  svg { width: 20px; height: 20px; }
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10;
  line-height: 1;
  transition: background 0.15s;

  .renderer:hover & { display: flex; }
  &:hover { background: #dc2626; }
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 6px;
  color: #9ca3af;
  text-align: center;
  min-height: 60px;

  svg   { width: 28px; height: 28px; }
  span  { font-size: 12px; }
  small { font-size: 11px; color: #d1d5db; word-break: break-all; }
}
</style>
