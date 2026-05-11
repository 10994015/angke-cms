<template>
  <div class="tree-node" :style="{ paddingLeft: depth * 20 + 'px' }">
    <div
      class="tree-row"
      :class="{ 'is-drag-over': isDragOver, 'is-dragging': isDragging }"
      draggable="true"
      @dragstart.stop="onDragStart"
      @dragend.stop="onDragEnd"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.prevent.stop="onDrop"
    >
      <!-- Drag handle (visual only) -->
      <div class="drag-handle" title="拖曳移動">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
        </svg>
      </div>

      <!-- Expand toggle -->
      <button v-if="node.children?.length" class="toggle-btn" @click.stop="expanded = !expanded" @dragstart.stop>
        <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"
          :style="{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
      <span v-else class="toggle-placeholder" />

      <span class="tree-name">{{ node.tab || node.slug }}</span>
      <span class="tree-slug">/{{ node.slug }}</span>
      <span class="tree-layer">{{ node.layer }}</span>

      <div class="tree-actions" @dragstart.stop>
        <button class="action-btn primary" @click.stop="$emit('edit', node)" title="進入 CMS 編輯器">
          <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
          編輯
        </button>
        <button class="action-btn info" @click.stop="$emit('info', node)" title="編輯頁面資料（SEO）">
          <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          資訊
        </button>
        <button class="action-btn" @click.stop="$emit('copy', node)" title="複製頁面">
          <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"/>
          </svg>
          複製
        </button>
        <button class="action-btn" @click.stop="$emit('move', node)" title="選擇上層頁面">
          <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
            <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z"/>
          </svg>
          移動
        </button>
        <button class="action-btn danger" @click.stop="$emit('delete', node)" title="刪除頁面">
          <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          刪除
        </button>
      </div>
    </div>

    <template v-if="expanded && node.children?.length">
      <PageTreeNode
        v-for="child in node.children"
        :key="child.slug"
        :node="child"
        :depth="depth + 1"
        @edit="$emit('edit', $event)"
        @info="$emit('info', $event)"
        @delete="$emit('delete', $event)"
        @copy="$emit('copy', $event)"
        @move="$emit('move', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const props = defineProps({
  node:  { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

defineEmits(['edit', 'info', 'delete', 'copy', 'move'])

const expanded = ref(true)

const treeDrag   = inject('treeDrag', null)
const isDragOver = ref(false)
const isDragging = computed(() => treeDrag?.draggedNode.value?.slug === props.node.slug)

const onDragStart = (e) => {
  if (!treeDrag) return
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.node.slug)
  // 延後更新 reactive state，避免 Vue re-render 在 dragstart 期間取消拖曳
  setTimeout(() => { treeDrag.draggedNode.value = props.node }, 0)
}

const onDragEnd = () => {
  if (!treeDrag) return
  treeDrag.draggedNode.value = null
  isDragOver.value = false
}

const onDragOver = (e) => {
  const dragged = treeDrag?.draggedNode.value
  // draggedNode 可能因 setTimeout 還沒設定，改從 dataTransfer 取 slug
  const draggedSlug = dragged?.slug ?? e.dataTransfer.getData('text/plain')
  if (!draggedSlug || draggedSlug === props.node.slug) return
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (e) => {
  isDragOver.value = false
  if (!treeDrag) return
  const draggedSlug = e.dataTransfer.getData('text/plain')
  if (!draggedSlug || draggedSlug === props.node.slug) return
  treeDrag.onDropToNode(props.node, draggedSlug)
}
</script>

<style scoped lang="scss">
.tree-node { display: flex; flex-direction: column; }

.tree-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 10px 8px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.1s;
  cursor: grab;
  user-select: none;

  &:hover { background: #fafafa; }
  &:active { cursor: grabbing; }

  &.is-drag-over {
    background: #f0f9ff;
    outline: 2px dashed #0891B2;
    outline-offset: -2px;
    border-radius: 6px;
  }

  &.is-dragging {
    opacity: 0.4;
    cursor: grabbing;
  }
}

.drag-handle {
  color: #d1d5db;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
  pointer-events: none;
}

.toggle-btn {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  border-radius: 4px;
  padding: 0;
  &:hover { background: #f3f4f6; color: #374151; }
}

.toggle-placeholder { width: 20px; flex-shrink: 0; }

.tree-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-slug {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
}

.tree-layer {
  font-size: 11px;
  color: #9ca3af;
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  min-width: 28px;
  text-align: center;
}

.tree-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  cursor: default;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  background: #fff;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover { border-color: #9ca3af; background: #f9fafb; }

  &.primary {
    border-color: #0891B2;
    color: #0891B2;
    background: #f0f9ff;
    &:hover { background: #0891B2; color: #fff; }
  }

  &.info {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
    &:hover { background: #3b82f6; color: #fff; }
  }

  &.danger {
    &:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
  }
}
</style>
