<template>
  <section
    class="hero"
    :class="{ 'is-selected': isSelected }"
    :style="heroStyle"
    @click.stop="handleClick"
  >
    <div class="hero-swiper">
      <div class="swiper-wrapper">
        <div
          v-for="(slide, index) in displaySlides"
          :key="index"
          class="swiper-slide"
          :class="{ active: currentSlide === index }"
        >
          <img :src="slide.image" :alt="slide.title || '輪播圖片'" class="slide-image" />
          <div class="slide-overlay" :style="getOverlayStyle(slide)"></div>
          <div v-if="slide.title || slide.subtitle" class="slide-text-content">
            <h2 v-if="slide.title" class="slide-title" :style="getTitleStyle(slide)">{{ slide.title }}</h2>
            <p v-if="slide.subtitle" class="slide-subtitle" :style="getSubtitleStyle(slide)">{{ slide.subtitle }}</p>
          </div>
        </div>
      </div>

      <template v-if="displaySlides.length > 1">
        <button class="hero-btn prev" @click.stop="prevSlide">‹</button>
        <button class="hero-btn next" @click.stop="nextSlide">›</button>
        <div class="hero-pagination">
          <button
            v-for="(_, index) in displaySlides"
            :key="index"
            class="pagination-dot"
            :class="{ active: currentSlide === index }"
            @click.stop="goToSlide(index)"
          ></button>
        </div>
      </template>
    </div>

    <div class="edit-hint" v-if="!frameData.caroiselWallImgs?.length">
      <span>點擊此處編輯輪播牆</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const PLACEHOLDER_SLIDES = [
  { image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=600&fit=crop', title: '創新科技，引領未來', subtitle: 'Innovate · Transform · Lead' },
  { image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=600&fit=crop', title: '智慧解決方案，效率倍增', subtitle: 'Smart Solutions for a Digital World' },
  { image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1280&h=600&fit=crop', title: '數位轉型，從這裡開始', subtitle: 'Your Digital Transformation Partner' },
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

const heroStyle = computed(() => {
  const h = props.frameData.carouselWallHeight ?? 600
  const val = typeof h === 'number' || /^\d+$/.test(String(h)) ? String(h) + 'px' : String(h)
  return { height: val }
})

const normalizedSlides = computed(() => {
  const imgs = props.frameData.caroiselWallImgs
  if (imgs?.length) {
    return imgs.map(item => ({
      image:          getDeviceSrc(item, 'desktop'),
      title:          item.title || '',
      subtitle:       item.subtitle || '',
      overlayOpacity: item.overlayOpacity ?? 40,
      overlayColor:   item.overlayColor || '#000000',
      titleColor:     item.titleColor || '#ffffff',
      titleFontSize:  item.titleFontSize ?? 48,
      subtitleColor:  item.subtitleColor || '#eeeeee',
      subtitleFontSize: item.subtitleFontSize ?? 20,
    }))
  }
  return []
})

const displaySlides = computed(() => normalizedSlides.value.length ? normalizedSlides.value : PLACEHOLDER_SLIDES)

const getOverlayStyle  = (slide) => ({ backgroundColor: slide.overlayColor || '#000000', opacity: (slide.overlayOpacity ?? 40) / 100 })
const getTitleStyle    = (slide) => ({ color: slide.titleColor || '#ffffff', fontSize: (slide.titleFontSize ?? 48) + 'px' })
const getSubtitleStyle = (slide) => ({ color: slide.subtitleColor || '#eeeeee', fontSize: (slide.subtitleFontSize ?? 20) + 'px' })

const currentSlide = ref(0)
let autoPlayTimer = null

const nextSlide  = () => { currentSlide.value = (currentSlide.value + 1) % displaySlides.value.length }
const prevSlide  = () => { currentSlide.value = currentSlide.value === 0 ? displaySlides.value.length - 1 : currentSlide.value - 1 }
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
.hero {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.2); .edit-hint { opacity: 1; } }
  &.is-selected { box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.5); .edit-hint { opacity: 1; } }
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
  z-index: 20;
}

.hero-swiper { position: relative; width: 100%; height: 100%; }

.swiper-wrapper { position: relative; width: 100%; height: 100%; }

.swiper-slide {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  &.active { opacity: 1; z-index: 1; }
}

.slide-image { width: 100%; height: 100%; object-fit: cover; display: block; }

.slide-overlay { position: absolute; inset: 0; z-index: 2; pointer-events: none; }

.slide-text-content {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 40px 20px;
  pointer-events: none;
}

.slide-title    { margin: 0 0 16px; font-weight: 700; line-height: 1.2; text-shadow: 0 2px 12px rgba(0,0,0,0.5); }
.slide-subtitle { margin: 0; line-height: 1.6; text-shadow: 0 1px 8px rgba(0,0,0,0.5); max-width: 720px; }

.hero-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  z-index: 10; background: rgba(255,255,255,0.3); border: none;
  width: 50px; height: 50px; border-radius: 50%;
  cursor: pointer; font-size: 24px; color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s; backdrop-filter: blur(10px);
  &:hover { background: rgba(255,255,255,0.5); transform: translateY(-50%) scale(1.1); }
  &.prev { left: 2rem; }
  &.next { right: 2rem; }
}

.hero-pagination {
  position: absolute; bottom: 2rem; left: 50%;
  transform: translateX(-50%); z-index: 10;
  display: flex; gap: 12px;
}

.pagination-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: rgba(255,255,255,0.4); border: none; cursor: pointer;
  transition: all 0.3s; padding: 0;
  &:hover { background: rgba(255,255,255,0.6); transform: scale(1.2); }
  &.active { background: #fff; width: 30px; border-radius: 6px; }
}

@media (max-width: 768px) {
  .hero-btn { width: 40px; height: 40px; font-size: 20px; &.prev { left: 1rem; } &.next { right: 1rem; } }
  .slide-text-content { padding: 24px 15px; }
}
</style>
