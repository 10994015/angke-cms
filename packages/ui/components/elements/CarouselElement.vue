<template>
  <div class="el-carousel" :style="{ height: (val.height || 400) + 'px' }">

    <template v-if="imgs.length > 0">
      <div class="el-carousel-track" :style="{ transform: `translateX(-${current * 100}%)` }">
        <div v-for="(img, i) in imgs" :key="i" class="el-carousel-slide">
          <img :src="imgSrc(img)" class="el-carousel-img" :alt="`圖片 ${i + 1}`" loading="lazy" />
        </div>
      </div>

      <template v-if="imgs.length > 1">
        <button class="el-carousel-btn el-carousel-btn--prev" @click.stop="prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button class="el-carousel-btn el-carousel-btn--next" @click.stop="next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <div class="el-carousel-dots">
          <button
            v-for="(_, i) in imgs" :key="i"
            class="el-carousel-dot"
            :class="{ active: current === i }"
            @click.stop="current = i"
          />
        </div>
      </template>
    </template>

    <div v-else class="el-carousel-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <polyline points="7 12 12 8 17 12"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
      </svg>
      <span>輪播圖片</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ val: Record<string, any>; meta?: Record<string, any> }>()

const imgs   = computed(() => props.val.imgs || [])
const imgSrc = (img: any) => (typeof img === 'string' ? img : img?.src) || ''
const current = ref(0)

const prev = () => { current.value = (current.value - 1 + imgs.value.length) % imgs.value.length }
const next = () => { current.value = (current.value + 1) % imgs.value.length }

let timer: ReturnType<typeof setInterval> | null = null
const startTimer = () => {
  stopTimer()
  if (props.val.autoPlay !== false && imgs.value.length > 1) {
    timer = setInterval(next, props.val.interval || 3000)
  }
}
const stopTimer = () => { if (timer) { clearInterval(timer); timer = null } }

watch(() => [props.val.autoPlay, props.val.interval, imgs.value.length], () => {
  current.value = 0; startTimer()
}, { immediate: false })

watch(() => imgs.value.length, () => { current.value = 0 })

onMounted(startTimer)
onUnmounted(stopTimer)
</script>

<style scoped>
.el-carousel {
  position: relative;
  width: 100%;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-carousel-track {
  position: absolute;
  inset: 0;
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.45s ease;
}
.el-carousel-slide { flex: 0 0 100%; width: 100%; height: 100%; }
.el-carousel-img   { width: 100%; height: 100%; object-fit: cover; display: block; }

.el-carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,0.88);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 0.15s, transform 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18);
}
.el-carousel-btn svg { width: 16px; height: 16px; }
.el-carousel-btn:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
.el-carousel-btn--prev { left: 10px; }
.el-carousel-btn--next { right: 10px; }

.el-carousel-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}
.el-carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}
.el-carousel-dot.active { background: #fff; width: 20px; border-radius: 4px; }

.el-carousel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
}
.el-carousel-placeholder svg  { width: 32px; height: 32px; }
.el-carousel-placeholder span { font-size: 13px; }
</style>
