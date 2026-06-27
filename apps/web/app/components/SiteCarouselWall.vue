<template>
  <section class="hero">
    <div class="hero-swiper">
      <div class="swiper-wrapper">
        <div
          v-for="(slide, index) in displaySlides"
          :key="index"
          class="swiper-slide"
          :class="{ active: currentSlide === index }"
        >
          <img :src="slide.image" :alt="slide.title || '輪播圖片'" class="slide-image" />
          <div class="slide-overlay" :style="getOverlayStyle(slide)" />
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
            @click.stop="goToSlide(Number(index))"
          />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{ frameData: Record<string, any> }>()

const normalizedSlides = computed(() => {
  const imgs = props.frameData.caroiselWallImgs
  if (!imgs?.length) return []
  return imgs.map((item: any) => ({
    image:           item.desktopSrc || item.tabletSrc || item.mobileSrc,
    title:           item.title || '',
    subtitle:        item.subtitle || '',
    overlayOpacity:  item.overlayOpacity ?? 40,
    overlayColor:    item.overlayColor || '#000000',
    titleColor:      item.titleColor || '#ffffff',
    titleFontSize:   item.titleFontSize ?? 48,
    subtitleColor:   item.subtitleColor || '#eeeeee',
    subtitleFontSize: item.subtitleFontSize ?? 20,
  }))
})

const PLACEHOLDER_SLIDES = [
  { image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=600&fit=crop', title: '創新科技，引領未來', subtitle: 'Innovate · Transform · Lead', overlayOpacity: 40, overlayColor: '#000', titleColor: '#fff', titleFontSize: 48, subtitleColor: '#eee', subtitleFontSize: 20 },
]

const displaySlides = computed(() => normalizedSlides.value.length ? normalizedSlides.value : PLACEHOLDER_SLIDES)

const getOverlayStyle  = (s: any) => ({ backgroundColor: s.overlayColor, opacity: s.overlayOpacity / 100 })
const getTitleStyle    = (s: any) => ({ color: s.titleColor, fontSize: s.titleFontSize + 'px' })
const getSubtitleStyle = (s: any) => ({ color: s.subtitleColor, fontSize: s.subtitleFontSize + 'px' })

const currentSlide = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % displaySlides.value.length }
const prevSlide = () => { currentSlide.value = currentSlide.value === 0 ? displaySlides.value.length - 1 : currentSlide.value - 1 }
const goToSlide = (i: number) => { currentSlide.value = i }

const start = () => {
  if (timer) clearInterval(timer)
  if (displaySlides.value.length > 1 && props.frameData.carouselWallAutoPlay !== false) {
    timer = setInterval(nextSlide, props.frameData.carouselWallInterval || 5000)
  }
}
const stop = () => { if (timer) { clearInterval(timer); timer = null } }

watch(normalizedSlides, () => { currentSlide.value = 0; start() })
onMounted(start)
onUnmounted(stop)
</script>

<style scoped>
.hero { position: relative; width: 100%; overflow: hidden; }
.hero-swiper { position: relative; width: 100%; }
.swiper-wrapper { position: relative; width: 100%; }
/* 作用中的 slide 改回 in-flow 撐出高度，其餘絕對定位淡出疊在後面；
   圖片 height:auto 照比例縮放、不裁切 */
.swiper-slide { position: absolute; top: 0; left: 0; width: 100%; opacity: 0; transition: opacity 0.8s ease-in-out; }
.swiper-slide.active { position: relative; opacity: 1; z-index: 1; }
.slide-image { width: 100%; height: auto; display: block; }
.slide-overlay { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.slide-text-content {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 40px 20px; pointer-events: none;
}
.slide-title { margin: 0 0 16px; font-weight: 700; line-height: 1.2; text-shadow: 0 2px 12px rgba(0,0,0,0.5); }
.slide-subtitle { margin: 0; line-height: 1.6; text-shadow: 0 1px 8px rgba(0,0,0,0.5); max-width: 720px; }
.hero-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  z-index: 10; background: rgba(255,255,255,0.3); border: none;
  width: 50px; height: 50px; border-radius: 50%; cursor: pointer;
  font-size: 24px; color: #fff; display: flex; align-items: center; justify-content: center;
  transition: all 0.3s; backdrop-filter: blur(10px);
}
.hero-btn:hover { background: rgba(255,255,255,0.5); transform: translateY(-50%) scale(1.1); }
.hero-btn.prev { left: 2rem; }
.hero-btn.next { right: 2rem; }
.hero-pagination { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 12px; }
.pagination-dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.4); border: none; cursor: pointer; transition: all 0.3s; padding: 0; }
.pagination-dot:hover { background: rgba(255,255,255,0.6); }
.pagination-dot.active { background: #fff; width: 30px; border-radius: 6px; }
</style>
