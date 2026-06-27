<template>
  <div class="basemap-wrap">
    <div class="basemap-content" :style="bgStyle">
      <slot />
    </div>

    <!-- 浮動控制列 -->
    <div class="basemap-ctrl" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <div class="ctrl-bar">
        <template v-if="!disableMove">
          <button class="ctrl-btn" :disabled="!canMoveUp" @click="$emit('move-basemap', { fromIndex: index, direction: 'up' })" title="上移區塊">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
          <button class="ctrl-btn" :disabled="!canMoveDown" @click="$emit('move-basemap', { fromIndex: index, direction: 'down' })" title="下移區塊">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </button>
        </template>
        <button class="ctrl-btn ctrl-btn--add" @click="$emit('add-basemap', index)" title="在此插入新區塊">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>新增區塊</span>
        </button>
        <div class="ctrl-sep" />
        <button class="ctrl-btn ctrl-btn--bg" @click="showModal = true" title="編輯背景圖片">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
        <button v-if="isDeletable" class="ctrl-btn ctrl-btn--del" @click="handleDelete" title="刪除此區塊">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
    </div>

    <!-- 背景圖片彈窗 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="tryCloseModal">
        <div class="modal-dialog">

          <div class="modal-header">
            <div class="modal-header-left">
              <div class="modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div>
                <h3>背景圖片設定</h3>
                <p>為各裝置設定不同背景，桌面版為必填。</p>
              </div>
            </div>
            <button class="modal-close-btn" @click="tryCloseModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 桌面版 -->
            <div class="device-row" :class="{ 'device-row--error': desktopRequired }">
              <div class="device-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
                <div>
                  <span class="device-name">桌面版</span>
                  <div class="device-badges">
                    <span class="badge badge--required">必填</span>
                    <span v-if="desktopRequired" class="badge badge--error">請先上傳桌面版</span>
                  </div>
                </div>
              </div>
              <div class="device-preview">
                <img v-if="backgrounds.desktop" :src="backgrounds.desktop" class="preview-img" />
                <div v-else class="preview-empty" :class="{ 'preview-empty--error': desktopRequired }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>尚未設定</span>
                </div>
              </div>
              <div class="device-actions">
                <div v-if="uploadingState.desktop" class="uploading-indicator">
                  <div class="upload-spinner" /> 上傳中...
                </div>
                <template v-else>
                  <button class="btn-upload" @click="uploadImage('desktop')">{{ backgrounds.desktop ? '更換圖片' : '上傳圖片' }}</button>
                  <button v-if="backgrounds.desktop" class="btn-clear" @click="clearBackground('desktop')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </template>
              </div>
            </div>

            <!-- 平板版 -->
            <div class="device-row">
              <div class="device-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                <div>
                  <span class="device-name">平板版</span>
                  <div class="device-badges">
                    <span class="badge badge--opt">選填</span>
                  </div>
                </div>
              </div>
              <div class="device-preview">
                <img v-if="backgrounds.tablet" :src="backgrounds.tablet" class="preview-img" />
                <div v-else class="preview-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>同桌面版</span>
                </div>
              </div>
              <div class="device-actions">
                <div v-if="uploadingState.tablet" class="uploading-indicator">
                  <div class="upload-spinner" /> 上傳中...
                </div>
                <template v-else>
                  <button class="btn-upload" :disabled="!backgrounds.desktop" :title="!backgrounds.desktop ? '請先上傳桌面版' : ''" @click="uploadImage('tablet')">{{ backgrounds.tablet ? '更換圖片' : '上傳圖片' }}</button>
                  <button v-if="backgrounds.tablet" class="btn-clear" @click="clearBackground('tablet')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </template>
              </div>
            </div>

            <!-- 手機版 -->
            <div class="device-row">
              <div class="device-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                <div>
                  <span class="device-name">手機版</span>
                  <div class="device-badges">
                    <span class="badge badge--opt">選填</span>
                  </div>
                </div>
              </div>
              <div class="device-preview">
                <img v-if="backgrounds.mobile" :src="backgrounds.mobile" class="preview-img" />
                <div v-else class="preview-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>{{ backgrounds.tablet ? '同平板版' : '同桌面版' }}</span>
                </div>
              </div>
              <div class="device-actions">
                <div v-if="uploadingState.mobile" class="uploading-indicator">
                  <div class="upload-spinner" /> 上傳中...
                </div>
                <template v-else>
                  <button class="btn-upload" :disabled="!backgrounds.desktop" :title="!backgrounds.desktop ? '請先上傳桌面版' : ''" @click="uploadImage('mobile')">{{ backgrounds.mobile ? '更換圖片' : '上傳圖片' }}</button>
                  <button v-if="backgrounds.mobile" class="btn-clear" @click="clearBackground('mobile')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </template>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <p class="hint-text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              建議尺寸 1920×1080，JPG / PNG 格式
            </p>
            <button class="btn-done" @click="tryCloseModal">完成</button>
          </div>

        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'

const props = defineProps({
  index:         { type: Number,  required: true },
  basemap:       { type: Object,  default: null },
  totalBasemaps: { type: Number,  required: true },
  isDeletable:   { type: Boolean, default: true },
  disableMove:   { type: Boolean, default: false },
})

const emit = defineEmits(['add-basemap', 'delete-basemap', 'move-basemap'])

const store      = usePageEditorStore()
const isHovered  = ref(false)
const showModal  = ref(false)

const backgrounds    = ref({ desktop: null, tablet: null, mobile: null })
const uploadingState = ref({ desktop: false, tablet: false, mobile: false })

const canMoveUp   = computed(() => props.index > 0)
const canMoveDown = computed(() => props.index < props.totalBasemaps - 1)
const desktopRequired = computed(() =>
  !backgrounds.value.desktop && (!!backgrounds.value.tablet || !!backgrounds.value.mobile)
)

// 裝置 fallback 串接：手機→平板→桌機；平板→桌機；桌機用自己
const resolveBg = (device) => {
  const b = backgrounds.value
  if (device === 'mobile') return b.mobile || b.tablet || b.desktop
  if (device === 'tablet') return b.tablet || b.desktop
  return b.desktop
}

const bgStyle = computed(() => {
  const src = resolveBg(store.currentDevice)
  if (!src) return {}
  return { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
})

watch(() => props.basemap, (bm) => {
  if (bm) {
    backgrounds.value = {
      desktop: bm.bgPcImgSrc    || null,
      tablet:  bm.bgTabletImgSrc || null,
      mobile:  bm.bgPhoneImgSrc  || null,
    }
  }
}, { immediate: true, deep: true })

const handleDelete = () => {
  if (!props.isDeletable) return
  if (confirm('確定要刪除此區塊嗎？')) emit('delete-basemap', props.index)
}

const tryCloseModal = () => {
  if (desktopRequired.value) { alert('請先上傳桌面版背景圖片'); return }
  showModal.value = false
}

const applyUpload = (type, file) => {
  if (!props.basemap) return
  const m = { desktop: ['bgPcImgSrc','bgPcImgId'], tablet: ['bgTabletImgSrc','bgTabletImgId'], mobile: ['bgPhoneImgSrc','bgPhoneImgId'] }
  const [srcKey, idKey] = m[type]
  const url = file.fileDir || file.fileUrl
  props.basemap[srcKey]     = url
  props.basemap[idKey]      = file.id
  backgrounds.value[type]   = url
}

const uploadImage = (type) => {
  // 桌機一定要先上傳，平板/手機才能上傳
  if (type !== 'desktop' && !backgrounds.value.desktop) {
    alert('請先上傳桌面版背景圖片')
    return
  }
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    uploadingState.value[type] = true
    try {
      const result = await store.uploadImage(file)
      if (!result) { alert('上傳失敗，請重試'); return }
      applyUpload(type, result)
    } catch (err) {
      alert('上傳失敗：' + err.message)
    } finally {
      uploadingState.value[type] = false
    }
  }
  input.click()
}

const clearBackground = (type) => {
  if (!props.basemap) return
  const m = { desktop: ['bgPcImgSrc','bgPcImgId'], tablet: ['bgTabletImgSrc','bgTabletImgId'], mobile: ['bgPhoneImgSrc','bgPhoneImgId'] }
  const [srcKey, idKey] = m[type]
  props.basemap[srcKey]   = null
  props.basemap[idKey]    = null
  backgrounds.value[type] = null
}
</script>

<style scoped lang="scss">
.basemap-wrap {
  position: relative;
}

.basemap-content {
  position: relative;
}

// ── Floating control strip ──

.basemap-ctrl {
  position: absolute;
  bottom: -15px;
  left: 0;
  right: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: -10px 0;
    pointer-events: auto;
  }

  &:hover .ctrl-bar {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
}

.ctrl-bar {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background: #0f172a;
  border-radius: 99px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.07);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  pointer-events: none;
}

.ctrl-sep {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 5px;
  flex-shrink: 0;
}

.ctrl-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
  svg { width: 13px; height: 13px; flex-shrink: 0; }

  &:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
  &:disabled { opacity: 0.2; cursor: not-allowed; &:hover { background: transparent; color: rgba(255,255,255,0.2); } }
}

.ctrl-btn--add {
  width: auto;
  padding: 0 12px 0 9px;
  border-radius: 99px;
  background: #0891B2;
  color: #fff;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  svg { width: 11px; height: 11px; }
  &:hover { background: #0e7490; color: #fff; }
}

.ctrl-btn--del:hover { background: rgba(239, 68, 68, 0.18); color: #f87171; }
.ctrl-btn--bg:hover  { background: rgba(139, 92, 246, 0.18); color: #a78bfa; }

// ── Modal overlay ──

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-dialog {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

// ── Modal header ──

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg { width: 20px; height: 20px; color: #0891B2; }
}

.modal-header-left h3 {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 3px;
}

.modal-header-left p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background 0.15s, color 0.15s;
  svg { width: 15px; height: 15px; }
  &:hover { background: #e5e7eb; color: #111827; }
}

// ── Modal body ──

.modal-body {
  flex: 1;
  overflow-y: auto;
}

// ── Device row ──

.device-row {
  display: grid;
  grid-template-columns: 150px 1fr 140px;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f9fafb;
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
  &:hover { background: #fafafa; }
  &--error { background: #fff8f8; &:hover { background: #fff8f8; } }
}

.device-label {
  display: flex;
  align-items: center;
  gap: 10px;
  svg { width: 18px; height: 18px; color: #9ca3af; flex-shrink: 0; }
}

.device-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.device-badges {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.6;

  &--required { background: #f0f9ff; color: #0891B2; border: 1px solid #bae6fd; }
  &--opt { background: #f3f4f6; color: #9ca3af; border: 1px solid #e5e7eb; }
  &--error { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
}

.device-preview {
  height: 68px;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  svg { width: 18px; height: 18px; color: #d1d5db; }
  span { font-size: 11px; color: #9ca3af; }

  &--error {
    svg { color: #fca5a5; }
    span { color: #ef4444; font-weight: 500; }
  }
}

.device-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.uploading-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #0891B2;
  white-space: nowrap;
}

.upload-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #bae6fd;
  border-top-color: #0891B2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.btn-upload {
  padding: 7px 14px;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
  &:hover { background: #1e293b; }
  &:disabled { background: #cbd5e1; color: #fff; cursor: not-allowed; }
}

.btn-clear {
  width: 32px;
  height: 32px;
  border: 1.5px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  svg { width: 13px; height: 13px; }
  &:hover { background: #fef2f2; border-color: #fca5a5; color: #ef4444; }
}

// ── Modal footer ──

.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: #fafafa;
}

.hint-text {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  svg { width: 13px; height: 13px; flex-shrink: 0; }
}

.btn-done {
  padding: 8px 22px;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover { background: #1e293b; }
}
</style>
