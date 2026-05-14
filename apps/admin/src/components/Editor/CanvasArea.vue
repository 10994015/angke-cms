<template>
  <div class="canvas-area" @click.self="store.clearSelection()">
    <!-- 畫布載入中 -->
    <Transition name="canvas-fade">
      <div v-if="store.isLoading" class="canvas-loading">
        <div class="canvas-spinner" />
      </div>
    </Transition>

    <div class="device-wrapper" :class="`device-${store.currentDevice}`">

      <!-- 空畫布提示 -->
      <div
        v-if="!store.currentPageBasemaps.length && !store.isLoading"
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
      <template v-else>
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
import { ref } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'
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
    store.addCustomFrame(store.currentPageBasemaps[bIdx], data.frameType || 'FRAME_1_1')
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
      const frame = store.addCustomFrame(basemap, 'FRAME_1_1')
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
    if (basemap) store.addCustomFrame(basemap, data.frameType || 'FRAME_1_1')
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
  if (basemap) store.addCustomFrame(basemap, 'FRAME_1_1')
}
</script>

<style scoped lang="scss">
.canvas-loading {
  position: absolute;
  inset: 0;
  z-index: 3000;
  background: rgba(229, 231, 235, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.canvas-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(8, 145, 178, 0.2);
  border-top-color: #0891B2;
  border-radius: 50%;
  animation: canvas-spin 0.7s linear infinite;
}

@keyframes canvas-spin { to { transform: rotate(360deg); } }

.canvas-fade-enter-active { transition: opacity 0.15s; }
.canvas-fade-leave-active { transition: opacity 0.25s; }
.canvas-fade-enter-from, .canvas-fade-leave-to { opacity: 0; }

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
