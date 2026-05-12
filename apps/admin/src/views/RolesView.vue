<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { usePermissionStore } from '@/stores/permission'

const router = useRouter()
const store  = usePermissionStore()

const searchName = ref('')
const sortBy     = ref('createdAt')
const sortOrder  = ref('DESC')
const page       = ref(1)
const pageSize   = 10

const load = async (p = 1) => {
  page.value = p
  const params = { page: p, pageSize, sortBy: sortBy.value, sortOrder: sortOrder.value }
  if (searchName.value) params.name = searchName.value
  await store.fetchRoles(params)
}

const onSearch = () => load(1)

const toggleSort = (field) => {
  if (sortBy.value === field) sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  else { sortBy.value = field; sortOrder.value = 'DESC' }
  load(1)
}

const roles      = computed(() => store.roles.data || [])
const total      = computed(() => store.roles.total || 0)
const totalPages = computed(() => store.roles.totalPages || 1)
const loading    = computed(() => store.isLoading)

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

const statusLabel = (s) => ({ OPEN: '啟用', INVALID: '停用', LOCK: '鎖定' }[s] || s || '—')
const statusClass = (s) => ({ OPEN: 'status-open', INVALID: 'status-invalid', LOCK: 'status-lock' }[s] || '')
const permCount   = (permissions) => permissions?.reduce((acc, g) => acc + (g.permissions?.length || 0), 0) || 0
const formatDate  = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(() => load(1))
</script>

<template>
  <AdminLayout title="角色權限">
    <template #header-actions>
      <button class="btn-create" @click="router.push('/roles/create')">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        新增角色
      </button>
      <div class="search-bar">
        <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
          <path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 11-13.333 0 6.667 6.667 0 0113.333 0z"
            stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input v-model="searchName" type="text" placeholder="搜尋角色名稱..." class="search-input" @keydown.enter="onSearch" />
        <button class="btn-search" @click="onSearch">搜尋</button>
      </div>
    </template>

    <!-- 排序列 -->
    <div class="table-card">
      <div class="table-header-row">
        <span class="total-hint">共 {{ total }} 個角色</span>
        <div class="sort-controls">
          <span class="sort-label">排序：</span>
          <button class="sort-btn" :class="{ active: sortBy === 'name' }" @click="toggleSort('name')">
            名稱
            <svg v-if="sortBy === 'name'" viewBox="0 0 16 16" fill="currentColor" width="11" height="11"
              :style="{ transform: sortOrder === 'DESC' ? 'rotate(180deg)' : 'none' }">
              <path d="M8 3l4 6H4l4-6z"/>
            </svg>
          </button>
          <button class="sort-btn" :class="{ active: sortBy === 'createdAt' }" @click="toggleSort('createdAt')">
            建立時間
            <svg v-if="sortBy === 'createdAt'" viewBox="0 0 16 16" fill="currentColor" width="11" height="11"
              :style="{ transform: sortOrder === 'DESC' ? 'rotate(180deg)' : 'none' }">
              <path d="M8 3l4 6H4l4-6z"/>
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
      <div v-else-if="!roles.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p>{{ searchName ? '找不到符合的角色' : '尚無角色資料' }}</p>
      </div>

      <!-- 表格 -->
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>角色名稱</th>
            <th>後台名稱</th>
            <th>狀態</th>
            <th>權限類別數</th>
            <th>使用者數</th>
            <th>建立日期</th>
            <th style="width: 80px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.roleId">
            <td>
              <div class="role-cell">
                <div class="role-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span class="role-name">{{ role.roleName }}</span>
              </div>
            </td>
            <td class="dim-text">{{ role.roleBackendName || '—' }}</td>
            <td>
              <span class="status-badge" :class="statusClass(role.roleStatus)">{{ statusLabel(role.roleStatus) }}</span>
            </td>
            <td class="center-text">{{ role.permissions?.length || 0 }}</td>
            <td class="center-text">{{ role.users?.length ?? 0 }}</td>
            <td class="dim-text">{{ formatDate(role.createdAt) }}</td>
            <td>
              <button class="btn-edit" @click="router.push({ path: `/roles/${role.roleId}/edit`, state: { role } })">
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                編輯
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分頁 -->
      <div v-if="!loading" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="load(page - 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <template v-for="p in pageRange" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">…</span>
          <button v-else class="page-btn" :class="{ active: p === page }" @click="load(p)">{{ p }}</button>
        </template>
        <button class="page-btn" :disabled="page >= totalPages" @click="load(page + 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
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
  width: 200px;
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

.role-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.role-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0891B2, #22B8D4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.role-name { font-weight: 600; color: #111827; }
.dim-text { color: #9ca3af; font-size: 12px; }
.center-text { text-align: center; }

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

.btn-edit {
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
  &:hover { border-color: #0891B2; background: #f0f9ff; color: #0891B2; }
}

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
</style>
