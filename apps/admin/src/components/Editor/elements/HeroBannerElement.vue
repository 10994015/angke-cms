<template>
  <div
    class="hero-banner"
    :class="{ 'is-selected': isSelected, 'preview-mode': !isEditMode }"
    @click.stop="isEditMode ? handleClick() : null"
  >
    <div class="hero-container" :style="heroStyle">
      <div class="hero-overlay" :style="overlayStyle"></div>

      <div class="hero-content">
        <div class="text-box" :style="textBoxStyle">
          <h1 v-if="heroTitle" class="hero-title" :style="titleStyle">{{ heroTitle }}</h1>
          <p v-if="heroSubtitle" class="hero-subtitle" :style="subtitleStyle">{{ heroSubtitle }}</p>
          <div v-if="!heroTitle && !heroSubtitle && isEditMode" class="placeholder-text">
            <p>點擊首圖以編輯內容</p>
          </div>
        </div>
      </div>
    </div>

    <div class="edit-hint" v-if="isEditMode && !heroTitle && !heroSubtitle">
      <span>點擊此處編輯首圖</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const PLACEHOLDER_BG = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=600&fit=crop'

const props = defineProps({
  frameData: { type: Object, default: () => ({}) },
  frame:     { type: Object, default: null },
  isSelected: { type: Boolean, default: false },
  isEditMode: { type: Boolean, default: true },
})

const emit = defineEmits(['select-frame'])

const handleClick = () => emit('select-frame', props.frame)

const fd = (camel, snake, fallback) => {
  const val = props.frameData[camel] ?? props.frameData[snake]
  return val !== undefined && val !== null ? val : fallback
}

const backgroundImage = computed(() => props.frameData.heroBgImgSrc ?? props.frameData.hero_bg_img_src ?? PLACEHOLDER_BG)
const heroTitle       = computed(() => props.frameData.heroTitle ?? props.frameData.hero_title ?? '')
const heroSubtitle    = computed(() => props.frameData.heroSubtitle ?? props.frameData.hero_subtitle ?? '')
const overlayOpacity  = computed(() => {
  const val = props.frameData.overlayOpacity ?? props.frameData.overlay_opacity
  return val !== undefined && val !== null ? val / 100 : 0.4
})
const overlayColor         = computed(() => fd('overlayColor', 'overlay_color', '#000000'))
const textBoxBorderRadius  = computed(() => fd('textBoxBorderRadius', 'text_box_border_radius', '12px'))
const titleColor           = computed(() => fd('titleColor', 'title_color', '#ffffff'))
const titleFontSize        = computed(() => fd('titleFontSize', 'title_font_size', '48px'))
const subtitleColor        = computed(() => fd('subtitleColor', 'subtitle_color', '#eeeeee'))
const subtitleFontSize     = computed(() => fd('subtitleFontSize', 'subtitle_font_size', '20px'))

const heroStyle     = computed(() => ({ minHeight: fd('heroHeight', 'hero_height', '600px'), backgroundImage: `url(${backgroundImage.value})` }))
const overlayStyle  = computed(() => ({ backgroundColor: overlayColor.value, opacity: overlayOpacity.value }))
const textBoxStyle  = computed(() => ({ backgroundColor: 'transparent', borderRadius: textBoxBorderRadius.value }))
const titleStyle    = computed(() => ({ color: titleColor.value, fontSize: titleFontSize.value }))
const subtitleStyle = computed(() => ({ color: subtitleColor.value, fontSize: subtitleFontSize.value }))
</script>

<style lang="scss" scoped>
.hero-banner {
  width: 100%;
  position: relative;
  transition: all 0.2s;

  &:not(.preview-mode) {
    cursor: pointer;
    &:hover {
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.2);
      .edit-hint { opacity: 1; }
    }
    &.is-selected {
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.5);
      .edit-hint { opacity: 1; }
    }
  }
  &.preview-mode { cursor: default; pointer-events: none; }
}

.edit-hint {
  position: absolute;
  top: 20px; right: 20px;
  background: rgba(8, 145, 178, 0.9);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  z-index: 10;
}

.hero-container {
  position: relative;
  width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-box {
  background: transparent;
  padding: 60px 80px;
  border-radius: 12px;
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.hero-title    { font-size: 48px; font-weight: 700; color: #fff; margin: 0 0 20px; line-height: 1.2; }
.hero-subtitle { font-size: 20px; color: #eee; margin: 0; line-height: 1.6; }
.placeholder-text { color: #ccc; font-size: 16px; font-style: italic; p { margin: 0; } }

@media (max-width: 1024px) {
  .text-box { padding: 50px 60px; max-width: 700px; }
  .hero-title { font-size: 40px; }
  .hero-subtitle { font-size: 18px; }
}
@media (max-width: 768px) {
  .hero-container { min-height: 500px; }
  .hero-content { padding: 0 20px; }
  .text-box { padding: 40px 30px; }
  .hero-title { font-size: 32px; margin-bottom: 16px; }
  .hero-subtitle { font-size: 16px; }
}
@media (max-width: 480px) {
  .hero-container { min-height: 400px; }
  .text-box { padding: 30px 20px; }
  .hero-title { font-size: 24px; margin-bottom: 12px; }
  .hero-subtitle { font-size: 14px; }
}
</style>
