<template>
  <div class="page-editor">
    <EditorToolbar @save="handleSave" @publish="handlePublish" @preview="handlePreview" @page-settings="pageSettingsVisible = true" />

    <div class="editor-body">
      <LeftSidebar />
      <PropsPanel />
      <CanvasArea />
    </div>

    <PageSettingsModal :visible="pageSettingsVisible" @close="pageSettingsVisible = false" @deleted="pageSettingsVisible = false" />

    <!-- Toast 通知 -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>

    <!-- 骨架（只有初次進入才顯示） -->
    <Transition name="loader-fade">
      <div v-if="store.isLoading && isInitialLoad" class="loading-overlay">
        <!-- 骨架畫面 -->
        <div class="skeleton-editor">
          <!-- Toolbar 骨架 -->
          <div class="sk-toolbar">
            <div class="sk-toolbar-left">
              <div class="sk-block" style="width:72px;height:28px;border-radius:6px" />
              <div class="sk-block" style="width:1px;height:16px;background:#e5e7eb;border-radius:0" />
              <div class="sk-block" style="width:52px;height:20px;border-radius:10px" />
            </div>
            <div class="sk-toolbar-center">
              <div class="sk-block" style="width:88px;height:30px;border-radius:7px" />
            </div>
            <div class="sk-toolbar-right">
              <div class="sk-block" style="width:68px;height:28px;border-radius:6px" />
              <div class="sk-block" style="width:56px;height:28px;border-radius:6px" />
              <div class="sk-block" style="width:56px;height:28px;border-radius:6px" />
              <div class="sk-block sk-block--primary" style="width:48px;height:28px;border-radius:6px" />
            </div>
          </div>

          <!-- Body 骨架 -->
          <div class="sk-body">
            <!-- 左側欄骨架 -->
            <div class="sk-left">
              <div class="sk-tabs">
                <div class="sk-tab sk-tab--active" />
                <div class="sk-tab" />
                <div class="sk-tab" />
              </div>
              <div class="sk-sidebar-body">
                <div class="sk-block" style="width:80%;height:12px;border-radius:4px;margin-bottom:16px" />
                <div v-for="i in 4" :key="i" class="sk-card">
                  <div class="sk-block" style="width:32px;height:32px;border-radius:6px;flex-shrink:0" />
                  <div style="flex:1;display:flex;flex-direction:column;gap:6px">
                    <div class="sk-block" style="height:10px;border-radius:3px" />
                    <div class="sk-block" style="width:60%;height:8px;border-radius:3px" />
                  </div>
                </div>
                <div class="sk-block" style="width:80%;height:12px;border-radius:4px;margin:20px 0 16px" />
                <div v-for="i in 3" :key="'b'+i" class="sk-card">
                  <div class="sk-block" style="width:32px;height:32px;border-radius:6px;flex-shrink:0" />
                  <div style="flex:1;display:flex;flex-direction:column;gap:6px">
                    <div class="sk-block" style="height:10px;border-radius:3px" />
                    <div class="sk-block" style="width:60%;height:8px;border-radius:3px" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 屬性欄骨架 -->
            <div class="sk-props">
              <div class="sk-block" style="height:14px;width:60%;border-radius:4px;margin-bottom:20px" />
              <div v-for="i in 5" :key="i" style="margin-bottom:16px">
                <div class="sk-block" style="height:10px;width:40%;border-radius:3px;margin-bottom:8px" />
                <div class="sk-block" style="height:32px;border-radius:6px" />
              </div>
            </div>

            <!-- 畫布骨架 -->
            <div class="sk-canvas">
              <div class="sk-canvas-inner">
                <!-- 模擬 header 區塊 -->
                <div class="sk-basemap sk-basemap--header">
                  <div class="sk-block" style="width:120px;height:28px;border-radius:4px" />
                  <div style="display:flex;gap:24px">
                    <div class="sk-block" style="width:48px;height:14px;border-radius:3px" />
                    <div class="sk-block" style="width:48px;height:14px;border-radius:3px" />
                    <div class="sk-block" style="width:48px;height:14px;border-radius:3px" />
                    <div class="sk-block" style="width:48px;height:14px;border-radius:3px" />
                  </div>
                  <div class="sk-block" style="width:72px;height:30px;border-radius:20px" />
                </div>
                <!-- 模擬 hero 區塊 -->
                <div class="sk-basemap sk-basemap--hero">
                  <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
                    <div class="sk-block sk-block--light" style="width:40%;height:20px;border-radius:4px" />
                    <div class="sk-block sk-block--light" style="width:60%;height:36px;border-radius:4px" />
                    <div class="sk-block sk-block--light" style="width:30%;height:14px;border-radius:4px" />
                    <div class="sk-block sk-block--light" style="width:120px;height:36px;border-radius:20px;margin-top:8px" />
                  </div>
                </div>
                <!-- 模擬內容區塊 -->
                <div class="sk-basemap" style="height:140px">
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;width:100%">
                    <div v-for="i in 3" :key="i" style="display:flex;flex-direction:column;gap:8px">
                      <div class="sk-block" style="height:64px;border-radius:6px" />
                      <div class="sk-block" style="height:10px;border-radius:3px" />
                      <div class="sk-block" style="width:70%;height:8px;border-radius:3px" />
                    </div>
                  </div>
                </div>
                <!-- footer 區塊 -->
                <div class="sk-basemap" style="height:64px;background:#f8fafc">
                  <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
                    <div class="sk-block" style="width:80px;height:16px;border-radius:3px" />
                    <div style="display:flex;gap:16px">
                      <div class="sk-block" style="width:40px;height:12px;border-radius:3px" />
                      <div class="sk-block" style="width:40px;height:12px;border-radius:3px" />
                      <div class="sk-block" style="width:40px;height:12px;border-radius:3px" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 載入 spinner -->
        <div class="loading-badge">
          <div class="loading-spinner" />
          <span>載入中...</span>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageEditorStore } from '@/stores/pageEditor'
import EditorToolbar from '@/components/Editor/EditorToolbar.vue'
import LeftSidebar from '@/components/Editor/LeftSidebar.vue'
import CanvasArea from '@/components/Editor/CanvasArea.vue'
import PropsPanel from '@/components/Editor/PropsPanel.vue'
import PageSettingsModal from '@/components/Editor/PageSettingsModal.vue'

const route  = useRoute()
const router = useRouter()
const store  = usePageEditorStore()
const toast = reactive({ visible: false, message: '', type: 'success' })
const pageSettingsVisible = ref(false)
const isInitialLoad = ref(true)

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.visible = true
  setTimeout(() => { toast.visible = false }, 3000)
}

onMounted(async () => {
  const templeId = route.params.templeId
  const initSlug = route.query.page || 'home'

  if (templeId) {
    store.isLoading = true
    store.setTenantId(templeId)
    await Promise.all([
      store.fetchLocales(templeId),
      store.fetchAvailableSystemFrames(),
    ])
    await store.fetchPageTree(templeId)
    await store.loadPageContent(initSlug)
  } else {
    store.initWithDemo()
  }
  isInitialLoad.value = false
})

watch(() => store.currentPageSlug, (slug) => {
  if (slug && route.query.page !== slug) {
    router.replace({ query: { ...route.query, page: slug } })
  }
})

onUnmounted(() => {
  store.resetStore()
})

const handleSave = async () => {
  if (!store.tenantId) { showToast('示範模式無法儲存', 'info'); return }
  const ok = await store.saveCurrentPage()
  if (ok) { showToast('儲存成功') }
  else { showToast(store.error || '儲存失敗', 'error') }
}

const handlePublish = async () => {
  if (!store.tenantId) { showToast('示範模式無法發布', 'info'); return }
  if (!confirm('確定要發布嗎？發布後將更新線上網站。')) return
  const ok = await store.publishWebsite(store.tenantId, store.currentLocale)
  if (ok) { showToast('發布成功！') }
  else { showToast(store.error || '發布失敗', 'error') }
}

const handlePreview = () => {
  if (store.tenantId) {
    const slug   = store.currentPageSlug || 'home'
    const locale = store.currentLocale   || 'ZH-TW'
    window.open(`/editor/${store.tenantId}/preview?slug=${slug}&locale=${locale}`, '_blank')
  } else {
    showToast('示範模式無法預覽', 'info')
  }
}
</script>

<style scoped lang="scss">
.page-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

// ── 載入覆蓋層 ──────────────────────────────────────────────────────────────

.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  pointer-events: all;
}

// ── 骨架編輯器 ──────────────────────────────────────────────────────────────

.skeleton-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

// Toolbar
.sk-toolbar {
  height: 48px;
  flex-shrink: 0;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
}

.sk-toolbar-left,
.sk-toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.sk-toolbar-right { justify-content: flex-end; }

.sk-toolbar-center {
  flex-shrink: 0;
}

// Body
.sk-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

// Left sidebar
.sk-left {
  width: 228px;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.sk-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 4px;
  gap: 2px;
  height: 38px;
  align-items: flex-end;
}

.sk-tab {
  height: 28px;
  flex: 1;
  border-radius: 6px 6px 0 0;
  background: #f3f4f6;

  &--active { background: #e0f2fe; }
}

.sk-sidebar-body {
  flex: 1;
  padding: 16px 12px;
  overflow: hidden;
}

.sk-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 8px;
}

// Props panel
.sk-props {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  background: #fff;
  padding: 16px 14px;
  overflow: hidden;
}

// Canvas
.sk-canvas {
  flex: 1;
  background: #f3f4f6;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
}

.sk-canvas-inner {
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.sk-basemap {
  width: 100%;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #f3f4f6;

  &--header {
    height: 64px;
    justify-content: space-between;
    background: #fff;
  }

  &--hero {
    height: 200px;
    justify-content: center;
    background: #1e293b;
  }
}

// ── 骨架 shimmer 動畫 ────────────────────────────────────────────────────────

@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.sk-block {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s ease-in-out infinite;

  &--primary {
    background: linear-gradient(90deg, #bae6fd 25%, #7dd3fc 50%, #bae6fd 75%);
    background-size: 800px 100%;
  }

  &--light {
    background: linear-gradient(90deg, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 75%);
    background-size: 800px 100%;
  }
}

// ── 載入 badge ───────────────────────────────────────────────────────────────

.loading-badge {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.82);
  color: #fff;
  padding: 10px 20px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  white-space: nowrap;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

// ── Transition ───────────────────────────────────────────────────────────────

.loader-fade-enter-active { transition: opacity 0.2s ease; }
.loader-fade-leave-active { transition: opacity 0.35s ease; }
.loader-fade-enter-from,
.loader-fade-leave-to     { opacity: 0; }

// ── Toast ────────────────────────────────────────────────────────────────────

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  &.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  &.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  &.info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
}

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
