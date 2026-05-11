<template>
  <AdminLayout title="帳號管理">
    <template #header-actions>
      <button class="btn-create" @click="router.push('/users/create')">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
        新增帳號
      </button>
      <div class="filter-bar">
        <div class="filter-tabs">
          <button
            v-for="opt in STATUS_OPTS"
            :key="opt.value"
            class="filter-tab"
            :class="{ active: statusFilter === opt.value }"
            @click="onStatusFilter(opt.value)"
          >{{ opt.label }}</button>
        </div>
        <div class="search-bar">
          <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
            <path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 11-13.333 0 6.667 6.667 0 0113.333 0z"
              stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            v-model="searchQ"
            type="text"
            placeholder="帳號或姓名..."
            class="search-input"
            @keydown.enter="onSearch"
          />
          <button class="btn-search" @click="onSearch">搜尋</button>
        </div>
      </div>
    </template>

    <div v-if="errorMsg" class="error-banner">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
      {{ errorMsg }}
      <button class="retry-btn" @click="fetchUsers">重試</button>
    </div>

    <div class="table-card">
      <div class="table-header-row">
        <span class="total-hint">共 <strong>{{ total }}</strong> 筆</span>
        <div class="sort-controls">
          <span class="sort-label">排序：</span>
          <button v-for="s in SORT_OPTS" :key="s.field" class="sort-btn"
            :class="{ active: sortBy === s.field }" @click="onSort(s.field)">
            {{ s.label }}
            <svg v-if="sortBy === s.field" viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
              <path v-if="sortOrder === 'ASC'" d="M8 3l4 6H4l4-6z"/>
              <path v-else d="M8 13L4 7h8l-4 6z"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner" /><span>載入中...</span>
      </div>

      <div v-else-if="!users.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <p>{{ searchQ || statusFilter ? '找不到符合的帳號' : '尚無帳號資料' }}</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>帳號 / 姓名</th>
            <th>Email</th>
            <th>狀態</th>
            <th>建立時間</th>
            <th>最後更新</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="clickable-row"
            @click="router.push(`/users/${user.id}`)"
          >
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ avatarChar(user) }}</div>
                <div class="user-info">
                  <span class="user-name">{{ user.name || '—' }}</span>
                  <span class="user-credential">{{ user.credential }}</span>
                </div>
              </div>
            </td>
            <td class="dim">{{ user.email || '—' }}</td>
            <td>
              <span class="status-badge" :class="STATUS_CLASS[user.status]">
                {{ STATUS_LABEL[user.status] ?? user.status }}
              </span>
            </td>
            <td class="dim">{{ formatDate(user.createdAt) }}</td>
            <td class="dim">{{ formatDate(user.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        </button>
        <div class="page-numbers">
          <button
            v-for="p in pageRange"
            :key="p"
            class="page-num"
            :class="{ active: p === page, ellipsis: p === '…' }"
            :disabled="p === '…' || p === page"
            @click="p !== '…' && goPage(p)"
          >{{ p }}</button>
        </div>
        <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        </button>
        <span class="page-info">第 {{ page }} / {{ totalPages }} 頁，共 {{ total }} 筆</span>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import axiosClient from '@/axios'

const router = useRouter()

const STATUS_OPTS = [
  { value: '',        label: '全部' },
  { value: 'OPEN',    label: '啟用中' },
  { value: 'INVALID', label: '停用' },
  { value: 'LOCK',    label: '封鎖' },
]
const STATUS_LABEL = { OPEN: '啟用中', INVALID: '停用', LOCK: '封鎖' }
const STATUS_CLASS = { OPEN: 'badge-ok', INVALID: 'badge-warn', LOCK: 'badge-lock' }
const SORT_OPTS = [
  { field: 'createdAt',  label: '建立時間' },
  { field: 'name',       label: '姓名' },
  { field: 'credential', label: '帳號' },
  { field: 'status',     label: '狀態' },
]

const users        = ref([])
const loading      = ref(false)
const errorMsg     = ref('')
const searchQ      = ref('')
const statusFilter = ref('')
const page         = ref(1)
const pageSize     = ref(10)
const total        = ref(0)
const totalPages   = ref(1)
const sortBy       = ref('createdAt')
const sortOrder    = ref('DESC')

const avatarChar = (user) => (user.name || user.credential || '?').charAt(0).toUpperCase()

const formatDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

const pageRange = computed(() => {
  const t = totalPages.value, c = page.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  if (c <= 4)        return [1, 2, 3, 4, 5, '…', t]
  if (c >= t - 3)    return [1, '…', t - 4, t - 3, t - 2, t - 1, t]
  return [1, '…', c - 1, c, c + 1, '…', t]
})

const fetchUsers = async () => {
  loading.value  = true
  errorMsg.value = ''
  try {
    const res = await axiosClient.get('/backend/user/', {
      params: {
        q:         searchQ.value      || undefined,
        status:    statusFilter.value || undefined,
        sortBy:    sortBy.value,
        sortOrder: sortOrder.value,
        page:      page.value,
        pageSize:  pageSize.value,
      },
    })
    if (res.data.statusCode === 200 && res.data.data) {
      const d          = res.data.data
      users.value      = d.data       || []
      total.value      = d.total      ?? 0
      totalPages.value = d.totalPages ?? 1
      page.value       = d.page       ?? 1
    } else {
      errorMsg.value = res.data.message || '載入失敗'
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    loading.value = false
  }
}

const onSearch       = () => { page.value = 1; fetchUsers() }
const onStatusFilter = (val) => { statusFilter.value = val; page.value = 1; fetchUsers() }
const onSort = (field) => {
  sortOrder.value = sortBy.value === field && sortOrder.value === 'DESC' ? 'ASC' : 'DESC'
  sortBy.value    = field
  page.value      = 1
  fetchUsers()
}
const goPage = (p) => { if (p >= 1 && p <= totalPages.value) { page.value = p; fetchUsers() } }

onMounted(fetchUsers)
</script>

<style scoped lang="scss">
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
  white-space: nowrap;
  &:hover { background: #d04a20; }
}

.filter-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.filter-tabs {
  display: flex;
  gap: 2px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px;
}

.filter-tab {
  padding: 5px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover { color: #374151; }
  &.active { background: #fff; color: #0891B2; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
}

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
  width: 160px;
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
  margin-bottom: 16px;
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

.total-hint { font-size: 13px; color: #6b7280; strong { color: #111827; } }
.sort-controls { display: flex; align-items: center; gap: 6px; }
.sort-label { font-size: 12px; color: #9ca3af; }

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
  svg { opacity: 0.35; }
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
    white-space: nowrap;
  }

  td {
    padding: 12px 20px;
    font-size: 13px;
    color: #374151;
    border-bottom: 1px solid #f9fafb;
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }
}

.clickable-row {
  cursor: pointer;
  transition: background 0.1s;
  &:hover td { background: #f0f9ff; }
}

.user-cell { display: flex; align-items: center; gap: 10px; }

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0891B2, #22B8D4);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}

.user-info { display: flex; flex-direction: column; gap: 2px; }
.user-name { font-size: 13px; font-weight: 500; color: #111827; }
.user-credential { font-size: 12px; color: #9ca3af; font-family: 'Courier New', monospace; }
.dim { color: #9ca3af; font-size: 12px; }

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  &.badge-ok   { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  &.badge-warn { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  &.badge-lock { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 20px;
  border-top: 1px solid #f3f4f6;
  flex-wrap: wrap;
}

.page-numbers { display: flex; align-items: center; gap: 4px; }

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
  color: #374151;
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: #0891B2; color: #0891B2; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

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

.page-info { font-size: 12px; color: #9ca3af; margin-left: 4px; }
</style>
