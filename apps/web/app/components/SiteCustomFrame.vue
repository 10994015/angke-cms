<template>
  <div class="custom-frame" :class="`layout-${frameLayout}`">
    <div class="frame-container" :style="frameContainerStyle">

      <!-- 雙列版面配置 2_2 / 2_3 / 2_4（手機收合成單欄 grid） -->
      <template v-if="isDoubleRowLayout && !isMobile">
        <div class="double-row">
          <div v-for="(el, i) in doubleRowSplit.row1" :key="`r1-${i}`" class="grid-cell" :style="cellStyle(el)">
            <SiteElementRenderer :element="el" :cell-index="i" />
          </div>
        </div>
        <div class="double-row">
          <div v-for="(el, i) in doubleRowSplit.row2" :key="`r2-${i}`" class="grid-cell" :style="cellStyle(el)">
            <SiteElementRenderer :element="el" :cell-index="doubleLayoutCols + i" />
          </div>
        </div>
      </template>

      <!-- 複合版面配置 A / B / C / D（手機收合成單欄 grid） -->
      <template v-else-if="isCompositeLayout && compositeInfo && !isMobile">
        <div class="composite-frame">
          <div class="composite-col composite-col--left" :style="{ width: compositeInfo.leftWidth }">
            <div v-for="idx in compositeInfo.leftCells" :key="`cl-${idx}`" class="grid-cell composite-cell" :style="compositeCellStyle(displayElements[idx])">
              <SiteElementRenderer :element="displayElements[idx]" :cell-index="idx" />
            </div>
          </div>
          <div class="composite-col composite-col--right">
            <div v-for="idx in compositeInfo.rightCells" :key="`cr-${idx}`" class="grid-cell composite-cell" :style="compositeCellStyle(displayElements[idx])">
              <SiteElementRenderer :element="displayElements[idx]" :cell-index="idx" />
            </div>
          </div>
        </div>
      </template>

      <!-- 單列版面配置 / 手機版回退（依裝置重排） -->
      <div v-else class="frame-grid" :style="gridStyle">
        <div v-for="({ element, origIndex }) in reorderedWithIndex" :key="`cell-${origIndex}`" class="grid-cell" :style="cellStyle(element)">
          <SiteElementRenderer :element="element" :cell-index="origIndex" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ frame: Record<string, any> }>()

/* ---- 真實視窗寬度 → 裝置判斷（取代編輯器的按鈕切換 store.currentDevice） ---- */
const MOBILE_MAX = 768
const TABLET_MAX = 1024
const viewportWidth = ref(1280) // SSR 預設桌面，掛載後以實際寬度覆蓋

const updateWidth = () => { viewportWidth.value = window.innerWidth }
onMounted(() => { updateWidth(); window.addEventListener('resize', updateWidth) })
onBeforeUnmount(() => { window.removeEventListener('resize', updateWidth) })

const currentDevice = computed(() => {
  if (viewportWidth.value <= MOBILE_MAX) return 'mobile'
  if (viewportWidth.value <= TABLET_MAX) return 'tablet'
  return 'desktop'
})
const isMobile = computed(() => currentDevice.value === 'mobile')
const isTablet = computed(() => currentDevice.value === 'tablet')
const DEVICE_KEY = computed(() => (({ desktop: 'pc', tablet: 'tablet', mobile: 'phone' } as Record<string, string>)[currentDevice.value] || 'pc'))

/* ---- 版面解析 ---- */
const frameLayout = computed(() => {
  const type = props.frame?.type || ''
  if (type.startsWith('FRAME')) return type.replace(/^FRAME[-_]?/, '').replace(/-/g, '_') || '1_1'
  return type
})

const CELL_COUNTS: Record<string, number> = { A: 3, B: 3, C: 4, D: 4, '1_1': 1, '1_2': 2, '1_3': 3, '1_4': 4, '2_2': 4, '2_3': 6, '2_4': 8 }
const cellCount = computed(() => CELL_COUNTS[frameLayout.value] ?? 1)

const displayElements = computed(() => {
  const els = [...(props.frame.elements || [])]
  while (els.length < cellCount.value) els.push(null)
  return els.slice(0, cellCount.value)
})

const doubleLayoutCols = computed(() => (({ '2_2': 2, '2_3': 3, '2_4': 4 } as any)[frameLayout.value]) ?? 0)
const isDoubleRowLayout = computed(() => doubleLayoutCols.value > 0)
const isCompositeLayout = computed(() => ['A', 'B', 'C', 'D'].includes(frameLayout.value))
const isSingleRowMultiCol = computed(() => ['1_2', '1_3', '1_4'].includes(frameLayout.value))
const isMultiColumnLayout = computed(() => ['A', 'B', 'C', 'D', '2_2', '2_3', '2_4'].includes(frameLayout.value))

const doubleRowSplit = computed(() => {
  if (!isDoubleRowLayout.value) return { row1: [], row2: [] }
  const c = doubleLayoutCols.value
  const els = displayElements.value
  return { row1: els.slice(0, c), row2: els.slice(c, c * 2) }
})

const compositeInfo = computed(() => {
  const defaults: Record<string, any> = {
    A: { leftCells: [0],       rightCells: [1, 2],    defaultLeft: 67 },
    B: { leftCells: [0, 1],    rightCells: [2],       defaultLeft: 33 },
    C: { leftCells: [0],       rightCells: [1, 2, 3], defaultLeft: 67 },
    D: { leftCells: [0, 1, 2], rightCells: [3],       defaultLeft: 25 },
  }
  const info = defaults[frameLayout.value]
  if (!info) return null
  const stored = props.frame.data?.columnWidths
  const leftPct = (Array.isArray(stored) && stored.length === 2) ? stored[0] : info.defaultLeft
  return { ...info, leftWidth: `${leftPct}%` }
})

/* ---- 手機版按欄重排（對齊編輯器） ---- */
const reorderedWithIndex = computed(() => {
  const els = displayElements.value
  const layout = frameLayout.value
  const byCol = (cols: number, rows: number) => {
    const result: any[] = []
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

/* ---- 依裝置挑 padding ---- */
const cellStyle = (element: any) => {
  const styles: Record<string, string> = {}
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

const compositeCellStyle = (element: any) => {
  if (element?.padding) {
    const p = element.padding[DEVICE_KEY.value] || element.padding.pc || {}
    return { padding: `${p.top ?? 20}px ${p.right ?? 20}px ${p.bottom ?? 20}px ${p.left ?? 20}px` }
  }
  return { padding: '20px' }
}

/* ---- 依裝置算 grid 欄數（對齊編輯器） ---- */
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
      return { display: 'grid', gridTemplateColumns: colWidths.map((w: number) => `${w}%`).join(' '), gap: '0' }
    }
    return { display: 'grid', gridTemplateColumns: `repeat(${cellCount.value}, 1fr)`, gap: '0' }
  }
  const dblGrids: Record<string, string> = {
    '2_2': 'repeat(2, 1fr)',
    '2_3': 'repeat(3, 1fr)',
    '2_4': isTablet.value ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
  }
  if (dblGrids[layout]) {
    return { display: 'grid', gridTemplateColumns: dblGrids[layout], gap: '0' }
  }
  return { display: 'grid', gridTemplateColumns: '1fr', gap: '0' }
})
</script>

<style scoped>
.custom-frame { position: relative; }
.frame-container { max-width: 1280px; margin: 0 auto; width: 100%; }
.frame-grid { width: 100%; }
.double-row { display: flex; width: 100%; }
.double-row .grid-cell { flex: 1; min-width: 0; }
.composite-frame { display: flex; width: 100%; align-items: stretch; }
.composite-col { display: flex; flex-direction: column; flex-shrink: 0; }
.composite-col--right { flex: 1; min-width: 0; }
.composite-cell { width: 100%; box-sizing: border-box; }
.grid-cell { box-sizing: border-box; min-width: 0; }
</style>
