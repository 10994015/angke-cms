<template>
  <div class="sys-frame-wrap" :class="{ 'is-selected': isSelected }" @click.stop="$emit('select-frame', frame)">

    <!-- 刪除按鈕（選取時顯示） -->
    <button
      v-if="isSelected"
      class="sys-delete-btn"
      @click.stop="handleDelete"
      title="刪除此功能總覽"
    >✕</button>

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
    <div v-else class="sys-placeholder">
      <div class="sys-placeholder-inner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
        <span>{{ frame.type }}</span>
      </div>
      <div class="sys-badge">功能總覽</div>
    </div>

  </div>
</template>

<script setup>
import HeroBannerElement   from './HeroBannerElement.vue'
import CarouselWallElement from './CarouselWallElement.vue'

const props = defineProps({
  frame:      { type: Object,  required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['select-frame', 'delete-frame'])

const handleDelete = () => {
  if (!confirm('確定要刪除此功能總覽嗎？')) return
  emit('delete-frame')
}
</script>

<style scoped lang="scss">
.sys-frame-wrap {
  position: relative;
  width: 100%;
  transition: box-shadow 0.2s;
  cursor: pointer;

  &:hover    { box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.25); }
  &.is-selected { box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.5); }
}

.sys-delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 50;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: #dc3545; color: #fff; }
}

.sys-placeholder {
  width: 100%;
  position: relative;
  background: #fafafa;
  border: 2px dashed #e5e7eb;
  transition: border-color 0.15s, background 0.15s;

  .sys-frame-wrap:hover & { border-color: rgba(8, 145, 178, 0.5); background: #f0f9ff; }
}

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
