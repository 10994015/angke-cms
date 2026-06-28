<template>
  <section
    class="cwe-outer"
    :class="{ 'is-selected': isSelected }"
    :style="containerStyle"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
    @click.stop="handleClick"
  >
    <div class="cwe-viewport">
      <div
        v-for="(slide, index) in displaySlides"
        :key="index"
        class="cwe-slide"
        :class="{ 'cwe-slide--active': currentSlide === index }"
      >
        <img :src="slide.image" :alt="slide.title || '輪播圖片'" class="cwe-img" loading="lazy" />
        <div class="cwe-overlay" :style="getOverlayStyle(slide)"></div>
        <div v-if="slide.title || slide.subtitle" class="cwe-text">
          <h2 v-if="slide.title" class="cwe-title" :style="getTitleStyle(slide)">{{ slide.title }}</h2>
          <p v-if="slide.subtitle" class="cwe-subtitle" :style="getSubtitleStyle(slide)">{{ slide.subtitle }}</p>
        </div>
      </div>
    </div>

    <template v-if="displaySlides.length > 1">
      <button class="cwe-nav cwe-nav--prev" @click.stop="prevSlide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="cwe-nav cwe-nav--next" @click.stop="nextSlide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="cwe-dots">
        <button
          v-for="(_, index) in displaySlides"
          :key="index"
          class="cwe-dot"
          :class="{ 'cwe-dot--active': currentSlide === index }"
          @click.stop="goToSlide(index)"
        ></button>
      </div>
    </template>

    <div class="cwe-edit-hint" v-if="!frameData.caroiselWallImgs?.length">
      <span>點擊此處編輯輪播牆</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'

const store = usePageEditorStore()

// 響應式尺寸：用 aspect-ratio 讓高度跟著寬度等比縮放，桌機/平板/手機各自不同比例與上限
const containerStyle = computed(() => {
  if (store.currentDevice === 'mobile') return { aspectRatio: '1 / 1' }
  if (store.currentDevice === 'tablet') return { aspectRatio: '1024 / 450', maxHeight: '450px' }
  return { aspectRatio: '1920 / 600', maxHeight: '600px' }
})

const PLACEHOLDER_SLIDES = [
  { image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=600&fit=crop', title: '創新科技，引領未來', subtitle: 'Innovate · Transform · Lead', overlayOpacity: 40, overlayColor: '#000', titleColor: '#fff', titleFontSize: 48, subtitleColor: '#eee', subtitleFontSize: 20 },
]

const props = defineProps({
  frameData:  { type: Object,  default: () => ({}) },
  frame:      { type: Object,  default: null },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['select-frame'])

const handleClick = () => emit('select-frame', props.frame)

const getDeviceSrc = (item, device) => {
  if (device === 'mobile') return item.mobileSrc || item.tabletSrc || item.desktopSrc
  if (device === 'tablet') return item.tabletSrc || item.desktopSrc
  return item.desktopSrc
}

const normalizedSlides = computed(() => {
  const imgs = props.frameData.caroiselWallImgs
  if (imgs?.length) {
    return imgs.map(item => ({
      image:            getDeviceSrc(item, 'desktop'),
      title:            item.title || '',
      subtitle:         item.subtitle || '',
      overlayOpacity:   item.overlayOpacity ?? 40,
      overlayColor:     item.overlayColor || '#000000',
      titleColor:       item.titleColor || '#ffffff',
      titleFontSize:    item.titleFontSize ?? 48,
      subtitleColor:    item.subtitleColor || '#eeeeee',
      subtitleFontSize: item.subtitleFontSize ?? 20,
    }))
  }
  return []
})

const displaySlides = computed(() => normalizedSlides.value.length ? normalizedSlides.value : PLACEHOLDER_SLIDES)

const getOverlayStyle  = (slide) => ({ backgroundColor: slide.overlayColor || '#000000', opacity: (slide.overlayOpacity ?? 0) / 100 })
const getTitleStyle    = (slide) => ({ color: slide.titleColor || '#ffffff', fontSize: (slide.titleFontSize ?? 48) + 'px' })
const getSubtitleStyle = (slide) => ({ color: slide.subtitleColor || '#eeeeee', fontSize: (slide.subtitleFontSize ?? 20) + 'px' })

const currentSlide = ref(0)
let autoPlayTimer = null

const nextSlide  = () => { currentSlide.value = (currentSlide.value + 1) % displaySlides.value.length }
const prevSlide  = () => { currentSlide.value = (currentSlide.value - 1 + displaySlides.value.length) % displaySlides.value.length }
const goToSlide  = (i) => { currentSlide.value = i }

const startAutoPlay = () => {
  stopAutoPlay()
  if (displaySlides.value.length > 1 && props.frameData.carouselWallAutoPlay !== false) {
    autoPlayTimer = setInterval(nextSlide, props.frameData.carouselWallInterval || 5000)
  }
}
const stopAutoPlay = () => {
  if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null }
}

watch(normalizedSlides, () => {
  if (currentSlide.value >= displaySlides.value.length) currentSlide.value = 0
  startAutoPlay()
})
watch(() => props.frameData.carouselWallAutoPlay, startAutoPlay)
watch(() => props.frameData.carouselWallInterval, startAutoPlay)

onMounted(startAutoPlay)
onUnmounted(stopAutoPlay)
</script>

<style lang="scss" scoped>
.cwe-outer {
  position: relative;
  width: 100%;
  /* 響應式高度（依寬度等比縮放）；實際比例由 :style(containerStyle) 依裝置覆寫 */
  aspect-ratio: 1920 / 600;
  max-height: 600px;
  user-select: none;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover      { box-shadow: 0 0 0 3px rgba(8,145,178,0.2); .cwe-edit-hint { opacity: 1; } }
  &.is-selected { box-shadow: 0 0 0 3px rgba(8,145,178,0.5); .cwe-edit-hint { opacity: 1; } }
}

.cwe-viewport {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

/* 淡入淡出：slide 絕對定位疊在一起，靠 opacity 切換 */
.cwe-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}
.cwe-slide--active {
  opacity: 1;
  z-index: 1;
}

/* 鎖死高度下用 cover 填滿，不同比例的圖也一樣高 */
.cwe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cwe-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.cwe-text {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  pointer-events: none;
}

.cwe-title {
  margin: 0 0 16px;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
}

.cwe-subtitle {
  margin: 0;
  line-height: 1.6;
  text-shadow: 0 1px 8px rgba(0,0,0,0.5);
  max-width: 720px;
}

@media (max-width: 768px) {
  .cwe-text    { padding: 24px 15px; }
  .cwe-title   { font-size: clamp(20px, 5vw, 48px) !important; }
  .cwe-subtitle { font-size: clamp(14px, 3vw, 20px) !important; }
}

/* 箭頭 */
.cwe-nav {
  position: absolute;
  top: 50%; transform: translateY(-50%);
  z-index: 10;
  background: rgba(255,255,255,0.88);
  border: none;
  width: 40px; height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  transition: background 0.2s, transform 0.2s;
  padding: 0;

  svg { width: 18px; height: 18px; color: #333; }
  &:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
  &--prev { left: 4%; }
  &--next { right: 4%; }
}

@media (max-width: 768px) {
  .cwe-nav { width: 34px; height: 34px; svg { width: 15px; height: 15px; } }
  .cwe-nav--prev { left: 6%; }
  .cwe-nav--next { right: 6%; }
}

/* 分頁點 */
.cwe-dots {
  position: absolute;
  bottom: 16px; left: 0; right: 0;
  display: flex; align-items: center; justify-content: center;
  gap: 6px; z-index: 10;
}

.cwe-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.45);
  cursor: pointer; padding: 0;
  transition: all 0.3s;

  &--active { background: #fff; width: 24px; border-radius: 4px; }
}

/* 編輯提示 */
.cwe-edit-hint {
  position: absolute;
  top: 16px; right: 16px;
  background: rgba(8,145,178,0.9);
  color: #fff;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  z-index: 20;
}
</style>
