<template>
  <div class="el-iframe-wrap" :style="{ height: ensureUnit(val.height, '400px') }">

    <!-- 有效網址 -->
    <iframe
      v-if="validSrc"
      :src="validSrc"
      :title="val.title || 'iframe'"
      class="el-iframe"
      :class="{ 'is-hidden': loadFailed }"
      frameborder="0"
      allowfullscreen
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      @load="onLoad"
      @error="onError"
    />

    <!-- 載入失敗 -->
    <div v-if="validSrc && loadFailed" class="el-iframe-placeholder el-iframe-placeholder--error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>無法載入該網址</span>
      <small>{{ val.src }}</small>
    </div>

    <!-- 網址格式錯誤 -->
    <div v-else-if="val.src && !validSrc" class="el-iframe-placeholder el-iframe-placeholder--error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <span>網址格式錯誤</span>
      <small>請輸入完整網址（https://...）</small>
    </div>

    <!-- 尚未輸入 -->
    <div v-else-if="!val.src" class="el-iframe-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M8 10l3 3-3 3"/>
        <line x1="13" y1="16" x2="16" y2="16"/>
      </svg>
      <span>請在右側輸入嵌入網址</span>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ensureUnit } from '@/utils/ensureUnit'

const props = defineProps({
  val:  { type: Object, default: () => ({}) },
  meta: { type: Object, default: () => ({}) },
})

const loadFailed = ref(false)

// 只接受 http / https 開頭的絕對網址
const validSrc = computed(() => {
  const s = props.val.src?.trim()
  if (!s) return null
  try {
    const url = new URL(s)
    return url.protocol === 'http:' || url.protocol === 'https:' ? s : null
  } catch {
    return null
  }
})

// 每次網址改變就重置失敗狀態
watch(validSrc, () => { loadFailed.value = false })

const onLoad  = () => { loadFailed.value = false }
const onError = () => { loadFailed.value = true }
</script>

<style scoped lang="scss">
.el-iframe-wrap {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.el-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;

  &.is-hidden { display: none; }
}

.el-iframe-placeholder {
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f9fafb;
  color: #9ca3af;
  font-size: 12px;
  svg { width: 28px; height: 28px; }

  small {
    font-size: 10px;
    color: #d1d5db;
    word-break: break-all;
    max-width: 90%;
    text-align: center;
  }

  &--error {
    background: #fff5f5;
    color: #ef4444;
    svg { color: #ef4444; }
  }
}
</style>
