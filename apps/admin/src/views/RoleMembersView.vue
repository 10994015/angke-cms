<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { usePermissionStore } from '@/stores/permission'

const router = useRouter()
const route  = useRoute()
const store  = usePermissionStore()
const id     = route.params.id

const roleName  = ref('')
const searchQ   = ref('')
const sortBy    = ref('createdAt')
const sortOrder = ref('DESC')
const page      = ref(1)
const pageSize  = 10
const total     = ref(0)
const totalPages = ref(1)

const users   = ref([])
const loading = ref(true)
const saving  = ref(false)
const error   = ref('')

// Tracks user role membership across page changes: userId → boolean
const userSelections = new Map()

const resolveUserId = (u) => u.userId ?? u.id
const resolveInRole = (u) =>
  u.isInRole !== undefined ? Boolean(u.isInRole) : u.userJoinTime != null

const loadUsers = async (p = 1) => {
  page.value    = p
  loading.value = true
  error.value   = ''
  try {
    const params = { page: p, pageSize, sortBy: sortBy.value, sortOrder: sortOrder.value }
    if (searchQ.value.trim()) params.q = searchQ.value.trim()
    const data = await store.fetchRoleUsers(id, params)
    users.value = (data.data || []).map(u => {
      const uid = resolveUserId(u)
      if (!userSelections.has(uid)) {
        userSelections.set(uid, resolveInRole(u))
      }
      return { ...u, userId: uid, isSelected: userSelections.get(uid) }
    })
    total.value      = data.total || 0
    totalPages.value = data.totalPages || 1
  } catch {
    error.value = '載入失敗，請稍後重試'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const roleData = await store.fetchRoleById(id)
    roleName.value = roleData.roleName || ''
    for (const u of (roleData.users || [])) {
      const uid = resolveUserId(u)
      if (uid) userSelections.set(uid, true)
    }
  } catch {}
  await loadUsers(1)
})

const onSearch = () => loadUsers(1)

const toggleSort = (field) => {
  if (sortBy.value === field) sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  else { sortBy.value = field; sortOrder.value = 'ASC' }
  loadUsers(1)
}

const isAllSelected = computed(() =>
  users.value.length > 0 && users.value.every(u => u.isSelected)
)

const toggleAll = (checked) => {
  users.value.forEach(u => {
    u.isSelected = checked
    userSelections.set(resolveUserId(u), checked)
  })
}

const toggleUser = (u, checked) => {
  u.isSelected = checked
  userSelections.set(resolveUserId(u), checked)
}

const selectedCount = computed(() => Array.from(userSelections.values()).filter(Boolean).length)

const handleSave = async () => {
  saving.value = true
  error.value  = ''
  try {
    const payload = Array.from(userSelections.entries()).map(([userId, isInRole]) => ({ userId, isInRole }))
    const res = await store.updateRoleUsers(id, payload)
    if (res.statusCode === 200) {
      router.push(`/backend/roles/${id}/edit`)
    } else {
      error.value = res.message || '儲存失敗'
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    saving.value = false
  }
}

const formatDate = (d) => {
  if (!d) return '尚未加入'
  return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const statusLabel = (s) => ({ OPEN: '啟用', INVALID: '停用', LOCK: '鎖定' }[s] || s || '—')
const statusClass = (s) => ({ OPEN: 'status-open', INVALID: 'status-invalid', LOCK: 'status-lock' }[s] || '')

const pageRange = computed(() => {
  const t = totalPages.value, cur = page.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const pages = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(t - 1, cur + 1); i++) pages.push(i)
  if (cur < t - 2) pages.push('...')
  pages.push(t)
  return pages
})
</script>

<template>
  <AdminLayout :title="`管理成員 — ${roleName}`">
    <template #header-actions>
      <button class="btn-back" @click="router.push(`/backend/roles/${id}/edit`)">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        返回編輯
      </button>
    </template>

    <!-- 搜尋列 -->
    <div class="toolbar">
      <div class="search-bar">
        <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
          <path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 11-13.333 0 6.667 6.667 0 0113.333 0z"
            stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input v-model="searchQ" type="text" placeholder="搜尋帳號、姓名..." class="search-input" @keydown.enter="onSearch" />
        <button class="btn-search" @click="onSearch">搜尋</button>
      </div>
      <span class="member-hint">已選 {{ selectedCount }} 人</span>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <div class="table-header-row">
        <span class="total-hint">共 {{ total }} 位使用者</span>
        <div class="sort-controls">
          <span class="sort-label">排序：</span>
          <button class="sort-btn" :class="{ active: sortBy === 'credential' }" @click="toggleSort('credential')">
            帳號
            <svg v-if="sortBy === 'credential'" viewBox="0 0 16 16" fill="currentColor" width="11" height="11"
              :style="{ transform: sortOrder === 'DESC' ? 'rotate(180deg)' : 'none' }">
              <path d="M8 3l4 6H4l4-6z"/>
            </svg>
          </button>
          <button class="sort-btn" :class="{ active: sortBy === 'name' }" @click="toggleSort('name')">
            姓名
            <svg v-if="sortBy === 'name'" viewBox="0 0 16 16" fill="currentColor" width="11" height="11"
              :style="{ transform: sortOrder === 'DESC' ? 'rotate(180deg)' : 'none' }">
              <path d="M8 3l4 6H4l4-6z"/>
            </svg>
          </button>
          <button class="sort-btn" :class="{ active: sortBy === 'userJoinTime' }" @click="toggleSort('userJoinTime')">
            加入時間
            <svg v-if="sortBy === 'userJoinTime'" viewBox="0 0 16 16" fill="currentColor" width="11" height="11"
              :style="{ transform: sortOrder === 'DESC' ? 'rotate(180deg)' : 'none' }">
              <path d="M8 3l4 6H4l4-6z"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner" />
        <span>載入中...</span>
      </div>

      <div v-else-if="error" class="empty-state">
        <p class="error-text">{{ error }}</p>
      </div>

      <div v-else-if="!users.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <p>{{ searchQ ? '找不到符合的使用者' : '尚無使用者資料' }}</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th class="check-col">
              <input type="checkbox" :checked="isAllSelected" @change="toggleAll($event.target.checked)" class="check-input" />
            </th>
            <th>帳號</th>
            <th>姓名</th>
            <th>狀態</th>
            <th>加入時間</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.userId" class="table-row" @click="toggleUser(u, !u.isSelected)">
            <td class="check-col" @click.stop>
              <input type="checkbox" :checked="u.isSelected" @change="toggleUser(u, $event.target.checked)" class="check-input" />
            </td>
            <td class="credential-cell">{{ u.credential }}</td>
            <td>{{ u.name || '—' }}</td>
            <td>
              <span class="status-badge" :class="statusClass(u.status)">{{ statusLabel(u.status) }}</span>
            </td>
            <td :class="u.userJoinTime ? 'join-time' : 'not-joined'">{{ formatDate(u.userJoinTime) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="loadUsers(page - 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <template v-for="p in pageRange" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">…</span>
          <button v-else class="page-btn" :class="{ active: p === page }" @click="loadUsers(p)">{{ p }}</button>
        </template>
        <button class="page-btn" :disabled="page >= totalPages" @click="loadUsers(page + 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 底部操作列 -->
    <div class="bottom-actions">
      <p v-if="error" class="form-error">{{ error }}</p>
      <div class="actions-right">
        <button class="btn-cancel" @click="router.push(`/backend/roles/${id}/edit`)">取消</button>
        <button class="btn-save" :disabled="saving || loading" @click="handleSave">
          {{ saving ? '儲存中...' : '儲存' }}
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped lang="scss">
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  &:hover { border-color: #9ca3af; background: #f9fafb; }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
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
  width: 220px;
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

.member-hint { font-size: 13px; color: #0891B2; font-weight: 600; }

.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 14px;
}

.table-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
}
.total-hint { font-size: 13px; color: #6b7280; }
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
  svg { opacity: 0.4; }
  p { font-size: 13px; margin: 0; }
}
.error-text { color: #dc2626; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  th {
    padding: 10px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #f9fafb;
    border-bottom: 1px solid #f3f4f6;
    &.check-col { width: 44px; text-align: center; }
  }
  td {
    padding: 12px 16px;
    font-size: 13px;
    color: #374151;
    border-bottom: 1px solid #f9fafb;
    vertical-align: middle;
    &.check-col { text-align: center; }
  }
  tr:last-child td { border-bottom: none; }
  .table-row {
    cursor: pointer;
    &:hover td { background: #f0f9ff; }
  }
}

.check-input {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #0891B2;
}

.credential-cell { font-weight: 600; color: #111827; }

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.status-open    { background: #ecfdf5; color: #059669; }
.status-invalid { background: #f3f4f6; color: #6b7280; }
.status-lock    { background: #fef2f2; color: #dc2626; }

.join-time  { color: #374151; }
.not-joined { color: #9ca3af; font-style: italic; }

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

.bottom-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 4px 0;
}
.form-error { font-size: 12px; color: #dc2626; margin: 0; margin-right: auto; }
.actions-right { display: flex; gap: 8px; }

.btn-cancel {
  padding: 9px 18px;
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
  padding: 9px 22px;
  border: none;
  border-radius: 8px;
  background: #0891B2;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
