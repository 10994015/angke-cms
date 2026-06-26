<template>
  <div class="preview-page">
    <header class="preview-toolbar">
      <div class="toolbar-left">
        <button class="btn-close" @click="closePreview">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          關閉
        </button>
      </div>

      <div class="toolbar-center">
        <div class="device-switcher">
          <button class="device-btn" :class="{ active: device === 'desktop' }" @click="device = 'desktop'" title="電腦版">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          <button class="device-btn" :class="{ active: device === 'tablet' }" @click="device = 'tablet'" title="平板">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </button>
          <button class="device-btn" :class="{ active: device === 'mobile' }" @click="device = 'mobile'" title="手機版">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </button>
        </div>
        <span class="preview-label">預覽模式</span>
      </div>

      <div class="toolbar-right">
        <!-- 語言切換 -->
        <div v-if="store.hasMultipleLocales" class="locale-switcher">
          <button
            v-for="loc in store.locales"
            :key="loc.locale"
            class="locale-btn"
            :class="{ active: store.currentLocale === loc.locale }"
            @click="store.switchLocale(loc.locale)"
          >{{ loc.label }}</button>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="store.isLoading" class="state-overlay">
      <div class="spinner" />
      <span>載入中...</span>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="state-overlay error">
      <p>{{ store.error }}</p>
      <button @click="store.loadPage(store.currentSlug)">重試</button>
    </div>

    <!-- Preview Area -->
    <div v-else class="preview-area" :class="`preview-area--${device}`">
      <div class="device-frame" :class="`device-frame--${device}`">
        <div ref="screenRef" class="device-screen">
          <div class="page-content">
            <template v-for="(basemap, bi) in store.basemaps" :key="`bm-${bi}`">
              <div class="basemap-block" :style="getBasemapStyle(basemap)">
                <template v-for="(frame, fi) in basemap.frames" :key="`f-${fi}`">
                  <SystemFramePreview
                    v-if="isSystemFrame(frame)"
                    :frame-type="frame.type"
                    :frame-data="frame.data || {}"
                    :current-page-slug="store.currentSlug"
                    :device="device"
                    :locales="store.locales"
                    :current-locale="store.currentLocale"
                    :page-tabs="pageTabs"
                    @change-page="store.loadPage($event)"
                    @change-locale="store.switchLocale($event)"
                  />
                  <CustomFramePreview
                    v-else
                    :frame="frame"
                    :device="device"
                  />
                </template>
              </div>
            </template>
          </div>

          <!-- Scroll to top -->
          <Transition name="fade">
            <button v-if="showTop" class="scroll-top-btn" @click="screenRef.scrollTo({ top: 0, behavior: 'smooth' })">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePreviewStore } from '@/stores/preview'
import SystemFramePreview from '@/components/Preview/SystemFramePreview.vue'
import CustomFramePreview from '@/components/Preview/CustomFramePreview.vue'

const route = useRoute()
const store = usePreviewStore()

const device    = ref('desktop')
const screenRef = ref(null)
const showTop   = ref(false)

// ── 判斷系統 vs 版面配置 ──
const isSystemFrame = (frame) => frame?.type && !frame.type.startsWith('FRAME')

// ── 從 header basemap 取得 tabs，供 footer navColumns 用 ──
const HEADER_TYPES = new Set(['HEADER', 'PV_HEADER'])
const pageTabs = computed(() => {
  for (const bm of store.basemaps) {
    if (HEADER_TYPES.has(bm?.bgType) || HEADER_TYPES.has(bm?.frames?.[0]?.type)) {
      const tabs = bm.frames?.[0]?.data?.tabs || bm.frames?.[0]?.data?.tab || []
      if (tabs.length) return tabs
    }
  }
  return []
})

// ── Basemap 背景樣式 ──
const getBasemapStyle = (basemap) => {
  const srcMap = { desktop: 'bgPcImgSrc', tablet: 'bgTabletImgSrc', mobile: 'bgPhoneImgSrc' }
  const src = basemap[srcMap[device.value]] || basemap.bgPcImgSrc
  if (!src) return {}
  return { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
}

// ── Scroll to top ──
const onScroll = () => { showTop.value = (screenRef.value?.scrollTop ?? 0) > 300 }
const attachScroll = () => screenRef.value?.addEventListener('scroll', onScroll, { passive: true })

watch(() => store.isLoading, (v) => { if (!v) setTimeout(attachScroll, 50) })
watch(device, () => { showTop.value = false; screenRef.value?.scrollTo({ top: 0 }) })

const closePreview = () => window.close()

onMounted(() => {
  const tid    = route.params.templeId
  const slug   = route.query.slug   || 'home'
  const locale = route.query.locale || 'ZH-TW'
  store.init(tid, slug, locale)
  attachScroll()
})

onUnmounted(() => {
  screenRef.value?.removeEventListener('scroll', onScroll)
  store.reset()
})
</script>

<style scoped>
.preview-page { display: flex; flex-direction: column; height: 100vh; background: #f0f0f0; overflow: hidden; }

/* Toolbar */
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 52px;
  background: #0891B2;
  border-bottom: 1px solid #0E7490;
  flex-shrink: 0;
}
.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 10px; flex: 1; }
.toolbar-center { display: flex; align-items: center; gap: 16px; flex: 1; justify-content: center; }
.toolbar-right { justify-content: flex-end; }

.btn-close {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; background: transparent;
  border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;
  color: rgba(255,255,255,0.8); font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.btn-close:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.5); color: #fff; }

.device-switcher { display: flex; align-items: center; background: rgba(0,0,0,0.15); border-radius: 10px; padding: 4px; gap: 2px; border: 1px solid rgba(255,255,255,0.15); }
.device-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 32px; border: none; border-radius: 7px; background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.15s; }
.device-btn:hover { color: #fff; background: rgba(255,255,255,0.12); }
.device-btn.active { background: rgba(255,255,255,0.2); color: #fff; }

.preview-label { font-size: 12px; color: rgba(255,255,255,0.55); }

/* Locale + Login */
.locale-switcher { display: flex; align-items: center; gap: 2px; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 3px; }
.locale-btn { padding: 4px 10px; border: none; border-radius: 5px; background: transparent; color: rgba(255,255,255,0.65); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: inherit; white-space: nowrap; }
.locale-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
.locale-btn.active { background: rgba(255,255,255,0.2); color: #fff; }

/* State overlay */
.state-overlay { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; font-size: 14px; color: #6b7280; }
.state-overlay.error { color: #dc2626; }
.state-overlay button { padding: 8px 20px; background: #0891B2; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.spinner { width: 28px; height: 28px; border: 3px solid #e5e7eb; border-top-color: #0891B2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Preview area */
.preview-area { flex: 1; overflow: auto; display: flex; align-items: flex-start; justify-content: center; padding: 24px 24px 40px; background: #e8e8e8; background-image: radial-gradient(circle, #d0d0d0 1px, transparent 1px); background-size: 20px 20px; }
.preview-area--desktop { align-items: stretch; padding: 0; background: #fff; background-image: none; }
.preview-area--desktop .device-frame { width: 100%; height: 100%; border-radius: 0; box-shadow: none; border: none; }
.preview-area--desktop .device-screen { height: 100%; overflow-y: auto; border-radius: 0; }

.device-frame { position: relative; background: #0E7490; border-radius: 40px; box-shadow: 0 30px 80px rgba(8,145,178,0.35); overflow: hidden; flex-shrink: 0; }
.device-frame--mobile { width: 390px; height: 80vh; max-height: 860px; border: 10px solid #0E7490; border-radius: 44px; box-sizing: content-box; }
.device-frame--tablet { width: 768px; height: 80vh; max-height: 1080px; border: 12px solid #0E7490; border-radius: 20px; box-sizing: content-box; }

.device-screen { background: #fff; border-radius: 34px; overflow-y: auto; overflow-x: hidden; height: 100%; width: 100%; position: relative; }
.device-frame--tablet .device-screen { border-radius: 10px; }
.device-screen::-webkit-scrollbar { width: 0; }
.preview-area--desktop .device-screen::-webkit-scrollbar { width: 6px; }
.preview-area--desktop .device-screen::-webkit-scrollbar-track { background: #f1f1f1; }
.preview-area--desktop .device-screen::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }

.page-content { width: 100%; min-height: 100%; background: #fff; }
.basemap-block { position: relative; width: 100%; background-size: cover; background-position: center; }

/* Scroll to top */
.scroll-top-btn { position: sticky; bottom: 28px; float: right; margin-right: 24px; margin-top: -52px; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; border: none; background: #0891B2; color: #fff; cursor: pointer; box-shadow: 0 4px 16px rgba(8,145,178,0.4); transition: all 0.2s; }
.scroll-top-btn:hover { background: #0E7490; transform: translateY(-2px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
