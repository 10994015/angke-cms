<template>
  <AdminLayout title="系統日誌">
    <div class="log-wrap">

      <!-- 篩選列 -->
      <div class="filter-card">
        <div class="filter-grid">
          <div class="filter-item">
            <label class="filter-label">操作帳號</label>
            <input v-model="filters.credential" class="filter-input" placeholder="輸入帳號" @keyup.enter="fetchLogs(1)" />
          </div>
          <div class="filter-item">
            <label class="filter-label">IP 位址</label>
            <input v-model="filters.ip" class="filter-input" placeholder="例：222.124.12.1" @keyup.enter="fetchLogs(1)" />
          </div>
          <div class="filter-item">
            <label class="filter-label">狀態碼</label>
            <input v-model="filters.responseStatusCode" class="filter-input" placeholder="例：400" @keyup.enter="fetchLogs(1)" />
          </div>
          <div class="filter-item">
            <label class="filter-label">等級</label>
            <select v-model="filters.level" class="filter-select">
              <option value="">全部等級</option>
              <option value="1">1 - 一般</option>
              <option value="2">2 - 警告</option>
              <option value="3">3 - 錯誤</option>
            </select>
          </div>
          <!-- 類別（來自 action API） -->
          <div class="filter-item">
            <label class="filter-label">類別</label>
            <select v-model="filters.category" class="filter-select" @change="filters.logMsgCode = ''">
              <option value="">全部類別</option>
              <option v-for="g in actionGroups" :key="g.category" :value="g.category">{{ g.category }}</option>
            </select>
          </div>
          <!-- 操作類型（聯動類別） -->
          <div class="filter-item">
            <label class="filter-label">操作類型</label>
            <select v-model="filters.logMsgCode" class="filter-select" :disabled="!filters.category">
              <option value="">{{ filters.category ? '全部操作' : '請先選擇類別' }}</option>
              <template v-if="filters.category">
                <option
                  v-for="action in currentActions"
                  :key="action.logMsgCode"
                  :value="String(action.logMsgCode)"
                >{{ action.logMsgCodeLabel }}</option>
              </template>
            </select>
          </div>
          <div class="filter-item">
            <label class="filter-label">開始時間</label>
            <input v-model="filters.startAt" type="datetime-local" class="filter-input" />
          </div>
          <div class="filter-item">
            <label class="filter-label">結束時間</label>
            <input v-model="filters.endAt" type="datetime-local" class="filter-input" />
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn-reset" @click="resetFilters">清除篩選</button>
          <button class="btn-search" :disabled="loading" @click="fetchLogs(1)">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
            查詢
          </button>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-card">
        <div class="table-header">
          <span class="table-total">共 {{ total }} 筆紀錄</span>
          <div class="sort-controls">
            <span class="sort-label">排序：</span>
            <button
              v-for="s in sortOptions"
              :key="s.value"
              class="sort-btn"
              :class="{ active: sortBy === s.value }"
              @click="toggleSort(s.value)"
            >
              {{ s.label }}
              <svg v-if="sortBy === s.value" viewBox="0 0 20 20" fill="currentColor" class="sort-arrow" :class="{ desc: sortOrder === 'DESC' }">
                <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner" />
          <span>載入中...</span>
        </div>
        <div v-else-if="errorMsg" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>{{ errorMsg }}</p>
          <button class="btn-retry" @click="fetchLogs(1)">重新載入</button>
        </div>
        <div v-else-if="!logs.length" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
          <p>查無日誌紀錄</p>
        </div>

        <div v-else class="table-scroll">
          <table class="log-table">
            <thead>
              <tr>
                <th>等級</th>
                <th>類別</th>
                <th>帳號</th>
                <th>IP 位址</th>
                <th>狀態碼</th>
                <th>訊息內容</th>
                <th>時間</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="log in logs"
                :key="log.id"
                class="log-row"
                :class="{ 'row-active': drawer.logId === log.id }"
                @click="openDrawer(log.id)"
              >
                <td>
                  <span class="level-badge" :class="levelClass(log.level)">{{ levelLabel(log.level) }}</span>
                </td>
                <td><span class="category-tag">{{ log.category || '—' }}</span></td>
                <td class="td-mono">{{ log.credential || '—' }}</td>
                <td class="td-mono">{{ log.ip || '—' }}</td>
                <td>
                  <span class="status-code" :class="statusCodeClass(log.responseStatusCode)">{{ log.responseStatusCode || '—' }}</span>
                </td>
                <td class="td-msg" :title="log.msg">{{ log.msg }}</td>
                <td class="td-time">{{ formatDateTime(log.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!loading" class="pagination">
          <button class="page-btn" :disabled="currentPage <= 1" @click="fetchLogs(currentPage - 1)">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </button>
          <template v-for="p in pageRange" :key="p">
            <span v-if="p === '...'" class="page-ellipsis">…</span>
            <button v-else class="page-btn" :class="{ active: p === currentPage }" @click="fetchLogs(p)">{{ p }}</button>
          </template>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="fetchLogs(currentPage + 1)">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 詳情 Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawer.open" class="drawer-backdrop" @click.self="closeDrawer">
          <div class="drawer-panel">
            <div class="drawer-head">
              <span class="drawer-title">日誌詳情</span>
              <button class="drawer-close" @click="closeDrawer">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              </button>
            </div>

            <div v-if="drawer.loading" class="drawer-loading">
              <div class="spinner" />
              <span>載入中...</span>
            </div>
            <div v-else-if="drawer.error" class="drawer-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>{{ drawer.error }}</p>
            </div>
            <div v-else-if="drawer.data" class="drawer-body">

              <!-- 等級 + 類別 -->
              <div class="drawer-hero">
                <span class="level-badge lg" :class="levelClass(drawer.data.level)">
                  Lv.{{ drawer.data.level }} {{ levelLabel(drawer.data.level) }}
                </span>
                <span class="category-tag">{{ drawer.data.category || '—' }}</span>
              </div>

              <!-- 訊息標題 -->
              <div class="drawer-label">{{ drawer.data.label }}</div>
              <!-- 完整訊息 -->
              <div class="drawer-msg">{{ drawer.data.msg }}</div>

              <!-- 詳細欄位 -->
              <div class="drawer-fields">
                <div class="df-row">
                  <span class="df-label">帳號</span>
                  <span class="df-value mono">{{ drawer.data.credential || '—' }}</span>
                </div>
                <div class="df-row">
                  <span class="df-label">IP 位址</span>
                  <span class="df-value mono">{{ drawer.data.ip || '—' }}</span>
                </div>
                <div class="df-row">
                  <span class="df-label">狀態碼</span>
                  <span class="df-value">
                    <span class="status-code" :class="statusCodeClass(drawer.data.responseStatusCode)">
                      {{ drawer.data.responseStatusCode || '—' }}
                    </span>
                  </span>
                </div>
                <div class="df-row">
                  <span class="df-label">訊息序號</span>
                  <span class="df-value mono">{{ drawer.data.msgCode ?? '—' }}</span>
                </div>
                <div class="df-row">
                  <span class="df-label">發生時間</span>
                  <span class="df-value">{{ formatDateTime(drawer.data.createdAt) }}</span>
                </div>
                <div class="df-row">
                  <span class="df-label">日誌 ID</span>
                  <span class="df-value mono small">{{ drawer.data.id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import axiosClient from '@/axios'

// ── 列表狀態 ──
const logs        = ref([])
const loading     = ref(false)
const errorMsg    = ref('')
const total       = ref(0)
const totalPages  = ref(1)
const currentPage = ref(1)
const pageSize    = 20

// ── 操作類型（action API）──
const actionGroups = ref([])

const currentActions = computed(() => {
  if (!filters.value.category) return []
  return actionGroups.value.find(g => g.category === filters.value.category)?.action || []
})

// ── 篩選 ──
const filters = ref({
  credential: '',
  ip: '',
  responseStatusCode: '',
  level: '',
  category: '',
  logMsgCode: '',
  startAt: '',
  endAt: '',
})

// ── 排序 ──
const sortBy    = ref('')
const sortOrder = ref('DESC')
const sortOptions = [
  { label: '時間',   value: 'createdAt' },
  { label: '等級',   value: 'level' },
  { label: '狀態碼', value: 'responseStatusCode' },
  { label: '帳號',   value: 'credential' },
  { label: 'IP',     value: 'ip' },
  { label: '序號',   value: 'msgCode' },
]

// ── 詳情 Drawer ──
const drawer = ref({ open: false, logId: null, loading: false, error: '', data: null })

const openDrawer = async (id) => {
  drawer.value = { open: true, logId: id, loading: true, error: '', data: null }
  try {
    const response = await axiosClient.get(`/backend/log/${id}`)
    if (response.status === 200 && response.data.data) {
      drawer.value.data = response.data.data
    } else {
      drawer.value.error = response.data?.message || '載入失敗'
    }
  } catch (error) {
    drawer.value.error = error.response?.data?.message || '載入失敗，請稍後再試'
  } finally {
    drawer.value.loading = false
  }
}

const closeDrawer = () => {
  drawer.value.open  = false
  drawer.value.logId = null
}

// ── API 呼叫 ──
const fetchLogs = async (page = 1) => {
  loading.value     = true
  errorMsg.value    = ''
  currentPage.value = page

  const params = { page, pageSize }
  if (filters.value.credential)         params.credential = filters.value.credential
  if (filters.value.ip)                 params.ip = filters.value.ip
  if (filters.value.responseStatusCode) params.responseStatusCode = filters.value.responseStatusCode
  if (filters.value.level)              params.level = filters.value.level
  if (filters.value.logMsgCode)         params.logMsgCode = filters.value.logMsgCode
  if (filters.value.startAt)            params.startAt = new Date(filters.value.startAt).toISOString()
  if (filters.value.endAt)              params.endAt   = new Date(filters.value.endAt).toISOString()
  if (sortBy.value) {
    params.sortBy    = sortBy.value
    params.sortOrder = sortOrder.value
  }

  try {
    const response = await axiosClient.get('/backend/log/', { params })
    if (response.status === 200 && response.data.data) {
      const d = response.data.data
      logs.value       = d.data || []
      total.value      = d.total || 0
      totalPages.value = d.totalPages || 1
    } else {
      errorMsg.value = response.data?.message || '載入失敗'
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || '載入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

const fetchActionGroups = async () => {
  try {
    const response = await axiosClient.get('/backend/log/action')
    if (response.status === 200 && response.data.data) {
      actionGroups.value = response.data.data
    }
  } catch { /* 非必要，靜默失敗 */ }
}

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortBy.value    = field
    sortOrder.value = 'DESC'
  }
  fetchLogs(1)
}

const resetFilters = () => {
  filters.value = { credential: '', ip: '', responseStatusCode: '', level: '', category: '', logMsgCode: '', startAt: '', endAt: '' }
  sortBy.value    = ''
  sortOrder.value = 'DESC'
  fetchLogs(1)
}

const pageRange = computed(() => {
  const t   = totalPages.value
  const cur = currentPage.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const pages = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(t - 1, cur + 1); i++) pages.push(i)
  if (cur < t - 2) pages.push('...')
  pages.push(t)
  return pages
})

// ── 格式化 ──
const levelLabel = (l) => ({ '1': '一般', '2': '警告', '3': '錯誤' }[String(l)] || String(l))
const levelClass = (l) => ({ '1': 'level-info', '2': 'level-warn', '3': 'level-error' }[String(l)] || '')

const statusCodeClass = (code) => {
  if (!code) return ''
  const c = Number(code)
  if (c >= 500) return 'code-5xx'
  if (c >= 400) return 'code-4xx'
  if (c >= 300) return 'code-3xx'
  return 'code-2xx'
}

const formatDateTime = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch { return d }
}

onMounted(() => {
  fetchActionGroups()
  fetchLogs(1)
})
</script>

<style scoped lang="scss">
.log-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── 篩選 ──
.filter-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: 1fr; }
}
.filter-item { display: flex; flex-direction: column; gap: 5px; }
.filter-label { font-size: 12px; font-weight: 500; color: #6b7280; }
.filter-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1); }
  &:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
}
.filter-select { cursor: pointer; }
.filter-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-reset {
  padding: 8px 16px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover { background: #f9fafb; }
}
.btn-search {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  svg { width: 14px; height: 14px; }
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

// ── 表格卡片 ──
.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
  flex-wrap: wrap;
  gap: 10px;
}
.table-total { font-size: 13px; color: #6b7280; font-weight: 500; }
.sort-controls { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sort-label { font-size: 12px; color: #9ca3af; }
.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #6b7280;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  svg { width: 12px; height: 12px; transition: transform 0.2s; &.desc { transform: rotate(180deg); } }
  &:hover { border-color: #0891B2; color: #0891B2; }
  &.active { border-color: #0891B2; color: #0891B2; background: #f0f9ff; font-weight: 600; }
}

// ── Loading / Empty ──
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: #6b7280;
  font-size: 14px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #0891B2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.empty-state svg { width: 40px; height: 40px; }
.btn-retry {
  padding: 7px 18px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #0E7490; }
}

// ── 表格 ──
.table-scroll { overflow-x: auto; }
.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th {
    padding: 10px 16px;
    background: #fafafa;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    border-bottom: 1px solid #f3f4f6;
    white-space: nowrap;
  }
  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f9fafb;
    color: #374151;
    vertical-align: middle;
  }
}
.log-row {
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background: #fafafa; }
  &.row-active { background: #f0f9ff; }
  &:last-child td { border-bottom: none; }
}

// ── Badges ──
.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  &.lg { font-size: 13px; padding: 4px 14px; }
}
.level-info  { background: #eff6ff; color: #2563eb; }
.level-warn  { background: #fffbeb; color: #d97706; }
.level-error { background: #fef2f2; color: #dc2626; }

.category-tag {
  display: inline-flex;
  padding: 2px 8px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.status-code {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}
.code-2xx { background: #ecfdf5; color: #059669; }
.code-3xx { background: #eff6ff; color: #2563eb; }
.code-4xx { background: #fffbeb; color: #d97706; }
.code-5xx { background: #fef2f2; color: #dc2626; }

.td-mono { font-family: 'Courier New', monospace; font-size: 12px; color: #6b7280; }
.td-msg  { max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-time { white-space: nowrap; color: #9ca3af; font-size: 12px; }

// ── 分頁 ──
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  border-top: 1px solid #f3f4f6;
}
.page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  svg { width: 14px; height: 14px; }
  &:hover:not(:disabled):not(.active) { border-color: #0891B2; color: #0891B2; }
  &.active { background: #0891B2; border-color: #0891B2; color: #fff; font-weight: 600; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}
.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 13px;
  color: #9ca3af;
}

// ── Drawer ──
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}
.drawer-panel {
  width: 400px;
  max-width: 92vw;
  height: 100%;
  background: #fff;
  box-shadow: -8px 0 32px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}
.drawer-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.drawer-close {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
  svg { width: 16px; height: 16px; }
  &:hover { background: #f3f4f6; color: #374151; }
}
.drawer-loading, .drawer-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #6b7280;
  font-size: 14px;
  svg { width: 36px; height: 36px; color: #f87171; }
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.drawer-hero {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.drawer-label {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  line-height: 1.5;
}
.drawer-msg {
  font-size: 13px;
  color: #374151;
  line-height: 1.7;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 14px;
  word-break: break-all;
}
.drawer-fields {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.df-row {
  display: flex;
  align-items: flex-start;
  padding: 11px 16px;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
  &:last-child { border-bottom: none; }
}
.df-label {
  font-size: 12px;
  color: #9ca3af;
  width: 72px;
  flex-shrink: 0;
  padding-top: 1px;
}
.df-value {
  font-size: 13px;
  color: #111827;
  flex: 1;
  min-width: 0;
  word-break: break-all;
  &.mono { font-family: 'Courier New', monospace; }
  &.small { font-size: 11px; color: #6b7280; }
}

// ── Transition ──
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-active .drawer-panel, .drawer-leave-active .drawer-panel { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer-panel, .drawer-leave-to .drawer-panel { transform: translateX(100%); }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
