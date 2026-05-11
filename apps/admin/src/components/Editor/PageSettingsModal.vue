<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">頁面設定</h3>
            <button class="modal-close" @click="close">✕</button>
          </div>

          <div v-if="loading" class="modal-loading">載入中...</div>

          <div v-else class="modal-body">
            <div class="field-group">
              <label class="field-label">頁籤名稱</label>
              <input v-model="form.tab" type="text" class="field-input" placeholder="首頁" />
            </div>
            <div class="field-group">
              <label class="field-label">SEO 標題</label>
              <input v-model="form.seoTitle" type="text" class="field-input" placeholder="頁面SEO標題" />
            </div>
            <div class="field-group">
              <label class="field-label">SEO 描述</label>
              <textarea v-model="form.seoDescription" class="field-textarea" rows="3" placeholder="頁面SEO敘述" />
            </div>
            <div class="field-group">
              <label class="field-label">SEO 關鍵字</label>
              <input v-model="form.seoKeywords" type="text" class="field-input" placeholder="關鍵字1,關鍵字2" />
            </div>

            <div class="modal-info">
              <span class="info-item">Slug：<strong>{{ store.currentPageSlug }}</strong></span>
              <span v-if="pageInfo?.layer" class="info-item">層級：<strong>{{ pageInfo.layer }}</strong></span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-danger" @click="handleDelete">刪除此頁面</button>
            <div class="footer-right">
              <button class="btn-cancel" @click="close">取消</button>
              <button class="btn-save" :disabled="saving" @click="handleSave">
                {{ saving ? '儲存中...' : '儲存' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'deleted'])

const store   = usePageEditorStore()
const loading = ref(false)
const saving  = ref(false)
const pageInfo = ref(null)

const form = ref({ tab: '', seoTitle: '', seoDescription: '', seoKeywords: '' })

watch(() => props.visible, async (v) => {
  if (!v) return
  loading.value = true
  const data = await store.fetchPageInfo(store.currentPageSlug)
  pageInfo.value = data
  if (data) {
    form.value = {
      tab:            data.tab            || '',
      seoTitle:       data.seoTitle       || '',
      seoDescription: data.seoDescription || '',
      seoKeywords:    data.seoKeywords    || '',
    }
  }
  loading.value = false
})

const close = () => emit('close')

const handleSave = async () => {
  saving.value = true
  const ok = await store.updatePageInfo(store.currentPageSlug, form.value)
  saving.value = false
  if (ok) close()
  else alert(store.error || '儲存失敗')
}

const handleDelete = async () => {
  if (!confirm(`確定要刪除「${store.currentPageSlug}」頁面嗎？此操作無法復原。`)) return
  const ok = await store.deletePage(store.currentPageSlug)
  if (ok) { emit('deleted'); close() }
  else alert(store.error || '刪除失敗')
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  width: 480px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  &:hover { background: #f3f4f6; color: #374151; }
}

.modal-loading {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 60vh;
  overflow-y: auto;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.field-input, .field-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(232,87,42,0.1); }
}

.modal-info {
  display: flex;
  gap: 16px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 12px;
  color: #6b7280;
}

.info-item strong { color: #374151; }

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid #e5e7eb;
  gap: 8px;
}

.footer-right {
  display: flex;
  gap: 8px;
}

.btn-danger {
  padding: 8px 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff;
  color: #dc2626;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #fef2f2; }
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f3f4f6; }
}

.btn-save {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: #0891B2;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
