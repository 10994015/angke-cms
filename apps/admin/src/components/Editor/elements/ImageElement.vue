<template>
  <div class="el-image" :class="{ 'el-image--empty': !val.src }">
    <div class="el-image-inner">
      <img
        :src="val.src || '/images/default.png'"
        :alt="val.alt || '圖片'"
        :style="{
          objectFit:    val.objectFit || 'cover',
          width:        ensureUnit(val.width, undefined),
          height:       ensureUnit(val.height, undefined),
          borderRadius: ensureUnit(val.borderRadius, undefined),
        }"
        class="el-image-img"
      />
    </div>
    <div v-if="!val.src" class="img-upload-overlay">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span>請上傳圖片</span>
    </div>
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
.el-image {
  width: 100%;
  max-width: 100%;
  display: block;
  position: relative;
  line-height: 0;

  &.el-image--empty { min-height: 180px; }
}

.el-image-inner {
  display: block;
  width: 100%;
}

.el-image-img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.img-upload-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.52);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 4px;
  letter-spacing: 0.03em;
  svg { width: 28px; height: 28px; opacity: 0.9; }
}
</style>
