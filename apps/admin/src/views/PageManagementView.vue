<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import PageTreeNode from '@/components/PageTreeNode.vue'
import axiosClient from '@/axios'

const route  = useRoute()
const router = useRouter()

const siteId    = route.params.siteId
const loading   = ref(false)
const pageTree  = ref([])
const error     = ref(null)

// ── 把樹狀扁平化，供 parentId 下拉選單使用 ──
const flattenTree = (nodes, depth = 0) => {
  const result = []
  for (const node of nodes) {
    result.push({ pageId: node.pageId, label: '  '.repeat(depth) + (node.tab || node.slug), slug: node.slug })
    if (node.children?.length) result.push(...flattenTree(node.children, depth + 1))
  }
  return result
}
const flatPageList = computed(() => flattenTree(pageTree.value))

// ── 新增頁面 ──
const createVisible = ref(false)
const createForm    = ref({
  tab: '', slug: '', locale: 'ZH-TW',
  parentId: '', seoTitle: '', seoDescription: '', seoKeywords: '',
})
const createError   = ref('')
const creating      = ref(false)

// ── 刪除 ──
const deletingSlug = ref(null)

// ── 移動：共用的 API 呼叫 ──
const performMove = async (slug, parentId) => {
  try {
    const res = await axiosClient.patch(
      `/backend/web-site/${siteId}/page/${slug}/move`,
      { parentId: parentId || null }
    )
    if (res.data.statusCode === 200) { await fetchPages(); return true }
    alert(res.data.message || '移動失敗')
  } catch (err) {
    alert(err.response?.data?.message || err.message || '網路錯誤')
  }
  return false
}

// ── 拖曳狀態 (provide 給 PageTreeNode) ──
const draggedNode   = ref(null)
const isRootOver    = ref(false)

provide('treeDrag', {
  draggedNode,
  onDropToNode: (targetNode, draggedSlug) => {
    const slug = draggedSlug ?? draggedNode.value?.slug
    if (!slug || slug === targetNode.slug) return
    performMove(slug, targetNode.pageId || null)
    draggedNode.value = null
  },
})

const handleRootDrop = (e) => {
  isRootOver.value = false
  const slug = draggedNode.value?.slug ?? e.dataTransfer.getData('text/plain')
  if (!slug) return
  performMove(slug, null)
  draggedNode.value = null
}

// ── 編輯頁面資訊 Modal ──
const infoVisible  = ref(false)
const infoNode     = ref(null)
const infoLoading  = ref(false)
const infoSaving   = ref(false)
const infoError    = ref('')
const infoForm     = ref({ locale: 'ZH-TW', tab: '', seoTitle: '', seoDescription: '', seoKeywords: '' })

const openInfo = async (node) => {
  infoNode.value    = node
  infoError.value   = ''
  infoForm.value    = { locale: 'ZH-TW', tab: node.tab || '', seoTitle: node.seoTitle || '', seoDescription: '', seoKeywords: '' }
  infoVisible.value = true
  infoLoading.value = true
  try {
    const res = await axiosClient.get(`/backend/web-site/${siteId}/page/${node.slug}`, {
      params: { locale: 'ZH-TW' }
    })
    if (res.data.statusCode === 200 && res.data.data) {
      const d = res.data.data
      infoForm.value = {
        locale:         d.locale         || 'ZH-TW',
        tab:            d.tab            || node.tab || '',
        seoTitle:       d.seoTitle       || '',
        seoDescription: d.seoDescription || '',
        seoKeywords:    d.seoKeywords    || '',
      }
    }
  } catch { /* 用 tree 資料作為初始值即可 */ } finally {
    infoLoading.value = false
  }
}

const closeInfo = () => { infoVisible.value = false; infoNode.value = null }

const handleInfoSave = async () => {
  if (!infoNode.value) return
  infoSaving.value = true
  infoError.value  = ''
  try {
    const res = await axiosClient.patch(
      `/backend/web-site/${siteId}/page/${infoNode.value.slug}`,
      {
        locale:         infoForm.value.locale || 'ZH-TW',
        tab:            infoForm.value.tab,
        seoTitle:       infoForm.value.seoTitle       || undefined,
        seoDescription: infoForm.value.seoDescription || undefined,
        seoKeywords:    infoForm.value.seoKeywords    || undefined,
      }
    )
    if (res.data.statusCode === 200) {
      closeInfo()
      await fetchPages()
    } else {
      infoError.value = res.data.message || '儲存失敗'
    }
  } catch (err) {
    infoError.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    infoSaving.value = false
  }
}

// ── 移動 Modal (保留精確選擇) ──
const moveVisible  = ref(false)
const moveNode     = ref(null)
const moveParentId = ref('')
const moveError    = ref('')
const moving       = ref(false)

const fetchPages = async () => {
  loading.value = true
  error.value   = null
  try {
    const res = await axiosClient.get(`/backend/web-site/${siteId}/all-page`, {
      params: { locale: 'ZH-TW' },
    })
    if (res.data.statusCode === 200 && Array.isArray(res.data.data)) {
      pageTree.value = res.data.data
    } else {
      error.value = res.data.message || '載入失敗'
    }
  } catch (err) {
    error.value = err.message || '網路錯誤'
  } finally {
    loading.value = false
  }
}

const goBack = () => router.push('/websites')

const handleEdit = (node) => {
  router.push(`/editor/${siteId}/page-editor?page=${node.slug}`)
}

const handleDelete = async (node) => {
  if (!confirm(`確定要刪除頁面「${node.tab || node.slug}」嗎？\n此操作無法復原。`)) return
  deletingSlug.value = node.slug
  try {
    const res = await axiosClient.delete(`/backend/web-site/${siteId}/page/${node.slug}`)
    if (res.data.statusCode === 200) {
      await fetchPages()
    } else {
      alert(res.data.message || '刪除失敗')
    }
  } catch (err) {
    alert(err.response?.data?.message || err.message || '網路錯誤')
  } finally {
    deletingSlug.value = null
  }
}

const handleCopy = async (node) => {
  if (!confirm(`確定要複製頁面「${node.tab || node.slug}」嗎？`)) return
  try {
    const res = await axiosClient.post(`/backend/web-site/${siteId}/page/${node.slug}/copy`, { locale: 'ZH-TW' })
    if (res.data.statusCode === 200 || res.data.statusCode === 201) {
      await fetchPages()
    } else {
      alert(res.data.message || '複製失敗')
    }
  } catch (err) {
    alert(err.response?.data?.message || err.message || '網路錯誤')
  }
}

const handleMove = (node) => {
  moveNode.value     = node
  moveParentId.value = node.parentId || ''
  moveError.value    = ''
  moveVisible.value  = true
}

const closeMove = () => { moveVisible.value = false; moveNode.value = null }

const submitMove = async () => {
  if (!moveNode.value) return
  moving.value    = true
  moveError.value = ''
  try {
    const ok = await performMove(moveNode.value.slug, moveParentId.value || null)
    if (ok) closeMove()
    else moveError.value = '移動失敗，請重試'
  } catch (err) {
    moveError.value = err.message || '網路錯誤'
  } finally {
    moving.value = false
  }
}

// ── 新增頁面 ──
const openCreate = () => {
  createForm.value  = {
    tab: '', slug: '', locale: 'ZH-TW',
    parentId: '', seoTitle: '', seoDescription: '', seoKeywords: '',
  }
  createError.value = ''
  createVisible.value = true
}

const closeCreate = () => { createVisible.value = false }

const handleCreate = async () => {
  const { tab, slug } = createForm.value
  if (!slug.trim()) { createError.value = '請輸入頁面路徑 (slug)'; return }
  if (!tab.trim())  { createError.value = '請輸入頁面名稱'; return }
  creating.value    = true
  createError.value = ''
  try {
    const f = createForm.value
    const body = {
      slug:           slug.trim(),
      tab:            tab.trim(),
      locale:         f.locale || 'ZH-TW',
      seoTitle:       f.seoTitle.trim()       || tab.trim(),
      seoDescription: f.seoDescription.trim() || undefined,
      seoKeywords:    f.seoKeywords.trim()    || undefined,
      parentId:       f.parentId              || undefined,
    }
    const res = await axiosClient.post(`/backend/web-site/${siteId}/page`, body)
    if (res.data.statusCode === 200 || res.data.statusCode === 201) {
      closeCreate()
      await fetchPages()
    } else {
      createError.value = res.data.message || '新增失敗'
    }
  } catch (err) {
    createError.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    creating.value = false
  }
}

onMounted(fetchPages)
</script>

<template>
  <AdminLayout>
    <template #title>
      <div class="breadcrumb-title">
        <button class="back-link" @click="goBack">網站管理</button>
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" class="breadcrumb-sep">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
        <span class="breadcrumb-current">頁面管理</span>
      </div>
    </template>

    <template #header-actions>
      <button class="btn-create" @click="openCreate">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        新增頁面
      </button>
    </template>

    <!-- Error -->
    <div v-if="error" class="error-banner">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
      <button class="retry-btn" @click="fetchPages">重試</button>
    </div>

    <!-- Tree Card -->
    <div class="tree-card">
      <!-- Header row -->
      <div class="tree-header-row">
        <div class="col-name">頁面名稱</div>
        <div class="col-slug">路徑</div>
        <div class="col-layer">層級</div>
        <div class="col-actions">操作</div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="state-center">
        <div class="spinner" />
        <span>載入中...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="!pageTree.length && !error" class="state-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p>尚無頁面，請點擊「新增頁面」建立第一個頁面</p>
      </div>

      <!-- Tree area -->
      <div v-else class="tree-area">
        <!-- Root drop zone：拖曳進行中才顯示 -->
        <Transition name="drop-zone-fade">
          <div
            v-if="draggedNode"
            class="root-drop-zone"
            :class="{ 'is-over': isRootOver }"
            @dragover.prevent="isRootOver = true"
            @dragleave="isRootOver = false"
            @drop.prevent="handleRootDrop($event)"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            拖曳至此 → 移至頂層頁面
          </div>
        </Transition>

        <div class="tree-body">
          <PageTreeNode
            v-for="node in pageTree"
            :key="node.pageId"
            :node="node"
            :depth="0"
            @edit="handleEdit"
            @info="openInfo"
            @delete="handleDelete"
            @copy="handleCopy"
            @move="handleMove"
          />
        </div>
      </div>
    </div>

    <!-- ── 新增頁面 Modal ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="createVisible" class="modal-overlay" @click.self="closeCreate">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">新增頁面</h3>
              <button class="modal-close" @click="closeCreate">✕</button>
            </div>
            <div class="modal-body modal-body-scroll">
              <!-- 頁面名稱 -->
              <div class="field-group">
                <label class="field-label">頁面名稱 <span class="required">*</span></label>
                <input v-model="createForm.tab" type="text" class="field-input" placeholder="例：關於我們" autofocus />
              </div>

              <!-- 路徑 -->
              <div class="field-group">
                <label class="field-label">路徑 (Slug) <span class="required">*</span></label>
                <div class="slug-input-wrap">
                  <span class="slug-prefix">/</span>
                  <input v-model="createForm.slug" type="text" class="field-input no-left" placeholder="about" />
                </div>
                <p class="field-hint">只能使用小寫英文、數字與連字號</p>
              </div>

              <!-- 語言 -->
              <div class="field-group">
                <label class="field-label">語言</label>
                <select v-model="createForm.locale" class="field-select">
                  <option value="ZH-TW">繁體中文 (ZH-TW)</option>
                  <option value="ZH-CN">簡體中文 (ZH-CN)</option>
                  <option value="EN-US">英文 (EN-US)</option>
                </select>
              </div>

              <!-- 上層頁面 -->
              <div class="field-group">
                <label class="field-label">上層頁面</label>
                <select v-model="createForm.parentId" class="field-select">
                  <option value="">（無，設為頂層頁面）</option>
                  <option v-for="p in flatPageList" :key="p.pageId" :value="p.pageId">
                    {{ p.label }}
                  </option>
                </select>
                <p class="field-hint">層級由系統依 parentId 自動判斷</p>
              </div>

              <!-- SEO 標題 -->
              <div class="field-group">
                <label class="field-label">SEO 標題</label>
                <input v-model="createForm.seoTitle" type="text" class="field-input" placeholder="留空則與頁面名稱相同" />
              </div>

              <!-- SEO 描述 -->
              <div class="field-group">
                <label class="field-label">SEO 描述</label>
                <textarea v-model="createForm.seoDescription" class="field-textarea" placeholder="頁面描述（選填）" rows="2" />
              </div>

              <!-- SEO 關鍵字 -->
              <div class="field-group">
                <label class="field-label">SEO 關鍵字</label>
                <input v-model="createForm.seoKeywords" type="text" class="field-input" placeholder="關鍵字1,關鍵字2（逗號分隔，選填）" />
              </div>

              <p v-if="createError" class="form-error">{{ createError }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="closeCreate">取消</button>
              <button class="btn-save" :disabled="creating" @click="handleCreate">
                {{ creating ? '新增中...' : '新增' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── 編輯頁面資訊 Modal ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="infoVisible" class="modal-overlay" @click.self="closeInfo">
          <div class="modal">
            <div class="modal-header">
              <div>
                <h3 class="modal-title">頁面資訊</h3>
                <p class="modal-subtitle">{{ infoNode?.slug }}</p>
              </div>
              <button class="modal-close" @click="closeInfo">✕</button>
            </div>

            <div v-if="infoLoading" class="modal-loading">
              <div class="spinner" style="margin: 0 auto" />
              <span>載入中...</span>
            </div>

            <div v-else class="modal-body modal-body-scroll">
              <!-- 語言 -->
              <div class="field-group">
                <label class="field-label">語言</label>
                <select v-model="infoForm.locale" class="field-select">
                  <option value="ZH-TW">繁體中文 (ZH-TW)</option>
                  <option value="ZH-CN">簡體中文 (ZH-CN)</option>
                  <option value="EN-US">英文 (EN-US)</option>
                </select>
              </div>

              <!-- 頁面名稱 -->
              <div class="field-group">
                <label class="field-label">頁面名稱 (tab) <span class="required">*</span></label>
                <input v-model="infoForm.tab" type="text" class="field-input" placeholder="例：關於我們" />
                <p class="field-hint">顯示於導覽列的名稱</p>
              </div>

              <!-- SEO 標題 -->
              <div class="field-group">
                <label class="field-label">SEO 標題</label>
                <input v-model="infoForm.seoTitle" type="text" class="field-input" placeholder="頁面 SEO 標題" />
              </div>

              <!-- SEO 描述 -->
              <div class="field-group">
                <label class="field-label">SEO 描述</label>
                <textarea v-model="infoForm.seoDescription" class="field-textarea" placeholder="頁面 SEO 敘述" rows="3" />
              </div>

              <!-- SEO 關鍵字 -->
              <div class="field-group">
                <label class="field-label">SEO 關鍵字</label>
                <input v-model="infoForm.seoKeywords" type="text" class="field-input" placeholder="關鍵字1,關鍵字2" />
                <p class="field-hint">多個關鍵字請用逗號分隔</p>
              </div>

              <p v-if="infoError" class="form-error">{{ infoError }}</p>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="closeInfo">取消</button>
              <button class="btn-save" :disabled="infoSaving || infoLoading" @click="handleInfoSave">
                {{ infoSaving ? '儲存中...' : '儲存' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── 移動頁面 Modal ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="moveVisible" class="modal-overlay" @click.self="closeMove">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">移動頁面：{{ moveNode?.tab || moveNode?.slug }}</h3>
              <button class="modal-close" @click="closeMove">✕</button>
            </div>
            <div class="modal-body">
              <div class="field-group">
                <label class="field-label">移至上層頁面</label>
                <select v-model="moveParentId" class="field-select">
                  <option value="">（無，設為頂層頁面）</option>
                  <option
                    v-for="p in flatPageList"
                    :key="p.pageId"
                    :value="p.pageId"
                    :disabled="p.slug === moveNode?.slug"
                  >
                    {{ p.label }}
                  </option>
                </select>
                <p class="field-hint">不可選擇自己作為上層頁面</p>
              </div>
              <p v-if="moveError" class="form-error">{{ moveError }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="closeMove">取消</button>
              <button class="btn-save" :disabled="moving" @click="submitMove">
                {{ moving ? '移動中...' : '確認移動' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<style scoped lang="scss">
.breadcrumb-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #9ca3af;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s;
  &:hover { color: #374151; }
}

.breadcrumb-sep { color: #d1d5db; flex-shrink: 0; }

.breadcrumb-current {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover { background: #d04a20; }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 20px;
}

.retry-btn {
  margin-left: auto;
  padding: 4px 12px;
  border: 1px solid #fca5a5;
  border-radius: 5px;
  background: #fff;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #fef2f2; }
}

.tree-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.tree-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .col-name    { flex: 1; }
  .col-slug    { width: 130px; }
  .col-layer   { width: 50px; }
  .col-actions { width: 220px; text-align: right; }
}

.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: #9ca3af;
  font-size: 13px;
  svg { opacity: 0.4; }
  p { margin: 0; text-align: center; }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f4f6;
  border-top-color: #0891B2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.tree-area { display: flex; flex-direction: column; }
.tree-body { display: flex; flex-direction: column; }

.root-drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 8px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  font-size: 12px;
  color: #9ca3af;
  cursor: copy;
  transition: all 0.15s;

  &.is-over {
    border-color: #0891B2;
    background: #f0f9ff;
    color: #0891B2;
  }
}

.drop-zone-fade-enter-active, .drop-zone-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.drop-zone-fade-enter-from, .drop-zone-fade-leave-to { opacity: 0; transform: translateY(-6px); }

// ── Modal shared ──
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
  width: 420px;
  max-width: 95vw;
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

.modal-subtitle {
  font-size: 11px;
  color: #9ca3af;
  margin: 2px 0 0;
  font-family: 'Courier New', monospace;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px;
  color: #9ca3af;
  font-size: 13px;
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

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  .required { color: #0891B2; }
}

.field-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  font-family: inherit;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(232,87,42,0.1); }
  &.no-left { border-left: none; border-radius: 0 8px 8px 0; }
}

.slug-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  &:focus-within { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(232,87,42,0.1); }
}

.slug-prefix {
  padding: 8px 10px;
  background: #f9fafb;
  font-size: 13px;
  color: #6b7280;
  border-right: 1px solid #e5e7eb;
}

.modal-body-scroll {
  max-height: 65vh;
  overflow-y: auto;
}

.field-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  font-family: inherit;
  background: #fff;
  cursor: pointer;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(232,87,42,0.1); }
}

.field-textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  font-family: inherit;
  resize: vertical;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(232,87,42,0.1); }
}

.field-hint {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
}

.form-error {
  margin: 0;
  font-size: 12px;
  color: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #e5e7eb;
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
