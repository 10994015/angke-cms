<template>
  <div
    class="custom-frame"
    :class="[`layout-${frameLayout}`, { 'is-selected': isFrameSelected, 'is-dragging': isDragging }]"
    @click.stop="store.selectFrame(frame)"
  >
    <!-- 刪除版面配置按鈕（無元件時顯示） -->
    <button
      v-if="isFrameSelected && !hasAnyElement"
      class="delete-frame-btn"
      @click.stop="handleDeleteFrame"
      title="刪除此版面配置"
    >✕</button>

    <div class="frame-container" :style="frameContainerStyle">

      <!-- 雙列版面配置 -->
      <template v-if="isDoubleRowLayout && !isMobile">
        <div class="double-row">
          <div
            v-for="(element, index) in doubleRowSplit.row1"
            :key="`r1-${index}`"
            class="grid-cell"
            :class="cellClass(element, index)"
            :style="cellStyle(element)"
            @click.stop="handleCellClick(index, element)"
            @dragover="handleDragOver($event, index)"
            @dragleave="dragOverCell = null"
            @drop="handleDrop($event, index)"
          >
            <FrameElementRenderer
              :element="element" :cell-index="index" :is-drag-over="dragOverCell === index"
              @delete="store.deleteElementFromCell(frame, index)"
            />
          </div>
        </div>
        <div class="double-row">
          <div
            v-for="(element, rIndex) in doubleRowSplit.row2"
            :key="`r2-${rIndex}`"
            class="grid-cell"
            :class="cellClass(element, doubleLayoutCols + rIndex)"
            :style="cellStyle(element)"
            @click.stop="handleCellClick(doubleLayoutCols + rIndex, element)"
            @dragover="handleDragOver($event, doubleLayoutCols + rIndex)"
            @dragleave="dragOverCell = null"
            @drop="handleDrop($event, doubleLayoutCols + rIndex)"
          >
            <FrameElementRenderer
              :element="element" :cell-index="doubleLayoutCols + rIndex" :is-drag-over="dragOverCell === (doubleLayoutCols + rIndex)"
              @delete="store.deleteElementFromCell(frame, doubleLayoutCols + rIndex)"
            />
          </div>
        </div>
      </template>

      <!-- 複合版面配置 A/B/C/D -->
      <template v-else-if="isCompositeLayout && compositeInfo && !isMobile">
        <div class="composite-frame" :class="compositeInfo.reverse ? 'composite-frame--reverse' : ''">
          <div class="composite-col composite-col--left" :style="{ width: compositeInfo.leftWidth }">
            <div
              v-for="idx in compositeInfo.leftCells"
              :key="`cl-${idx}`"
              class="grid-cell composite-cell"
              :class="cellClass(displayElements[idx], idx)"
              :style="cellStyle(displayElements[idx])"
              @click.stop="handleCellClick(idx, displayElements[idx])"
              @dragover="handleDragOver($event, idx)"
              @dragleave="dragOverCell = null"
              @drop="handleDrop($event, idx)"
            >
              <FrameElementRenderer
                :element="displayElements[idx]" :cell-index="idx" :is-drag-over="dragOverCell === idx"
                @delete="store.deleteElementFromCell(frame, idx)"
              />
            </div>
          </div>
          <div class="composite-col composite-col--right">
            <div
              v-for="idx in compositeInfo.rightCells"
              :key="`cr-${idx}`"
              class="grid-cell composite-cell"
              :class="cellClass(displayElements[idx], idx)"
              :style="compositeCellStyle(displayElements[idx])"
              @click.stop="handleCellClick(idx, displayElements[idx])"
              @dragover="handleDragOver($event, idx)"
              @dragleave="dragOverCell = null"
              @drop="handleDrop($event, idx)"
            >
              <FrameElementRenderer
                :element="displayElements[idx]" :cell-index="idx" :is-drag-over="dragOverCell === idx"
                @delete="store.deleteElementFromCell(frame, idx)"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 單列版面配置 / 手機版回退 -->
      <div v-else class="frame-grid" :style="gridStyle">
        <div
          v-for="({ element, origIndex }) in reorderedWithIndex"
          :key="`cell-${origIndex}`"
          class="grid-cell"
          :class="cellClass(element, origIndex)"
          :style="cellStyle(element)"
          @click.stop="handleCellClick(origIndex, element)"
          @dragover="handleDragOver($event, origIndex)"
          @dragleave="dragOverCell = null"
          @drop="handleDrop($event, origIndex)"
        >
          <FrameElementRenderer
            :element="element" :cell-index="origIndex" :is-drag-over="dragOverCell === origIndex"
            @delete="store.deleteElementFromCell(frame, origIndex)"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'
import { parseFrameLayout, getCellCount } from '@/stores/pageEditor'
import FrameElementRenderer from './elements/FrameElementRenderer.vue'

const props = defineProps({
  frame:       { type: Object, required: true },
  basemap:     { type: Object, required: true },
  frameIndex:  { type: Number, required: true },
  totalFrames: { type: Number, required: true },
})

const store = usePageEditorStore()
const dragOverCell = ref(null)
const isDragging   = ref(false)

if (typeof window !== 'undefined') {
  window.addEventListener('dragstart', () => { isDragging.value = true })
  window.addEventListener('dragend',   () => { isDragging.value = false; dragOverCell.value = null })
}

// 側邊欄 type → API type 對應
const SIDEBAR_TO_API = {
  'text': 'TEXT', 'image': 'IMG', 'button': 'BUTTON',
  'carousel': 'CAROUSEL_IMG', 'map': 'GOOGLE_MAP',
  'accordion': 'ACCORDION', 'iframe': 'IFRAME',
  'hline': 'HORIZON_LINE',
}

const frameLayout = computed(() => parseFrameLayout(props.frame?.type))
const cellCount   = computed(() => getCellCount(props.frame?.type))

const displayElements = computed(() => {
  const els = props.frame.elements || []
  const arr = [...els]
  while (arr.length < cellCount.value) arr.push(null)
  return arr.slice(0, cellCount.value)
})

const hasAnyElement = computed(() => displayElements.value.some(el => el && el.type))

const isFrameSelected   = computed(() => store.selected.frame === props.frame)
const isMobile          = computed(() => store.currentDevice === 'mobile')
const isTablet          = computed(() => store.currentDevice === 'tablet')

const doubleLayoutCols = computed(() => ({ '2_2': 2, '2_3': 3, '2_4': 4 }[frameLayout.value] || 0))
const isDoubleRowLayout  = computed(() => doubleLayoutCols.value > 0)
const isCompositeLayout  = computed(() => ['A', 'B', 'C', 'D'].includes(frameLayout.value))
const isSingleRowMultiCol = computed(() => ['1_2', '1_3', '1_4'].includes(frameLayout.value))
const isMultiColumnLayout = computed(() => ['A','B','C','D','2_2','2_3','2_4'].includes(frameLayout.value))

const doubleRowSplit = computed(() => {
  if (!isDoubleRowLayout.value) return null
  const c = doubleLayoutCols.value
  return { row1: displayElements.value.slice(0, c), row2: displayElements.value.slice(c, c * 2) }
})

const compositeInfo = computed(() => {
  const defaults = {
    'A': { leftCells: [0],       rightCells: [1, 2],    defaultLeft: 67, reverse: false },
    'B': { leftCells: [0, 1],    rightCells: [2],       defaultLeft: 33, reverse: false },
    'C': { leftCells: [0],       rightCells: [1, 2, 3], defaultLeft: 67, reverse: false },
    'D': { leftCells: [0, 1, 2], rightCells: [3],       defaultLeft: 25, reverse: false },
  }
  const info = defaults[frameLayout.value]
  if (!info) return null
  const stored = props.frame.data?.columnWidths
  const leftPct = (Array.isArray(stored) && stored.length === 2) ? stored[0] : info.defaultLeft
  return { ...info, leftWidth: `${leftPct}%` }
})

// 手機版重新排列（按欄）
const reorderedWithIndex = computed(() => {
  const els    = displayElements.value
  const layout = frameLayout.value
  const byCol  = (cols, rows) => {
    const result = []
    for (let col = 0; col < cols; col++)
      for (let row = 0; row < rows; row++) {
        const i = row * cols + col
        result.push({ element: els[i], origIndex: i })
      }
    return result
  }
  if (layout === '2_2' && isMobile.value) return byCol(2, 2)
  if (layout === '2_3' && isMobile.value) return byCol(3, 2)
  if (layout === '2_4' && (isMobile.value || isTablet.value)) return byCol(4, 2)
  return els.map((element, origIndex) => ({ element, origIndex }))
})

const frameContainerStyle = computed(() => ({
  maxWidth: props.frame.metadata?.frameWidth || '1280px',
  margin: '0 auto',
  width: '100%',
}))

const DEVICE_KEY = computed(() => ({ desktop: 'pc', tablet: 'tablet', mobile: 'phone' }[store.currentDevice] || 'pc'))

const cellStyle = (element) => {
  const styles = {}
  if (element?.padding) {
    const p = element.padding[DEVICE_KEY.value] || element.padding.pc || {}
    styles.padding = `${p.top ?? 20}px ${p.right ?? 20}px ${p.bottom ?? 20}px ${p.left ?? 20}px`
  } else {
    styles.padding = '20px'
  }
  if (element?.width) {
    styles.flex = element.width === 'auto' ? '1' : `0 0 ${element.width}`
  }
  return styles
}

// Composite cells live in flex-direction:column containers — flex: 1 there means vertical
// growth, which balloons the cell far beyond its content. Only apply padding for these.
const compositeCellStyle = (element) => {
  if (element?.padding) {
    const p = element.padding[DEVICE_KEY.value] || element.padding.pc || {}
    return { padding: `${p.top ?? 20}px ${p.right ?? 20}px ${p.bottom ?? 20}px ${p.left ?? 20}px` }
  }
  return { padding: '20px' }
}

const gridStyle = computed(() => {
  const layout = frameLayout.value
  if (isMobile.value && (isMultiColumnLayout.value || isSingleRowMultiCol.value)) {
    return { display: 'grid', gridTemplateColumns: '1fr', gap: '0' }
  }
  if (isTablet.value && isSingleRowMultiCol.value) {
    return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }
  }
  if (isSingleRowMultiCol.value) {
    const colWidths = props.frame.data?.columnWidths
    if (Array.isArray(colWidths) && colWidths.length === cellCount.value) {
      return { display: 'grid', gridTemplateColumns: colWidths.map(w => `${w}%`).join(' '), gap: '0' }
    }
    return { display: 'grid', gridTemplateColumns: `repeat(${cellCount.value}, 1fr)`, gap: '0' }
  }
  const dblGrids = {
    '2_2': 'repeat(2, 1fr)',
    '2_3': 'repeat(3, 1fr)',
    '2_4': isTablet.value ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
  }
  if (dblGrids[layout]) {
    return { display: 'grid', gridTemplateColumns: dblGrids[layout], gap: '0' }
  }
  return { display: 'grid', gridTemplateColumns: '1fr', gap: '0' }
})

const isElementSelected = (index) => store.selected.element && store.selected.element === displayElements.value[index]
const isCellSelected    = (index) => store.selected.cell?.frame === props.frame && store.selected.cell?.cellIndex === index

const cellClass = (element, index) => ({
  'has-element': element && element.type,
  'is-selected': isElementSelected(index) || isCellSelected(index),
  'empty-cell':  !element || !element.type,
})

const handleCellClick = (index, element) => {
  if (element && element.type) {
    store.selectElement(element)
  } else {
    store.selectCell({ frame: props.frame, cellIndex: index })
  }
}

const handleDragOver = (event, index) => {
  event.preventDefault()
  const element = displayElements.value[index]
  if (element && element.type) {
    event.dataTransfer.dropEffect = 'none'
    dragOverCell.value = null
  } else {
    event.dataTransfer.dropEffect = 'copy'
    dragOverCell.value = index
  }
}

const handleDrop = (event, index) => {
  try {
    const raw = event.dataTransfer.getData('application/json')
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.dragType !== 'element') return
    event.preventDefault()
    event.stopPropagation()
    dragOverCell.value = null

    if (displayElements.value[index]?.type) {
      alert('此格子已有元件，請先刪除再放入新元件')
      return
    }

    const apiType = SIDEBAR_TO_API[data.type] || data.type?.toUpperCase()
    if (apiType) store.addElementToCell(props.frame, index, apiType)
  } catch (err) {
    console.error('drop error:', err)
  }
}

const handleDeleteFrame = () => {
  if (!confirm('確定要刪除此版面配置嗎？')) return
  store.deleteFrame(props.basemap, props.frameIndex)
}
</script>

<style scoped lang="scss">
.custom-frame {
  position: relative;
  background: transparent;
  transition: box-shadow 0.2s;
  cursor: pointer;

  &:hover { box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.25); }
  &.is-selected { box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.5); }
}

.delete-frame-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 50;
  transition: all 0.15s;
  &:hover { background: #dc3545; color: #fff; }
}


.frame-container {}

.frame-grid { width: 100%; }
.double-row {
  display: flex;
  width: 100%;
  > .grid-cell { flex: 1; min-width: 0; }
}

.composite-frame {
  display: flex;
  width: 100%;
  align-items: stretch;

  &--reverse { flex-direction: row-reverse; }
}

.composite-col {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &--left { }
  &--right { flex: 1; min-width: 0; }
}

.composite-cell { width: 100%; box-sizing: border-box; }


.grid-cell {
  position: relative;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.15s;
  box-sizing: border-box;
  min-height: 60px;
  min-width: 0;

  &.has-element {
    cursor: pointer;
    &:hover { border-color: rgba(8, 145, 178, 0.5); }
    &.is-selected { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.12); }
  }

  &.empty-cell.is-selected {
    border: 2px dashed #0891B2;
    background: rgba(8, 145, 178, 0.04);
  }
}

// 拖曳中，空格子高亮
.custom-frame.is-dragging :deep(.empty-cell) {
  background: rgba(8, 145, 178, 0.04);
  border-color: rgba(8, 145, 178, 0.3);
}
</style>
