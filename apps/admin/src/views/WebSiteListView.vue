<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import axiosClient from '@/axios'

const router = useRouter()

const sites      = ref([])
const loading    = ref(false)
const error      = ref(null)
const searchQ    = ref('')
const page       = ref(1)
const pageSize   = ref(10)
const total      = ref(0)
const totalPages = ref(1)
const sortBy     = ref('createdAt')
const sortOrder  = ref('DESC')

const createVisible  = ref(false)
const createSubdomain = ref('')
const createError    = ref('')
const creating       = ref(false)

const editVisible  = ref(false)
const editSiteId   = ref(null)
const editLoading  = ref(false)
const editSaving   = ref(false)
const editError    = ref('')
const editForm     = ref({ domainName: '', frontFamilyZhTw: '', frontFamilyZhCn: '', frontFamilyEnUs: '' })

const openEdit = async (site) => {
  editSiteId.value = site.id
  editError.value  = ''
  editForm.value   = { domainName: '', frontFamilyZhTw: '', frontFamilyZhCn: '', frontFamilyEnUs: '' }
  editVisible.value = true
  editLoading.value = true
  try {
    const res = await axiosClient.get(`/backend/web-site/${site.id}`)
    if (res.data.statusCode === 200 && res.data.data) {
      const d = res.data.data
      editForm.value = {
        domainName:      d.domainName      || '',
        frontFamilyZhTw: d.frontFamilyZhTw || '',
        frontFamilyZhCn: d.frontFamilyZhCn || '',
        frontFamilyEnUs: d.frontFamilyEnUs  || '',
      }
    }
  } catch (err) {
    editError.value = err.message || '載入失敗'
  } finally {
    editLoading.value = false
  }
}

const editDeleting = ref(false)

const closeEdit = () => { editVisible.value = false }

const handleEditSave = async () => {
  editSaving.value = true
  editError.value  = ''
  try {
    const { domainName: _dn, ...editPayload } = editForm.value
    const res = await axiosClient.patch(`/backend/web-site/${editSiteId.value}`, editPayload)
    if (res.data.statusCode === 200) {
      closeEdit()
      await fetchSites()
    } else {
      editError.value = res.data.message || '儲存失敗'
    }
  } catch (err) {
    editError.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    editSaving.value = false
  }
}

const handleEditDelete = async () => {
  if (!confirm('確定要刪除此網站嗎？此操作無法復原。')) return
  editDeleting.value = true
  editError.value    = ''
  try {
    const res = await axiosClient.delete(`/backend/web-site/${editSiteId.value}`)
    if (res.data.statusCode === 200) {
      closeEdit()
      await fetchSites()
    } else {
      editError.value = res.data.message || '刪除失敗'
    }
  } catch (err) {
    editError.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    editDeleting.value = false
  }
}


const openCreate = () => {
  createSubdomain.value = ''
  createError.value = ''
  createVisible.value = true
}

const closeCreate = () => {
  createVisible.value = false
}

const handleCreate = async () => {
  const sub = createSubdomain.value.trim()
  if (!sub) { createError.value = '請輸入子網域'; return }
  creating.value = true
  createError.value = ''
  try {
    const res = await axiosClient.post('/backend/web-site/', { subdomain: sub })
    if (res.data.statusCode === 200 || res.data.statusCode === 201) {
      closeCreate()
      await fetchSites()
    } else {
      createError.value = res.data.message || '建立失敗'
    }
  } catch (err) {
    createError.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    creating.value = false
  }
}

const fetchSites = async () => {
  loading.value = true
  error.value   = null
  try {
    const res = await axiosClient.get('/backend/web-site/', {
      params: {
        q:         searchQ.value || undefined,
        sortBy:    sortBy.value,
        sortOrder: sortOrder.value,
        page:      page.value,
        pageSize:  pageSize.value,
      },
    })
    if (res.data.statusCode === 200 && res.data.data) {
      const d       = res.data.data
      console.log('[WebSiteList] 網站列表資料:', d)
      sites.value      = d.data || []
      total.value      = d.total ?? 0
      totalPages.value = d.totalPages ?? 1
      page.value       = d.page ?? 1
    } else {
      error.value = res.data.message || '載入失敗'
    }
  } catch (err) {
    error.value = err.message || '網路錯誤'
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  page.value = 1
  fetchSites()
}

const onSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortBy.value    = field
    sortOrder.value = 'DESC'
  }
  page.value = 1
  fetchSites()
}

const goPage = (p) => {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  fetchSites()
}

const goEditor = (site) => {
  router.push(`/editor/${site.id}/page-editor`)
}

const goPages = (site) => router.push(`/websites/${site.id}/pages`)

const zhTwFonts = [
  { value: 'ibm-plex-sans-tc',    label: 'IBM Plex Sans TC',    cssFamily: "'IBM Plex Sans TC', sans-serif" },
  { value: 'lxgw-wenkai-mono-tc', label: 'LXGW WenKai Mono TC', cssFamily: "'LXGW WenKai Mono TC', monospace" },
  { value: 'noto-sans-tc',        label: 'Noto Sans TC',         cssFamily: "'Noto Sans TC', sans-serif" },
  { value: 'noto-serif-tc',       label: 'Noto Serif TC',        cssFamily: "'Noto Serif TC', serif" },
]

const zhCnFonts = [
  { value: 'noto-sans-sc',     label: 'Noto Sans SC',     cssFamily: "'Noto Sans SC', sans-serif" },
  { value: 'noto-serif-sc',    label: 'Noto Serif SC',    cssFamily: "'Noto Serif SC', serif" },
  { value: 'ibm-plex-sans-sc', label: 'IBM Plex Sans SC', cssFamily: "'IBM Plex Sans SC', sans-serif" },
]

const enFonts = [
  { value: 'bona-nova',          label: 'Bona Nova',          cssFamily: "'Bona Nova', serif" },
  { value: 'inter',              label: 'Inter',              cssFamily: "'Inter', sans-serif" },
  { value: 'cormorant-garamond', label: 'Cormorant Garamond', cssFamily: "'Cormorant Garamond', serif" },
  { value: 'montserrat',         label: 'Montserrat',         cssFamily: "'Montserrat', sans-serif" },
  { value: 'playfair-display',   label: 'Playfair Display',   cssFamily: "'Playfair Display', serif" },
]

const fontLabel = (fonts, val) => fonts.find(f => f.value === val)?.label || val || '—'
const fontCss   = (fonts, val) => fonts.find(f => f.value === val)?.cssFamily || 'inherit'

const pageRange = computed(() => {
  const t = totalPages.value, c = page.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  if (c <= 4)     return [1, 2, 3, 4, 5, '…', t]
  if (c >= t - 3) return [1, '…', t - 4, t - 3, t - 2, t - 1, t]
  return [1, '…', c - 1, c, c + 1, '…', t]
})

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(fetchSites)
</script>

<template>
  <AdminLayout title="網站管理">
    <template #header-actions>
      <button class="btn-create" @click="openCreate">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        建立網站
      </button>
      <div class="search-bar">
        <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
          <path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 11-13.333 0 6.667 6.667 0 0113.333 0z"
            stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchQ"
          type="text"
          placeholder="搜尋子網域..."
          class="search-input"
          @keydown.enter="onSearch"
        />
        <button class="btn-search" @click="onSearch">搜尋</button>
      </div>
    </template>

    <!-- 錯誤提示 -->
    <div v-if="error" class="error-banner">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
      <button class="retry-btn" @click="fetchSites">重試</button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <div class="table-header-row">
        <span class="total-hint">共 {{ total }} 筆</span>
        <div class="sort-controls">
          <span class="sort-label">排序：</span>
          <button
            class="sort-btn"
            :class="{ active: sortBy === 'createdAt' }"
            @click="onSort('createdAt')"
          >
            建立時間
            <svg v-if="sortBy === 'createdAt'" viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
              <path v-if="sortOrder === 'ASC'" d="M8 3l4 6H4l4-6z"/>
              <path v-else d="M8 13L4 7h8l-4 6z"/>
            </svg>
          </button>
          <button
            class="sort-btn"
            :class="{ active: sortBy === 'updatedAt' }"
            @click="onSort('updatedAt')"
          >
            更新時間
            <svg v-if="sortBy === 'updatedAt'" viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
              <path v-if="sortOrder === 'ASC'" d="M8 3l4 6H4l4-6z"/>
              <path v-else d="M8 13L4 7h8l-4 6z"/>
            </svg>
          </button>
          <button
            class="sort-btn"
            :class="{ active: sortBy === 'subdomain' }"
            @click="onSort('subdomain')"
          >
            子網域 A–Z
            <svg v-if="sortBy === 'subdomain'" viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
              <path v-if="sortOrder === 'ASC'" d="M8 3l4 6H4l4-6z"/>
              <path v-else d="M8 13L4 7h8l-4 6z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner" />
        <span>載入中...</span>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="!sites.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
        </svg>
        <p>{{ searchQ ? '找不到符合的網站' : '尚無網站資料' }}</p>
      </div>

      <!-- 表格內容 -->
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>子網域</th>
            <th>網域</th>
            <th>字型（繁中）</th>
            <th>建立日期</th>
            <th>更新日期</th>
            <th style="width:200px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="site in sites" :key="site.id">
            <td>
              <div class="subdomain-cell">
                <span class="status-dot" />
                <span class="subdomain-text">{{ site.subdomain }}</span>
              </div>
            </td>
            <td>
              <a
                v-if="site.domainName"
                :href="site.domainName"
                target="_blank"
                rel="noopener noreferrer"
                class="domain-link"
              >{{ site.domainName }}</a>
              <span v-else class="dim">—</span>
            </td>
            <td>
              <span class="font-badge" :style="{ fontFamily: fontCss(zhTwFonts, site.frontFamilyZhTw) }">{{ fontLabel(zhTwFonts, site.frontFamilyZhTw) }}</span>
            </td>
            <td class="dim">{{ formatDate(site.createdAt) }}</td>
            <td class="dim">{{ formatDate(site.updatedAt) }}</td>
            <td>
              <div class="action-btns">
                <button class="btn-edit" @click="goEditor(site)">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                  編輯
                </button>
                <button class="btn-settings" @click="openEdit(site)" title="網站設定">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                  </svg>
                  設定
                </button>
                <button class="btn-settings" @click="goPages(site)" title="頁面管理">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                  </svg>
                  頁面
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分頁 -->
      <div v-if="!loading" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div class="page-numbers">
          <button
            v-for="p in pageRange" :key="p"
            class="page-num"
            :class="{ active: p === page, ellipsis: p === '…' }"
            :disabled="p === '…' || p === page"
            @click="p !== '…' && goPage(p)"
          >{{ p }}</button>
        </div>
        <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <span class="page-info">第 {{ page }} / {{ totalPages }} 頁，共 {{ total }} 筆</span>
      </div>
    </div>
    <!-- 建立網站 Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="createVisible" class="modal-overlay" @click.self="closeCreate">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">建立網站</h3>
              <button class="modal-close" @click="closeCreate">✕</button>
            </div>
            <div class="modal-body">
              <label class="field-label">子網域</label>
              <div class="subdomain-input-wrap">
                <input
                  v-model="createSubdomain"
                  type="text"
                  class="field-input"
                  placeholder="demo"
                  @keydown.enter="handleCreate"
                  autofocus
                />
                <span class="subdomain-suffix">.angke.com.tw</span>
              </div>
              <p v-if="createError" class="create-error">{{ createError }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="closeCreate">取消</button>
              <button class="btn-save" :disabled="creating" @click="handleCreate">
                {{ creating ? '建立中...' : '建立' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 網站設定 Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="editVisible" class="modal-overlay" @click.self="closeEdit">
          <div class="modal modal-wide">
            <div class="modal-header">
              <h3 class="modal-title">網站設定</h3>
              <button class="modal-close" @click="closeEdit">✕</button>
            </div>

            <div v-if="editLoading" class="modal-loading">載入中...</div>

            <div v-else class="modal-body">
              <div class="edit-field-group">
                <label class="field-label">網域名稱</label>
                <span class="domain-readonly">{{ editForm.domainName || '—' }}</span>
              </div>
              <div class="edit-field-group">
                <label class="field-label">字型 — 繁體中文</label>
                <select v-model="editForm.frontFamilyZhTw" class="field-select">
                  <option value="">（不設定）</option>
                  <option v-for="f in zhTwFonts" :key="f.value" :value="f.value" :style="{ fontFamily: f.cssFamily }">{{ f.label }}</option>
                </select>
              </div>
              <div class="edit-field-group">
                <label class="field-label">字型 — 簡體中文</label>
                <select v-model="editForm.frontFamilyZhCn" class="field-select">
                  <option value="">（不設定）</option>
                  <option v-for="f in zhCnFonts" :key="f.value" :value="f.value" :style="{ fontFamily: f.cssFamily }">{{ f.label }}</option>
                </select>
              </div>
              <div class="edit-field-group">
                <label class="field-label">字型 — 英文</label>
                <select v-model="editForm.frontFamilyEnUs" class="field-select">
                  <option value="">（不設定）</option>
                  <option v-for="f in enFonts" :key="f.value" :value="f.value" :style="{ fontFamily: f.cssFamily }">{{ f.label }}</option>
                </select>
              </div>
              <p v-if="editError" class="create-error">{{ editError }}</p>
            </div>

            <div class="modal-footer">
              <button class="btn-danger" :disabled="editDeleting" @click="handleEditDelete">
                {{ editDeleting ? '刪除中...' : '刪除網站' }}
              </button>
              <div class="footer-right">
                <button class="btn-cancel" @click="closeEdit">取消</button>
                <button class="btn-save" :disabled="editSaving || editLoading" @click="handleEditSave">
                  {{ editSaving ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </AdminLayout>
</template>

<style scoped lang="scss">
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  padding: 5px 10px;

  svg { flex-shrink: 0; }
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #374151;
  width: 180px;
  font-family: inherit;
  &::placeholder { color: #9ca3af; }
}

.btn-search {
  padding: 4px 12px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #0E7490; }
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

.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.table-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.total-hint {
  font-size: 13px;
  color: #6b7280;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-label {
  font-size: 12px;
  color: #9ca3af;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover { border-color: #9ca3af; color: #374151; }
  &.active { border-color: #0891B2; background: #f0f9ff; color: #0891B2; font-weight: 500; }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: #9ca3af;
  font-size: 13px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: #9ca3af;
  svg { opacity: 0.4; }
  p { font-size: 13px; margin: 0; }
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th {
    padding: 10px 20px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #f9fafb;
    border-bottom: 1px solid #f3f4f6;
  }

  td {
    padding: 14px 20px;
    font-size: 13px;
    color: #374151;
    border-bottom: 1px solid #f9fafb;
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: #fafafa; }
}

.subdomain-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}

.subdomain-text {
  font-weight: 500;
  color: #111827;
}

.domain-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 13px;
  &:hover { text-decoration: underline; }
}

.font-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  color: #4b5563;
}

.dim { color: #9ca3af; }

.action-btns {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-edit, .btn-settings {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  padding: 5px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: #0891B2;
    background: #f0f9ff;
    color: #0891B2;
  }
}

.modal-loading {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.modal-wide { width: 480px; }

.edit-field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.domain-readonly {
  font-size: 13px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
  padding: 9px 0;
  display: block;
}

.field-select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  font-family: inherit;
  background: #fff;
  cursor: pointer;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.1); }
}

.field-input-full {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  font-family: inherit;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(232,87,42,0.1); }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #f3f4f6;
}

.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  color: #374151;

  &:hover:not(:disabled) { border-color: #0891B2; color: #0891B2; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

.page-numbers { display: flex; align-items: center; gap: 4px; }

.page-num {
  min-width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  padding: 0 6px;
  transition: all 0.15s;
  &:hover:not(:disabled):not(.ellipsis) { border-color: #0891B2; color: #0891B2; }
  &.active { background: #0891B2; border-color: #0891B2; color: #fff; cursor: default; }
  &.ellipsis { border-color: transparent; background: transparent; cursor: default; color: #9ca3af; }
  &:disabled:not(.active):not(.ellipsis) { opacity: 0.5; cursor: not-allowed; }
}

.page-info {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 4px;
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
  &:hover { background: #0E7490; }
}

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
  width: 400px;
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
  gap: 8px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.subdomain-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  &:focus-within { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(232,87,42,0.1); }
}

.field-input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  outline: none;
  font-size: 13px;
  color: #111827;
  font-family: inherit;
  background: transparent;
}

.subdomain-suffix {
  padding: 8px 12px;
  font-size: 13px;
  color: #9ca3af;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  white-space: nowrap;
}

.create-error {
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
  transition: background 0.15s;
  &:hover:not(:disabled) { background: #fef2f2; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
