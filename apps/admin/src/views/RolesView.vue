<template>
  <AdminLayout title="角色權限">
    <div class="roles-wrap">

      <!-- 搜尋 + 排序列 -->
      <div class="toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>
          <input
            v-model="searchName"
            class="search-input"
            placeholder="搜尋角色名稱..."
            @keyup.enter="fetchRoles(1)"
          />
          <button v-if="searchName" class="search-clear" @click="searchName = ''; fetchRoles(1)">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </button>
        </div>

        <div class="toolbar-right">
          <span class="total-label">共 {{ total }} 個角色</span>
          <div class="sort-controls">
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
          <button class="btn-search" :disabled="loading" @click="fetchRoles(1)">查詢</button>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="state-box">
        <div class="spinner" />
        <span>載入中...</span>
      </div>

      <!-- 錯誤 -->
      <div v-else-if="errorMsg" class="state-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>{{ errorMsg }}</p>
        <button class="btn-retry" @click="fetchRoles(1)">重新載入</button>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="!roles.length" class="state-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <p>查無角色資料</p>
      </div>

      <!-- 角色卡片列表 -->
      <div v-else class="role-list">
        <div
          v-for="role in roles"
          :key="role.roleId"
          class="role-card"
          :class="{ 'card-active': drawer.roleId === role.roleId }"
          @click="openDrawer(role)"
        >
          <!-- 左：圖示 + 名稱 -->
          <div class="card-left">
            <div class="role-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="role-meta">
              <div class="role-name">{{ role.roleName }}</div>
              <div class="role-org">{{ role.roleBackendName }}</div>
            </div>
          </div>

          <!-- 中：權限標籤 -->
          <div class="card-mid">
            <template v-if="role.permissions?.length">
              <span
                v-for="group in role.permissions"
                :key="group.category"
                class="perm-category-tag"
              >{{ group.category }}
                <span class="perm-count">{{ group.permissions.length }}</span>
              </span>
            </template>
            <span v-else class="no-perm">無權限設定</span>
          </div>

          <!-- 右：狀態 + 使用者數 + 時間 -->
          <div class="card-right">
            <span class="status-badge" :class="roleStatusClass(role.roleStatus)">{{ roleStatusLabel(role.roleStatus) }}</span>
            <div class="card-stat">
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
              {{ role.users?.length ?? 0 }} 位使用者
            </div>
            <div class="card-time">{{ formatDate(role.createdAt) }}</div>
          </div>

          <svg class="card-arrow" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="fetchRoles(currentPage - 1)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        </button>
        <template v-for="p in pageRange" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">…</span>
          <button v-else class="page-btn" :class="{ active: p === currentPage }" @click="fetchRoles(p)">{{ p }}</button>
        </template>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="fetchRoles(currentPage + 1)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </div>

    <!-- 詳情 Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawer.open" class="drawer-backdrop" @click.self="closeDrawer">
          <div class="drawer-panel">
            <div class="drawer-head">
              <span class="drawer-title">角色詳情</span>
              <button class="drawer-close" @click="closeDrawer">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              </button>
            </div>

            <div v-if="drawer.data" class="drawer-body">
              <!-- Hero -->
              <div class="drawer-hero">
                <div class="drawer-role-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div class="drawer-role-name">{{ drawer.data.roleName }}</div>
                  <div class="drawer-role-org">{{ drawer.data.roleBackendName }}</div>
                </div>
                <span class="status-badge ml-auto" :class="roleStatusClass(drawer.data.roleStatus)">{{ roleStatusLabel(drawer.data.roleStatus) }}</span>
              </div>

              <!-- 基本資訊 -->
              <div class="drawer-section">
                <div class="section-title">基本資訊</div>
                <div class="df-list">
                  <div class="df-row">
                    <span class="df-label">使用者數</span>
                    <span class="df-value">{{ drawer.data.users?.length ?? 0 }} 位</span>
                  </div>
                  <div class="df-row">
                    <span class="df-label">建立時間</span>
                    <span class="df-value">{{ formatDateTime(drawer.data.createdAt) }}</span>
                  </div>
                  <div class="df-row">
                    <span class="df-label">最後更新</span>
                    <span class="df-value">{{ formatDateTime(drawer.data.updatedAt) }}</span>
                  </div>
                  <div class="df-row">
                    <span class="df-label">角色 ID</span>
                    <span class="df-value mono small">{{ drawer.data.roleId }}</span>
                  </div>
                </div>
              </div>

              <!-- 權限清單 -->
              <div class="drawer-section">
                <div class="section-title">
                  權限設定
                  <span class="section-count">{{ totalPermCount(drawer.data.permissions) }} 項</span>
                </div>
                <div v-if="!drawer.data.permissions?.length" class="no-perm-msg">此角色尚未設定任何權限</div>
                <div v-else class="perm-groups">
                  <div v-for="group in drawer.data.permissions" :key="group.category" class="perm-group">
                    <div class="perm-group-title">
                      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
                      {{ group.category }}
                    </div>
                    <div class="perm-items">
                      <div v-for="p in group.permissions" :key="p.permissionId" class="perm-item">
                        <span class="perm-name">{{ p.permissionName }}</span>
                        <span class="mode-badge" :class="p.mode === 'FULL' ? 'mode-full' : 'mode-readonly'">
                          {{ p.mode === 'FULL' ? '完整' : '唯讀' }}
                        </span>
                      </div>
                    </div>
                  </div>
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

const roles       = ref([])
const loading     = ref(false)
const errorMsg    = ref('')
const total       = ref(0)
const totalPages  = ref(1)
const currentPage = ref(1)
const pageSize    = 10

const searchName = ref('')
const sortBy     = ref('createdAt')
const sortOrder  = ref('DESC')

const sortOptions = [
  { label: '建立時間', value: 'createdAt' },
  { label: '名稱',     value: 'name' },
]

const drawer = ref({ open: false, roleId: null, data: null })

const fetchRoles = async (page = 1) => {
  loading.value     = true
  errorMsg.value    = ''
  currentPage.value = page

  const params = { page, pageSize }
  if (searchName.value) params.name = searchName.value
  if (sortBy.value)     params.sortBy = sortBy.value
  params.sortOrder = sortOrder.value

  try {
    const response = await axiosClient.get('/backend/auth/role', { params })
    if (response.status === 200 && response.data.data) {
      const d = response.data.data
      roles.value      = d.data || []
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

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortBy.value    = field
    sortOrder.value = 'DESC'
  }
  fetchRoles(1)
}

const openDrawer = (role) => {
  drawer.value = { open: true, roleId: role.roleId, data: role }
}

const closeDrawer = () => {
  drawer.value.open   = false
  drawer.value.roleId = null
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

const totalPermCount = (permissions) =>
  permissions?.reduce((acc, g) => acc + (g.permissions?.length || 0), 0) || 0

const roleStatusLabel = (s) => ({ OPEN: '啟用', INVALID: '停用', LOCK: '鎖定' }[s] || s || '—')
const roleStatusClass = (s) => ({ OPEN: 'status-open', INVALID: 'status-invalid', LOCK: 'status-lock' }[s] || '')

const formatDate = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
  catch { return d }
}
const formatDateTime = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return d }
}

onMounted(() => fetchRoles(1))
</script>

<style scoped lang="scss">
.roles-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── 工具列 ──
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 340px;
}
.search-icon {
  position: absolute;
  left: 11px;
  width: 15px;
  height: 15px;
  color: #9ca3af;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 9px 36px 9px 34px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 13px;
  color: #111827;
  outline: none;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1); }
}
.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  display: flex;
  svg { width: 14px; height: 14px; }
  &:hover { color: #374151; }
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  flex-wrap: wrap;
}
.total-label {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}
.sort-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
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
.btn-search {
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
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

// ── 狀態 ──
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 70px 0;
  color: #6b7280;
  font-size: 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  svg { width: 40px; height: 40px; }
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #0891B2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
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

// ── 角色卡片 ──
.role-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.role-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px 20px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.12s;
  &:hover { border-color: #bae6fd; box-shadow: 0 2px 8px rgba(8, 145, 178, 0.08); }
  &.card-active { border-color: #0891B2; background: #f0f9ff; box-shadow: 0 2px 12px rgba(8, 145, 178, 0.12); }
}
.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
}
.role-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0891B2, #22B8D4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(8, 145, 178, 0.2);
  svg { width: 20px; height: 20px; color: #fff; }
}
.role-meta { display: flex; flex-direction: column; gap: 2px; }
.role-name { font-size: 14px; font-weight: 600; color: #111827; }
.role-org  { font-size: 12px; color: #9ca3af; }

.card-mid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.perm-category-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}
.perm-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  background: #0369a1;
  color: #fff;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  padding: 0 4px;
}
.no-perm { font-size: 12px; color: #d1d5db; }

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  min-width: 100px;
}
.card-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  svg { width: 13px; height: 13px; }
}
.card-time { font-size: 11px; color: #9ca3af; }
.card-arrow { width: 16px; height: 16px; color: #d1d5db; flex-shrink: 0; }

// ── Status badge ──
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
.ml-auto { margin-left: auto; }

// ── 分頁 ──
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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
  width: 440px;
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
.drawer-title { font-size: 15px; font-weight: 700; color: #111827; }
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
.drawer-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}
.drawer-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
}
.drawer-role-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0891B2, #22B8D4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(8, 145, 178, 0.25);
  svg { width: 22px; height: 22px; color: #fff; }
}
.drawer-role-name { font-size: 16px; font-weight: 700; color: #111827; }
.drawer-role-org  { font-size: 12px; color: #9ca3af; margin-top: 2px; }

.drawer-section { display: flex; flex-direction: column; gap: 10px; }
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.section-count {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 7px;
  border-radius: 99px;
}

.df-list {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.df-row {
  display: flex;
  align-items: flex-start;
  padding: 10px 16px;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
  &:last-child { border-bottom: none; }
}
.df-label { font-size: 12px; color: #9ca3af; width: 72px; flex-shrink: 0; padding-top: 1px; }
.df-value {
  font-size: 13px;
  color: #111827;
  flex: 1;
  min-width: 0;
  word-break: break-all;
  &.mono { font-family: 'Courier New', monospace; }
  &.small { font-size: 11px; color: #6b7280; }
}

// ── 權限清單 ──
.no-perm-msg {
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
  padding: 20px 0;
}
.perm-groups { display: flex; flex-direction: column; gap: 12px; }
.perm-group {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.perm-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  svg { width: 14px; height: 14px; color: #9ca3af; }
}
.perm-items { display: flex; flex-direction: column; }
.perm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  border-bottom: 1px solid #f9fafb;
  gap: 8px;
  &:last-child { border-bottom: none; }
}
.perm-name { font-size: 13px; color: #374151; }
.mode-badge {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.mode-full     { background: #ecfdf5; color: #059669; }
.mode-readonly { background: #eff6ff; color: #2563eb; }

// ── Transition ──
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-active .drawer-panel, .drawer-leave-active .drawer-panel { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer-panel, .drawer-leave-to .drawer-panel { transform: translateX(100%); }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
