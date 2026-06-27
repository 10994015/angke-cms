<template>
  <div class="canvas-area" @click.self="store.clearSelection()">
    <!-- 畫布骨架（isLoading 或尚未選定頁面時蓋住畫布） -->
    <div v-if="store.isLoading || !store.currentPageSlug" class="canvas-skeleton">
      <div class="sk-navbar" />
      <div class="sk-block sk-block--hero" />
      <div class="sk-block sk-block--section">
        <div class="sk-row">
          <div class="sk-col" /><div class="sk-col" /><div class="sk-col" />
        </div>
      </div>
      <div class="sk-block sk-block--section">
        <div class="sk-row">
          <div class="sk-col sk-col--wide" /><div class="sk-col" />
        </div>
      </div>
      <div class="sk-footer" />
    </div>

    <div class="device-wrapper" :class="`device-${store.currentDevice}`" :style="siteFontStyle">

      <!-- 空畫布提示 -->
      <div
        v-if="store.currentPageSlug && !store.currentPageBasemaps.length && !store.isLoading"
        class="empty-canvas"
        :class="{ 'drag-over': isEmptyDragOver }"
        @dragover.prevent="isEmptyDragOver = true; $event.dataTransfer.dropEffect = 'copy'"
        @dragleave="isEmptyDragOver = false"
        @drop.prevent="onEmptyCanvasDrop"
      >
        <div class="empty-inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <p>頁面是空的，從左側拖曳版面配置或點擊下方按鈕開始</p>
          <button class="btn-add-first" @click="addFirstSection">+ 新增區塊</button>
        </div>
      </div>

      <!-- 區塊列表 -->
      <template v-else-if="store.currentPageBasemaps.length">
        <template v-for="(basemap, bIdx) in store.currentPageBasemaps" :key="bIdx">
          <!-- HEADER basemap -->
          <BasemapWrapper
            v-if="isHeaderBasemap(basemap)"
            :index="bIdx"
            :basemap="basemap"
            :total-basemaps="store.currentPageBasemaps.length"
            :is-deletable="false"
            :disable-move="true"
            @add-basemap="onAddBasemap"
            @delete-basemap="onDeleteBasemap"
            @move-basemap="onMoveBasemap"
          >
            <NavbarBasemap
              :frame-data="basemap.frames?.[0]?.data || {}"
              :frame="basemap.frames?.[0] || null"
            />
          </BasemapWrapper>

          <!-- FOOTER basemap -->
          <FooterBasemap
            v-else-if="isFooterBasemap(basemap)"
            :frame-data="basemap.frames?.[0]?.data || {}"
            :frame="basemap.frames?.[0] || null"
          />

          <!-- 一般 content basemap -->
          <BasemapWrapper
            v-else
            :index="bIdx"
            :basemap="basemap"
            :total-basemaps="store.currentPageBasemaps.length"
            :is-deletable="basemap.bgIsDeletable !== false"
            @add-basemap="onAddBasemap"
            @delete-basemap="onDeleteBasemap"
            @move-basemap="onMoveBasemap"
          >
            <div
              class="basemap-droppable"
              :class="{ 'drag-over': dragOverBasemapIdx === bIdx }"
              @dragover.prevent="onBasemapDragOver($event, bIdx)"
              @dragleave="onBasemapDragLeave($event)"
              @drop.stop="onBasemapDrop($event, bIdx)"
            >
              <!-- 有版面配置 -->
              <template v-if="basemap.frames?.length">
                <div class="frames-list">
                  <template v-for="(frame, fIdx) in basemap.frames" :key="fIdx">
                    <SystemFrameRenderer
                      v-if="isSystemFrame(frame)"
                      :frame="frame"
                      :is-selected="store.selected.frame === frame"
                      @select-frame="store.selectFrame"
                      @delete-frame="store.deleteFrame(basemap, fIdx)"
                    />
                    <CustomFrame
                      v-else
                      :basemap="basemap"
                      :frame="frame"
                      :frame-index="fIdx"
                      :total-frames="basemap.frames.length"
                    />
                  </template>
                </div>
              </template>

              <!-- 空白區塊 -->
              <div v-else class="blank-basemap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <p>從左側拖曳版面配置至此</p>
              </div>
            </div>
          </BasemapWrapper>

        </template>
      </template>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'
import { resolveSiteFont } from '@angke/ui/utils/fonts.js'
import CustomFrame from './CustomFrame.vue'
import BasemapWrapper from './basemap/BasemapWrapper.vue'
import NavbarBasemap from './basemap/NavbarBasemap.vue'
import FooterBasemap from './basemap/FooterBasemap.vue'
import SystemFrameRenderer from './elements/SystemFrameRenderer.vue'

const isSystemFrame = (frame) => frame?.type && !frame.type.startsWith('FRAME')

const HEADER_TYPES = new Set(['HEADER', 'PV_HEADER'])
const FOOTER_TYPES = new Set(['FOOTER', 'PV_FOOTER'])
const isHeaderBasemap = (basemap) =>
  HEADER_TYPES.has(basemap?.bgType) || HEADER_TYPES.has(basemap?.frames?.[0]?.type)
const isFooterBasemap = (basemap) =>
  FOOTER_TYPES.has(basemap?.bgType) || FOOTER_TYPES.has(basemap?.frames?.[0]?.type)

const store = usePageEditorStore()

// 全站字型：依網站設定 + 目前語系套用到整個畫布內容
const siteFontStyle = computed(() => {
  const family = resolveSiteFont(store.websiteSettings, store.currentLocale)
  return family ? { fontFamily: family } : {}
})

// ── 拖曳進入 basemap ──
const dragOverBasemapIdx = ref(null)
const isEmptyDragOver    = ref(false)

const onBasemapDragOver = (event, idx) => {
  dragOverBasemapIdx.value = idx
  event.dataTransfer.dropEffect = 'copy'
}

const onBasemapDragLeave = (event) => {
  const related = event.relatedTarget
  if (!related || !event.currentTarget.contains(related)) {
    dragOverBasemapIdx.value = null
  }
}

const onBasemapDrop = (event, bIdx) => {
  dragOverBasemapIdx.value = null
  const raw = event.dataTransfer.getData('application/json')
  if (!raw) return
  let data
  try { data = JSON.parse(raw) } catch { return }

  if (data.dragType === 'system-frame') {
    const basemap = store.currentPageBasemaps[bIdx]
    const hasCustom = basemap.frames?.some(f => f.type?.startsWith('FRAME'))
    const hasSystem = basemap.frames?.some(f => f.type && !f.type.startsWith('FRAME'))
    if (hasCustom) { alert('此底圖已有版面配置，不能添加功能總覽'); return }
    if (hasSystem) { alert('此底圖已有功能總覽，一個底圖只能有一個功能總覽'); return }
    store.addSystemFrame(basemap, data.type)
    return
  }

  if (data.dragType === 'frame') {
    store.addCustomFrame(store.currentPageBasemaps[bIdx], data.frameType || 'FRAME1_1')
    return
  }

  if (data.dragType === 'element') {
    const SIDEBAR_TO_API = {
      'text': 'TEXT', 'image': 'IMG', 'button': 'BUTTON',
      'carousel': 'CAROUSEL_IMG', 'map': 'GOOGLE_MAP', 'accordion': 'ACCORDION', 'iframe': 'IFRAME',
      'hline': 'HORIZON_LINE',
    }
    const apiType = SIDEBAR_TO_API[data.type] || data.type?.toUpperCase()
    const basemap = store.currentPageBasemaps[bIdx]
    if (!basemap.frames?.length) {
      const frame = store.addCustomFrame(basemap, 'FRAME1_1')
      if (frame) store.addElementToCell(frame, 0, apiType)
    } else {
      const lastFrame = basemap.frames[basemap.frames.length - 1]
      const emptyIdx = (lastFrame.elements || []).findIndex(el => !el)
      if (emptyIdx !== -1) store.addElementToCell(lastFrame, emptyIdx, apiType)
    }
  }
}

// ── 空畫布 drop ──
const onEmptyCanvasDrop = (event) => {
  isEmptyDragOver.value = false
  const raw = event.dataTransfer.getData('application/json')
  if (!raw) return
  let data
  try { data = JSON.parse(raw) } catch { return }
  if (data.dragType === 'system-frame') {
    const basemap = store.addBasemap()
    if (basemap) store.addSystemFrame(basemap, data.type)
  } else if (data.dragType === 'frame') {
    const basemap = store.addBasemap()
    if (basemap) store.addCustomFrame(basemap, data.frameType || 'FRAME1_1')
  }
}

// ── BasemapWrapper 事件處理 ──
const onAddBasemap = (afterIndex) => store.addBasemap(afterIndex)
const onDeleteBasemap = (index) => store.deleteBasemap(index)
const onMoveBasemap = ({ fromIndex, direction }) => {
  if (direction === 'up') store.moveBasemapUp(fromIndex)
  else store.moveBasemapDown(fromIndex)
}

// ── 新增第一個區塊 ──
const addFirstSection = () => {
  const basemap = store.addBasemap()
  if (basemap) store.addCustomFrame(basemap, 'FRAME1_1')
}
</script>

<style scoped lang="scss">
/* ── 骨架 ── */
@keyframes sk-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

%sk-base {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
  border-radius: 4px;
}

.canvas-skeleton {
  position: absolute;
  inset: 0;
  z-index: 3000;
  background: #fff;
  pointer-events: all;
  overflow: hidden;
}

.sk-navbar {
  @extend %sk-base;
  height: 64px;
  border-radius: 0;
  margin-bottom: 0;
}

.sk-block {
  margin: 16px 24px;
  border-radius: 8px;
  overflow: hidden;

  &--hero {
    @extend %sk-base;
    height: 220px;
  }

  &--section {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 20px;
    min-height: 120px;
  }
}

.sk-row {
  display: flex;
  gap: 12px;
}

.sk-col {
  @extend %sk-base;
  flex: 1;
  height: 80px;

  &--wide { flex: 2; }
}

.sk-footer {
  @extend %sk-base;
  height: 80px;
  margin: 16px 24px;
  border-radius: 8px;
}

.canvas-area {
  flex: 1;
  overflow-y: auto;
  background: #e5e7eb;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 24px;
}

.device-wrapper {
  width: 100%;
  max-width: 1280px;
  transition: max-width 0.25s ease;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  min-height: calc(100% - 64px);
  height: fit-content;

  &.device-tablet { max-width: 768px; }
  &.device-mobile { max-width: 390px; }
}

.empty-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  transition: background 0.15s;
  border-radius: 8px;

  &.drag-over {
    background: rgba(8, 145, 178, 0.06);
    outline: 2px dashed #0891B2;
    outline-offset: -4px;
  }
}

.empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #9ca3af;

  svg { width: 48px; height: 48px; }
  p { font-size: 14px; text-align: center; max-width: 280px; }
}

.btn-add-first {
  padding: 10px 24px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #0E7490; }
}

.basemap-droppable {
  width: 100%;
  transition: background 0.15s, outline 0.15s;

  &.drag-over {
    background: rgba(8, 145, 178, 0.04);
    outline: 2px dashed #0891B2;
    outline-offset: -2px;
  }
}

.frames-list {
  display: flex;
  flex-direction: column;
}

.blank-basemap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 100px;
  padding: 24px;
  color: #d1d5db;

  svg { width: 28px; height: 28px; }
  p { font-size: 12px; color: #d1d5db; margin: 0; }
}

</style>
