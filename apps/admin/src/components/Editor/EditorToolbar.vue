<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <button class="btn btn-back" @click="handleBack" title="返回管理後台">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回後台
      </button>

      <div v-if="store.locales.length > 1" class="toolbar-divider" />

      <select
        v-if="store.locales.length > 1"
        :value="store.currentLocale"
        class="toolbar-select locale-select"
        @change="onLocaleChange"
      >
        <option v-for="loc in store.locales" :key="loc.locale" :value="loc.locale">
          {{ loc.label || loc.locale }}
        </option>
      </select>

      <span v-if="store.hasUnsavedChanges" class="unsaved-badge">未儲存</span>
    </div>

    <div class="toolbar-center">
      <div class="device-toggle">
        <button class="device-btn" :class="{ active: store.currentDevice === 'desktop' }" @click="store.setCurrentDevice('desktop')" title="電腦版">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/>
          </svg>
        </button>
        <button class="device-btn" :class="{ active: store.currentDevice === 'eposter' }" @click="store.setCurrentDevice('eposter')" title="電子刊版（1080px）">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>
          </svg>
        </button>
        <button class="device-btn" :class="{ active: store.currentDevice === 'tablet' }" @click="store.setCurrentDevice('tablet')" title="平板版">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </button>
        <button class="device-btn" :class="{ active: store.currentDevice === 'mobile' }" @click="store.setCurrentDevice('mobile')" title="手機版">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="toolbar-right">
      <button class="btn" @click="$emit('page-settings')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        頁面設定
      </button>
      <button class="btn" @click="$emit('preview')">預覽</button>
      <button class="btn" :disabled="store.isSaving" @click="$emit('save')">
        {{ store.isSaving ? '儲存中...' : '儲存草稿' }}
      </button>
      <button class="btn btn-primary" @click="$emit('publish')">發布</button>
      <a class="btn btn-visit" :href="siteUrl" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        前往網站
      </a>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'
import { useRouter } from 'vue-router'

const store = usePageEditorStore()
const router = useRouter()

defineEmits(['preview', 'save', 'publish', 'page-settings'])

const onLocaleChange = (e) => store.reloadCurrentPage(e.target.value)

const siteUrl = computed(() => {
  const locale = (store.currentLocale || 'zh-tw').toLowerCase()
  const slug   = store.currentPageSlug || 'home'
  const base   = store.websiteSettings?.domainName?.replace(/\/$/, '') || 'http://localhost:3000'
  return `${base}/${locale}/${slug}`
})

const handleBack = () => {
  if (store.hasUnsavedChanges && !confirm('確定要返回後台嗎？未儲存的變更將會遺失。')) return
  router.push({ path: '/backend/dashboard' })
}
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  z-index: 100;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.toolbar-right { justify-content: flex-end; }

.toolbar-center {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}


.toolbar-divider {
  width: 1px;
  height: 16px;
  background: #e5e7eb;
  margin: 0 3px;
  flex-shrink: 0;
}

// ── Locale select ──

.toolbar-select {
  padding: 5px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: #fff;
  color: #374151;
  min-width: 80px;
  outline: none;
  font-family: inherit;
  &:hover { border-color: #0891B2; color: #111827; }
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.12); }
}

// ── Buttons ──

.btn {
  padding: 5px 11px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #111827;
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  svg { width: 13px; height: 13px; flex-shrink: 0; }
}

.btn-back {
  border-color: transparent;
  background: transparent;
  color: #9ca3af;
  padding: 5px 9px;
  &:hover { color: #374151; background: #f3f4f6; border-color: transparent; }
}

.btn-primary {
  background: #0891B2;
  color: #fff;
  border-color: #0891B2;
  font-weight: 600;
  letter-spacing: 0.01em;
  &:hover:not(:disabled) { background: #0E7490; border-color: #0E7490; color: #fff; }
}

.btn-visit {
  border-color: #d1fae5;
  background: #f0fdf4;
  color: #059669;
  font-weight: 500;
  text-decoration: none;
  &:hover { background: #d1fae5; border-color: #6ee7b7; color: #047857; }
}

// ── Device toggle ──

.device-toggle {
  display: flex;
  align-items: center;
  gap: 1px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  padding: 2px;
}

.device-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.15s;
  svg { width: 13px; height: 13px; }
  &:hover { color: #374151; background: #fff; }
  &.active { background: #fff; color: #0891B2; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
}

// ── Unsaved badge ──

.unsaved-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #d97706;
    flex-shrink: 0;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
