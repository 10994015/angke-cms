<template>
  <div class="sidebar-host" :class="{ 'is-pinned': pinned }">
  <aside
    class="left-sidebar"
    :class="{ 'is-collapsed': isCollapsed }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'system-frames' }" @click="selectTab('system-frames')" title="功能總覽">
        <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        <span>功能總覽</span>
      </button>
      <button class="tab" :class="{ active: activeTab === 'frames' }" @click="selectTab('frames')" title="版面配置">
        <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>版面配置</span>
      </button>
      <button class="tab" :class="{ active: activeTab === 'elements' }" @click="selectTab('elements')" title="元件">
        <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="9" height="9" rx="1.5"/><rect x="13" y="2" width="9" height="9" rx="1.5"/><rect x="2" y="13" width="9" height="9" rx="1.5"/><rect x="13" y="13" width="9" height="9" rx="1.5"/></svg>
        <span>元件</span>
      </button>
      <button class="pin-btn" :class="{ pinned }" @click="pinned = !pinned" :title="pinned ? '取消固定' : '固定側欄'">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
        </svg>
      </button>
    </div>

    <div v-show="!isCollapsed" class="sidebar-body">
      <!-- 功能總覽列表 -->
      <div v-show="activeTab === 'system-frames'" class="panel">
        <div v-if="isLoadingSystemFrames" class="loading-state">
          <div class="spinner" />
          <span>載入中...</span>
        </div>
        <div v-else-if="!systemFrameList.length" class="empty-state">
          <p>目前沒有可用的功能總覽</p>
        </div>
        <template v-else>
          <p class="panel-hint">拖曳功能總覽至底圖</p>
          <div class="system-frame-list">
            <div
              v-for="sf in systemFrameList"
              :key="sf.type"
              class="system-frame-card"
              draggable="true"
              @dragstart="onSystemFrameDragStart($event, sf)"
              @dragend="onDragEnd"
            >
              <div class="sf-preview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <span class="sf-label">{{ sf.label || sf.type }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- 元件列表 -->
      <div v-show="activeTab === 'elements'" class="panel">
        <p class="panel-hint">拖曳元件至版面配置格子中</p>

        <div class="element-section-title">基本元件</div>
        <div class="element-grid">
          <div v-for="el in BASIC_ELEMENTS" :key="el.sidebarType" class="element-card"
            draggable="true" @dragstart="onElementDragStart($event, el.sidebarType)" @dragend="onDragEnd">
            <div class="element-icon" v-html="el.icon" />
            <span>{{ el.label }}</span>
          </div>
        </div>

        <div class="element-section-title">進階元件</div>
        <div class="element-grid">
          <div v-for="el in ADVANCED_ELEMENTS" :key="el.sidebarType" class="element-card"
            draggable="true" @dragstart="onElementDragStart($event, el.sidebarType)" @dragend="onDragEnd">
            <div class="element-icon" v-html="el.icon" />
            <span>{{ el.label }}</span>
          </div>
        </div>
      </div>

      <!-- 版面配置列表 -->
      <div v-show="activeTab === 'frames'" class="panel">
        <p class="panel-hint">拖曳版面配置到區塊，或點選後加入最後一個區塊</p>

        <div class="element-section-title">單列版面配置</div>
        <div class="frame-list">
          <div v-for="fr in SINGLE_ROW_FRAMES" :key="fr.type" class="frame-card"
            draggable="true" @dragstart="onFrameDragStart($event, fr.type)" @dragend="onDragEnd"
            @click="onFrameClick(fr.type)">
            <div class="frame-preview" :class="fr.previewClass">
              <div v-for="i in fr.cols" :key="i" class="fp-col" :style="fr.colStyle?.[i-1]" />
            </div>
            <span>{{ fr.label }}</span>
          </div>
        </div>

        <div class="element-section-title">雙列版面配置</div>
        <div class="frame-list">
          <div v-for="fr in DOUBLE_ROW_FRAMES" :key="fr.type" class="frame-card"
            draggable="true" @dragstart="onFrameDragStart($event, fr.type)" @dragend="onDragEnd"
            @click="onFrameClick(fr.type)">
            <div class="frame-preview frame-preview--double">
              <div class="fp-row" v-for="r in 2" :key="r">
                <div v-for="i in fr.cols" :key="i" class="fp-col" />
              </div>
            </div>
            <span>{{ fr.label }}</span>
          </div>
        </div>

        <div class="element-section-title">複合版面配置</div>
        <div class="frame-list">
          <div v-for="fr in COMPOSITE_FRAMES" :key="fr.type" class="frame-card"
            draggable="true" @dragstart="onFrameDragStart($event, fr.type)" @dragend="onDragEnd"
            @click="onFrameClick(fr.type)">
            <div class="frame-preview" :class="fr.previewClass">
              <div class="fp-col fp-col--large" />
              <div class="fp-col-group">
                <div class="fp-col" v-for="i in fr.rightCols" :key="i" />
              </div>
            </div>
            <span>{{ fr.label }}</span>
          </div>
        </div>
      </div>
    </div>

  </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'
import { useAuthStore } from '@/stores/auth'

const store     = usePageEditorStore()
const authStore = useAuthStore()

const activeTab = ref('system-frames')
const pinned    = ref(false)
const hovered   = ref(false)
const isCollapsed = computed(() => !pinned.value && !hovered.value)
const isLoadingSystemFrames = ref(false)

const systemFrameList = computed(() => store.availableSystemFrames)

onMounted(async () => {
  if (!store.availableSystemFrames.length) {
    isLoadingSystemFrames.value = true
    await store.fetchAvailableSystemFrames()
    isLoadingSystemFrames.value = false
  }

  console.log(
    '[LeftSidebar] systemPermissions:',
    JSON.parse(JSON.stringify(authStore.systemPermissions))
  )
})

const BASIC_ELEMENTS = [
  { sidebarType: 'text', label: '文字', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>` },
  { sidebarType: 'image', label: '圖片', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>` },
  { sidebarType: 'button', label: '按鈕', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="5"/></svg>` },
  { sidebarType: 'hline', label: '橫線', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>` },
]

const ADVANCED_ELEMENTS = [
  { sidebarType: 'carousel', label: '輪播圖', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><polyline points="8 12 12 8 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>` },
  { sidebarType: 'map', label: '地圖', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>` },
  { sidebarType: 'accordion', label: '折疊', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="8 9 12 13 16 9"/></svg>` },
  { sidebarType: 'iframe', label: 'iFrame', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 10l3 3-3 3"/><line x1="13" y1="16" x2="16" y2="16"/></svg>` },
]

const SINGLE_ROW_FRAMES = [
  { type: 'FRAME1_1', label: '1 欄', cols: 1, previewClass: '' },
  { type: 'FRAME1_2', label: '2 欄', cols: 2, previewClass: '' },
  { type: 'FRAME1_3', label: '3 欄', cols: 3, previewClass: '' },
  { type: 'FRAME1_4', label: '4 欄', cols: 4, previewClass: '' },
]

const DOUBLE_ROW_FRAMES = [
  { type: 'FRAME2_2', label: '2×2', cols: 2 },
  { type: 'FRAME2_3', label: '2×3', cols: 3 },
  { type: 'FRAME2_4', label: '2×4', cols: 4 },
]

const COMPOSITE_FRAMES = [
  { type: 'FRAME_A', label: 'A 型 (1大+2小)', rightCols: 2, previewClass: 'fp--composite-left' },
  { type: 'FRAME_B', label: 'B 型 (2小+1大)', rightCols: 2, previewClass: 'fp--composite-right' },
  { type: 'FRAME_C', label: 'C 型 (1大+3小)', rightCols: 3, previewClass: 'fp--composite-left' },
  { type: 'FRAME_D', label: 'D 型 (3小+1大)', rightCols: 3, previewClass: 'fp--composite-right' },
]

const onSystemFrameDragStart = (event, sf) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify({
    dragType: 'system-frame',
    type: sf.type,
    label: sf.label,
  }))
}

const onElementDragStart = (event, sidebarType) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify({ dragType: 'element', type: sidebarType }))
}

const onFrameDragStart = (event, frameType) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify({ dragType: 'frame', frameType }))
}

const selectTab = (tab) => {
  activeTab.value = tab
}

const onDragEnd = () => {}

const onFrameClick = (frameType) => {
  const basemaps = store.currentPageBasemaps
  if (basemaps.length) {
    store.addCustomFrame(basemaps[basemaps.length - 1], frameType)
  } else {
    const bm = store.addBasemap()
    if (bm) store.addCustomFrame(bm, frameType)
  }
}
</script>

<style scoped lang="scss">
// ── Host: always occupies 36px rail in flow when unpinned ──
.sidebar-host {
  position: relative;
  flex-shrink: 0;
  align-self: stretch;
  width: 36px;

  // Pinned: host is transparent to layout; aside becomes a direct flex child
  &.is-pinned {
    display: contents;
  }
}

// ── Sidebar: overlays when unpinned, in-flow when pinned ──
.left-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 228px;
  z-index: 100;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.22s ease;

  &.is-collapsed {
    width: 36px;
    box-shadow: none;
  }

  // Pinned: in flow, no overlay shadow
  .sidebar-host.is-pinned & {
    position: relative;
    flex-shrink: 0;
    box-shadow: none;
    bottom: auto;
  }
}

// ── Tabs ──
.tabs {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  padding: 5px 6px 0;
  gap: 2px;
  min-height: 44px;

  .is-collapsed & {
    flex-direction: column;
    padding: 0;
    gap: 0;
    min-height: unset;
    align-items: stretch;
    border-bottom: none;
  }
}

.pin-btn {
  flex-shrink: 0;
  margin-left: auto;
  margin-bottom: 1px;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  border-radius: 5px;
  transition: background 0.15s, color 0.15s;
  svg { transition: transform 0.2s; transform: rotate(45deg); }
  &:hover { background: #e5e7eb; color: #374151; }
  &.pinned { color: #0891B2; svg { transform: rotate(0deg); } }

  .is-collapsed & {
    margin-left: 0;
    margin-bottom: 0;
    width: 100%;
    height: auto;
    min-height: 36px;
    border-radius: 0;
    border-bottom: 1px solid #f3f4f6;
  }
}

.tab {
  flex: 1;
  padding: 7px 4px 5px;
  border: none;
  background: transparent;
  font-size: 9px;
  font-weight: 500;
  color: #9ca3af;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border-radius: 4px 4px 0 0;
  font-family: inherit;
  letter-spacing: 0.03em;

  svg { width: 13px; height: 13px; flex-shrink: 0; }
  span { line-height: 1; }

  &:hover { color: #374151; background: #f3f4f6; }
  &.active {
    color: #0891B2;
    border-bottom-color: #0891B2;
    background: #fff;
    font-weight: 600;
  }

  .is-collapsed & {
    flex: none;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: auto;
    min-height: 52px;
    padding: 8px 0;
    margin-bottom: 0;
    border-bottom: none;
    border-right: 2px solid transparent;
    border-radius: 0;
    width: 100%;
    border-bottom: 1px solid #f3f4f6;

    span {
      writing-mode: vertical-lr;
      font-size: 10px;
      letter-spacing: 0.1em;
    }

    &:hover { background: #f3f4f6; color: #374151; }
    &.active {
      background: #f0f9ff;
      color: #0891B2;
      border-right-color: #0891B2;
      border-bottom-color: #0891B2;
    }
  }
}


// ── Sidebar body ──
.sidebar-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── Panel ──
.panel {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
}

.panel-hint {
  font-size: 10px;
  color: #9ca3af;
  text-align: center;
  padding: 2px 0 4px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 0;
  color: #9ca3af;
  font-size: 11px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #0891B2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 0;
  p { font-size: 11px; color: #9ca3af; text-align: center; }
}

// ── System frames ──
.system-frame-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.system-frame-card {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: grab;
  background: #f9fafb;
  font-size: 11px;
  color: #374151;
  user-select: none;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover { border-color: #0891B2; background: #f0f9ff; color: #0891B2; }
  &:active { cursor: grabbing; }
}

.sf-preview {
  width: 32px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #9ca3af;
  .system-frame-card:hover & { background: #bae6fd; color: #0891B2; }
}

.sf-label { font-size: 11px; font-weight: 500; }

// ── Elements ──
.element-section-title {
  font-size: 9px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 6px 2px 2px;
}

.element-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.element-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: grab;
  background: #f9fafb;
  font-size: 10px;
  color: #374151;
  user-select: none;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover { border-color: #0891B2; background: #f0f9ff; color: #0891B2; }
  &:active { cursor: grabbing; transform: scale(0.94); }

  .element-icon {
    width: 18px;
    height: 18px;
    :deep(svg) { width: 100%; height: 100%; }
  }
}

// ── Frames ──
.frame-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.frame-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: grab;
  background: #f9fafb;
  font-size: 11px;
  color: #374151;
  user-select: none;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover { border-color: #0891B2; background: #f0f9ff; color: #0891B2; }
  &:active { cursor: grabbing; }
}

.frame-preview {
  display: flex;
  gap: 2px;
  height: 24px;
  width: 64px;
  flex-shrink: 0;

  &--double {
    flex-direction: column;
    gap: 2px;
    height: 32px;
    .fp-row { display: flex; gap: 2px; flex: 1; }
    .fp-col { flex: 1; }
  }

  &.fp--composite-left {
    .fp-col--large { flex: 2; }
    .fp-col-group { flex: 1; display: flex; flex-direction: column; gap: 2px;
      .fp-col { flex: 1; } }
  }

  &.fp--composite-right {
    flex-direction: row-reverse;
    .fp-col--large { flex: 2; }
    .fp-col-group { flex: 1; display: flex; flex-direction: column; gap: 2px;
      .fp-col { flex: 1; } }
  }

  .fp-col {
    flex: 1;
    background: #d1d5db;
    border-radius: 2px;
    .frame-card:hover & { background: #7dd3fc; }
  }
}
</style>
