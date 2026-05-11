<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import axiosClient from '@/axios'

const router = useRouter()

const mails       = ref([])
const loading     = ref(false)
const error       = ref(null)
const searchEmail = ref('')
const page        = ref(1)
const pageSize    = ref(10)
const total       = ref(0)
const totalPages  = ref(1)
const sortBy      = ref('updatedAt')
const sortOrder   = ref('DESC')

const fetchMails = async () => {
  loading.value = true
  error.value   = null
  try {
    const res = await axiosClient.get('/backend/mail/', {
      params: {
        email:     searchEmail.value || undefined,
        sortBy:    sortBy.value,
        sortOrder: sortOrder.value,
        page:      page.value,
        pageSize:  pageSize.value,
      },
    })
    if (res.data.statusCode === 200 && res.data.data) {
      const d = res.data.data
      mails.value      = d.data || []
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

const onSearch = () => { page.value = 1; fetchMails() }

const onSort = (field) => {
  if (sortBy.value === field) sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  else { sortBy.value = field; sortOrder.value = 'DESC' }
  page.value = 1; fetchMails()
}

const goPage = (p) => {
  if (p < 1 || p > totalPages.value) return
  page.value = p; fetchMails()
}

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(fetchMails)
</script>

<template>
  <AdminLayout title="寄信管理">
    <template #header-actions>
      <button class="btn-create" @click="router.push('/mail/create')">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        新增寄信帳號
      </button>
      <div class="search-bar">
        <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
          <path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 11-13.333 0 6.667 6.667 0 0113.333 0z"
            stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input v-model="searchEmail" type="text" placeholder="搜尋 Email..." class="search-input" @keydown.enter="onSearch" />
        <button class="btn-search" @click="onSearch">搜尋</button>
      </div>
    </template>

    <!-- 錯誤 -->
    <div v-if="error" class="error-banner">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
      <button class="retry-btn" @click="fetchMails">重試</button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <div class="table-header-row">
        <span class="total-hint">共 {{ total }} 筆</span>
        <div class="sort-controls">
          <span class="sort-label">排序：</span>
          <button class="sort-btn" :class="{ active: sortBy === 'name' }" @click="onSort('name')">
            名稱
            <svg v-if="sortBy === 'name'" viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
              <path v-if="sortOrder === 'ASC'" d="M8 3l4 6H4l4-6z"/>
              <path v-else d="M8 13L4 7h8l-4 6z"/>
            </svg>
          </button>
          <button class="sort-btn" :class="{ active: sortBy === 'updatedAt' }" @click="onSort('updatedAt')">
            更新時間
            <svg v-if="sortBy === 'updatedAt'" viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
              <path v-if="sortOrder === 'ASC'" d="M8 3l4 6H4l4-6z"/>
              <path v-else d="M8 13L4 7h8l-4 6z"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner" />
        <span>載入中...</span>
      </div>

      <div v-else-if="!mails.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
        </svg>
        <p>{{ searchEmail ? '找不到符合的寄信帳號' : '尚無寄信帳號' }}</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>名稱</th>
            <th>Email</th>
            <th>SMTP 伺服器</th>
            <th>連接埠</th>
            <th>建立日期</th>
            <th>更新日期</th>
            <th style="width:100px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mail in mails" :key="mail.id">
            <td>
              <div class="name-cell">
                <span class="mail-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </span>
                <span class="name-text">{{ mail.name }}</span>
              </div>
            </td>
            <td class="mono">{{ mail.email }}</td>
            <td class="mono">{{ mail.smtpServer }}</td>
            <td><span class="port-badge">{{ mail.smtpPort }}</span></td>
            <td class="dim">{{ formatDate(mail.createdAt) }}</td>
            <td class="dim">{{ formatDate(mail.updatedAt) }}</td>
            <td>
              <button class="btn-edit" @click="router.push({ path: `/mail/${mail.id}/edit`, state: { mail } })">
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                編輯
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <span class="page-info">第 {{ page }} / {{ totalPages }} 頁</span>
        <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">
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

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mail-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f0f9ff;
  color: #0891B2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-text { font-weight: 500; color: #111827; }

.mono { font-family: 'Courier New', monospace; font-size: 12px; color: #6b7280; }

.port-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.dim { color: #9ca3af; }

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 5px;
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
  color: #374151;
  &:hover:not(:disabled) { border-color: #0891B2; color: #0891B2; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

.page-info { font-size: 13px; color: #6b7280; }
</style>
