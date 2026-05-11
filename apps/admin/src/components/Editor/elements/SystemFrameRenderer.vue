<template>
  <!-- CAROUSEL_WALL -->
  <CarouselWallElement
    v-if="frame.type === 'CAROUSEL_WALL'"
    :frame-data="frame.data || {}"
    :frame="frame"
    :is-selected="isSelected"
    @select-frame="$emit('select-frame', $event)"
  />

  <!-- FIRST_PICTURE -->
  <HeroBannerElement
    v-else-if="frame.type === 'FIRST_PICTURE'"
    :frame-data="frame.data || {}"
    :frame="frame"
    :is-selected="isSelected"
    :is-edit-mode="true"
    @select-frame="$emit('select-frame', $event)"
  />

  <!-- 未知功能總覽 -->
  <div v-else class="sys-placeholder" @click.stop="$emit('select-frame', frame)">
    <div class="sys-placeholder-inner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
      </svg>
      <span>{{ frame.type }}</span>
    </div>
    <div class="sys-badge">功能總覽</div>
  </div>
</template>

<script setup>
import HeroBannerElement from './HeroBannerElement.vue'
import CarouselWallElement from './CarouselWallElement.vue'

const props = defineProps({
  frame:      { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

defineEmits(['select-frame'])
</script>

<style scoped lang="scss">
.sys-placeholder {
  width: 100%;
  position: relative;
  background: #fafafa;
  border: 2px dashed #e5e7eb;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover { border-color: rgba(8, 145, 178, 0.5); background: #f0f9ff; }
}

.sys-carousel-placeholder { min-height: 220px; }

.sys-placeholder-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 24px;
  color: #9ca3af;
  font-size: 13px;
  min-height: inherit;
}

.sys-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  color: #9ca3af;
  background: rgba(255,255,255,0.9);
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 2px 7px;
}
</style>
