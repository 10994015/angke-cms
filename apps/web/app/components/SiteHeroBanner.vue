<template>
  <div class="hero-banner">
    <div class="hero-container" :style="heroStyle">
      <div class="hero-overlay" :style="overlayStyle" />
      <div class="hero-content">
        <div class="text-box" :style="textBoxStyle">
          <h1 v-if="heroTitle" class="hero-title" :style="titleStyle">{{ heroTitle }}</h1>
          <p v-if="heroSubtitle" class="hero-subtitle" :style="subtitleStyle">{{ heroSubtitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ frameData: Record<string, any> }>()

const PLACEHOLDER_BG = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=600&fit=crop'

const fd = (camel: string, snake: string, fallback: any) => {
  const val = props.frameData[camel] ?? props.frameData[snake]
  return val !== undefined && val !== null ? val : fallback
}

const backgroundImage  = computed(() => props.frameData.heroBgImgSrc ?? props.frameData.hero_bg_img_src ?? PLACEHOLDER_BG)
const heroTitle        = computed(() => props.frameData.heroTitle ?? props.frameData.hero_title ?? '')
const heroSubtitle     = computed(() => props.frameData.heroSubtitle ?? props.frameData.hero_subtitle ?? '')
const overlayOpacity   = computed(() => { const v = props.frameData.overlayOpacity ?? props.frameData.overlay_opacity; return v != null ? v / 100 : 0.4 })
const overlayColor     = computed(() => fd('overlayColor', 'overlay_color', '#000000'))
const textBoxRadius    = computed(() => fd('textBoxBorderRadius', 'text_box_border_radius', '12px'))
const titleColor       = computed(() => fd('titleColor', 'title_color', '#ffffff'))
const titleFontSize    = computed(() => fd('titleFontSize', 'title_font_size', '48px'))
const subtitleColor    = computed(() => fd('subtitleColor', 'subtitle_color', '#eeeeee'))
const subtitleFontSize = computed(() => fd('subtitleFontSize', 'subtitle_font_size', '20px'))

const heroStyle     = computed(() => ({ minHeight: fd('heroHeight', 'hero_height', '600px'), backgroundImage: `url(${backgroundImage.value})` }))
const overlayStyle  = computed(() => ({ backgroundColor: overlayColor.value, opacity: overlayOpacity.value }))
const textBoxStyle  = computed(() => ({ backgroundColor: 'transparent', borderRadius: textBoxRadius.value }))
const titleStyle    = computed(() => ({ color: titleColor.value, fontSize: titleFontSize.value }))
const subtitleStyle = computed(() => ({ color: subtitleColor.value, fontSize: subtitleFontSize.value }))
</script>

<style scoped>
.hero-banner { width: 100%; position: relative; }
.hero-container {
  position: relative; width: 100%; min-height: 600px;
  display: flex; align-items: center; justify-content: center;
  background-size: cover; background-position: center; background-repeat: no-repeat; overflow: hidden;
}
.hero-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.hero-content { position: relative; z-index: 2; width: 100%; max-width: 1200px; padding: 0 40px; display: flex; align-items: center; justify-content: center; }
.text-box { background: transparent; padding: 60px 80px; border-radius: 12px; text-align: center; max-width: 800px; width: 100%; }
.hero-title { font-size: 48px; font-weight: 700; color: #fff; margin: 0 0 20px; line-height: 1.2; }
.hero-subtitle { font-size: 20px; color: #eee; margin: 0; line-height: 1.6; }
@media (max-width: 768px) {
  .hero-container { min-height: 400px; }
  .text-box { padding: 30px 20px; }
  .hero-title { font-size: 28px; }
  .hero-subtitle { font-size: 15px; }
}
</style>
