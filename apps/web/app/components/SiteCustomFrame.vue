<template>
  <div class="custom-frame" :class="`layout-${frameLayout}`">
    <div class="frame-container" :style="frameContainerStyle">

      <!-- Double row: 2_2 / 2_3 / 2_4 -->
      <template v-if="isDoubleRowLayout">
        <div class="double-row">
          <div v-for="(el, i) in doubleRowSplit.row1" :key="`r1-${i}`" class="grid-cell" :style="{ padding: getCellPadding(el) }">
            <SiteElementRenderer :element="el" :cell-index="i" />
          </div>
        </div>
        <div class="double-row">
          <div v-for="(el, i) in doubleRowSplit.row2" :key="`r2-${i}`" class="grid-cell" :style="{ padding: getCellPadding(el) }">
            <SiteElementRenderer :element="el" :cell-index="i" />
          </div>
        </div>
      </template>

      <!-- Composite: A / B / C / D -->
      <template v-else-if="isCompositeLayout && compositeInfo">
        <div class="composite-frame">
          <div class="composite-col composite-col--left" :style="{ width: compositeInfo.leftWidth }">
            <div v-for="idx in compositeInfo.leftCells" :key="`cl-${idx}`" class="grid-cell composite-cell" :style="{ padding: getCellPadding(displayElements[idx]) }">
              <SiteElementRenderer :element="displayElements[idx]" :cell-index="idx" />
            </div>
          </div>
          <div class="composite-col composite-col--right">
            <div v-for="idx in compositeInfo.rightCells" :key="`cr-${idx}`" class="grid-cell composite-cell" :style="{ padding: getCellPadding(displayElements[idx]) }">
              <SiteElementRenderer :element="displayElements[idx]" :cell-index="idx" />
            </div>
          </div>
        </div>
      </template>

      <!-- Standard grid -->
      <div v-else class="frame-grid" :style="gridStyle">
        <div v-for="(el, i) in displayElements" :key="`cell-${i}`" class="grid-cell" :style="{ padding: getCellPadding(el) }">
          <SiteElementRenderer :element="el" :cell-index="i" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ frame: Record<string, any> }>()

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

const doubleLayoutCols = computed(() => ({ '2_2': 2, '2_3': 3, '2_4': 4 } as any)[frameLayout.value] ?? 0)
const isDoubleRowLayout = computed(() => doubleLayoutCols.value > 0)
const isCompositeLayout = computed(() => ['A', 'B', 'C', 'D'].includes(frameLayout.value))

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

const frameContainerStyle = computed(() => ({
  maxWidth: props.frame.metadata?.frameWidth || '1280px',
  margin: '0 auto',
  width: '100%',
}))

const isSingleRowMulti = computed(() => ['1_2', '1_3', '1_4'].includes(frameLayout.value))
const isMultiCol       = computed(() => ['A', 'B', 'C', 'D', '2_2', '2_3', '2_4'].includes(frameLayout.value))

const gridStyle = computed(() => {
  const layout = frameLayout.value
  if (['1_1', '1_2', '1_3', '1_4'].includes(layout)) {
    const colWidths = props.frame.data?.columnWidths
    if (Array.isArray(colWidths) && colWidths.length === cellCount.value) {
      return { display: 'grid', gridTemplateColumns: colWidths.map((w: number) => `${w}%`).join(' ') }
    }
    return { display: 'grid', gridTemplateColumns: `repeat(${cellCount.value}, 1fr)` }
  }
  const gridMap: Record<string, string> = { '2_2': 'repeat(2, 1fr)', '2_3': 'repeat(3, 1fr)', '2_4': 'repeat(4, 1fr)' }
  return { display: 'grid', gridTemplateColumns: gridMap[layout] || 'repeat(auto-fit, minmax(200px,1fr))', gap: '0' }
})

const DEVICE_KEY: Record<string, string> = { desktop: 'pc', tablet: 'tablet', mobile: 'phone' }
const getCellPadding = (el: any) => {
  if (!el?.padding) return '20px'
  const p = el.padding
  const sub = (p.pc !== undefined) ? p['pc'] : p
  const { top = 20, right = 20, bottom = 20, left = 20 } = sub || {}
  return `${top}px ${right}px ${bottom}px ${left}px`
}
</script>

<style scoped>
.custom-frame { position: relative; }
.frame-container { max-width: 1280px; margin: 0 auto; width: 100%; }
.frame-grid { width: 100%; }
.double-row { display: flex; width: 100%; }
.double-row .grid-cell { flex: 1; min-width: 0; }
.composite-frame { display: flex; width: 100%; align-items: stretch; }
.composite-col { display: flex; flex-direction: column; flex-shrink: 0; }
.composite-col--right { flex: 1; }
.composite-cell { width: 100%; box-sizing: border-box; }
.grid-cell { box-sizing: border-box; }
@media (max-width: 768px) {
  .frame-grid { grid-template-columns: 1fr !important; }
  .double-row { flex-direction: column; }
  .composite-frame { flex-direction: column; }
  .composite-col--left { width: 100% !important; }
}
</style>
