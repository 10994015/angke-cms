<template>
  <div class="tree-node">
    <div
      class="tree-item"
      :class="{ active: store.currentPageSlug === node.slug }"
      :style="{ paddingLeft: 10 + depth * 14 + 'px' }"
      @click="handleItemClick"
    >
      <!-- 展開/收合箭頭 -->
      <span
        v-if="node.children?.length"
        class="tree-chevron"
        :class="{ open: isOpen }"
        @click.stop="isOpen = !isOpen"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" width="10" height="10">
          <path d="M5 4l5 4-5 4V4z"/>
        </svg>
      </span>
      <span v-else class="tree-leaf-dot" />

      <!-- 頁面圖示 -->
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" class="tree-page-icon">
        <rect x="2" y="1" width="10" height="13" rx="1"/>
        <line x1="4" y1="5" x2="10" y2="5"/>
        <line x1="4" y1="8" x2="10" y2="8"/>
        <line x1="4" y1="11" x2="8" y2="11"/>
      </svg>

      <span class="tree-label">{{ node.tab || node.seoTitle || node.slug }}</span>

      <span v-if="node.layer" class="tree-layer">{{ node.layer }}</span>
    </div>

    <!-- 子節點 -->
    <div v-if="isOpen && node.children?.length" class="tree-children">
      <PageNavTree
        v-for="child in node.children"
        :key="child.pageId"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'
import PageNavTree from './PageNavTree.vue'

const props = defineProps({
  node:  { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

const store  = usePageEditorStore()
const isOpen = ref(props.depth === 0)

const handleItemClick = () => {
  if (props.node.children?.length) isOpen.value = !isOpen.value
  store.loadPageContent(props.node.slug)
}
</script>

<style scoped lang="scss">
.tree-node {
  display: flex;
  flex-direction: column;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  cursor: pointer;
  border-radius: 5px;
  margin: 1px 4px;
  font-size: 12.5px;
  color: #374151;
  transition: background 0.1s, color 0.1s;
  user-select: none;

  &:hover { background: #f3f4f6; }

  &.active {
    background: #f0f9ff;
    color: #0891B2;
    font-weight: 600;
  }
}

.tree-chevron {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.15s;
  border-radius: 3px;

  &:hover { background: #e5e7eb; color: #374151; }
  &.open svg { transform: rotate(90deg); }
  svg { transition: transform 0.15s; }
}

.tree-leaf-dot {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #d1d5db;
  }
}

.tree-page-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: #9ca3af;

  .tree-item.active & { color: #0891B2; }
}

.tree-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
}

.tree-layer {
  font-size: 10px;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 3px;
  padding: 1px 4px;
  flex-shrink: 0;
  margin-right: 4px;

  .tree-item.active & { background: #fde9e2; color: #0891B2; }
}

.tree-children {
  display: flex;
  flex-direction: column;
}
</style>
