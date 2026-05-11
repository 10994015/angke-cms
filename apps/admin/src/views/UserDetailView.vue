<template>
  <AdminLayout :title="pageTitle">
    <template #header-actions>
      <template v-if="!editMode && userData">
        <button class="btn-delete" @click="showDeleteConfirm = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          刪除
        </button>
        <button class="btn-edit" @click="startEdit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          編輯
        </button>
      </template>
      <template v-if="editMode">
        <button class="btn-cancel-edit" :disabled="saving" @click="cancelEdit">取消</button>
        <button class="btn-save" :disabled="saving" @click="handleSave">
          <div v-if="saving" class="btn-spinner" />
          {{ saving ? '儲存中...' : '儲存變更' }}
        </button>
      </template>
    </template>

    <div class="detail-wrap">

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner" />
        <span>載入中...</span>
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>{{ fetchError }}</p>
        <button class="btn-retry" @click="loadUser">重新載入</button>
      </div>

      <template v-else-if="userData">

        <!-- 頂部 Hero -->
        <div class="hero-card">
          <div class="hero-avatar" :data-status="userData.status">
            {{ avatarInitials }}
          </div>
          <div class="hero-info">
            <div class="hero-name">{{ userData.name }}</div>
            <div class="hero-credential">@{{ userData.credential }}</div>
            <div class="hero-meta">
              <span class="status-badge" :class="statusClass(userData.status)">{{ statusLabel(userData.status) }}</span>
              <span class="hero-email">{{ userData.email }}</span>
            </div>
          </div>
        </div>

        <!-- 訊息提示 -->
        <div v-if="successMsg" class="alert alert-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {{ successMsg }}
        </div>
        <div v-if="errorMsg" class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errorMsg }}
        </div>

        <div class="content-grid">
          <!-- 基本資料 -->
          <div class="info-card">
            <div class="card-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              基本資料
            </div>
            <div class="field-list">
              <!-- 姓名 -->
              <div class="field-row">
                <span class="field-label">姓名</span>
                <div class="field-value">
                  <input v-if="editMode" v-model="editForm.name" class="edit-input" placeholder="輸入姓名" />
                  <span v-else>{{ userData.name || '—' }}</span>
                </div>
              </div>
              <!-- 電子郵件 -->
              <div class="field-row">
                <span class="field-label">電子郵件</span>
                <div class="field-value">
                  <input v-if="editMode" v-model="editForm.email" type="email" class="edit-input" placeholder="輸入電子郵件" />
                  <span v-else>{{ userData.email || '—' }}</span>
                </div>
              </div>
              <!-- 身分證字號 -->
              <div class="field-row">
                <span class="field-label">身分證字號</span>
                <div class="field-value">
                  <input v-if="editMode" v-model="editForm.identificationNumber" class="edit-input" placeholder="輸入身分證字號" />
                  <span v-else>{{ userData.identificationNumber || '—' }}</span>
                </div>
              </div>
              <!-- 性別 -->
              <div class="field-row">
                <span class="field-label">性別</span>
                <div class="field-value">
                  <select v-if="editMode" v-model="editForm.gender" class="edit-select">
                    <option value="">未設定</option>
                    <option value="MALE">男</option>
                    <option value="FEMALE">女</option>
                  </select>
                  <span v-else>{{ genderLabel(userData.gender) }}</span>
                </div>
              </div>
              <!-- 生日 -->
              <div class="field-row">
                <span class="field-label">生日</span>
                <div class="field-value">
                  <input v-if="editMode" v-model="editForm.birthDate" type="date" class="edit-input" />
                  <span v-else>{{ formatDate(userData.birthDate) }}</span>
                </div>
              </div>
              <!-- 電話 -->
              <div class="field-row">
                <span class="field-label">電話</span>
                <div class="field-value">
                  <input v-if="editMode" v-model="editForm.phone" class="edit-input" placeholder="輸入電話號碼" />
                  <span v-else>{{ userData.phone || '—' }}</span>
                </div>
              </div>
              <!-- 地址 -->
              <div class="field-row">
                <span class="field-label">地址</span>
                <div class="field-value">
                  <input v-if="editMode" v-model="editForm.address" class="edit-input" placeholder="輸入地址" />
                  <span v-else>{{ userData.address || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 帳號狀態 & 系統資訊 -->
          <div class="side-col">
            <!-- 帳號狀態 -->
            <div class="info-card">
              <div class="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                帳號狀態
              </div>
              <div class="field-list">
                <div class="field-row">
                  <span class="field-label">帳號</span>
                  <span class="field-value mono">{{ userData.credential }}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">狀態</span>
                  <div class="field-value">
                    <select v-if="editMode" v-model="editForm.status" class="edit-select">
                      <option value="OPEN">啟用</option>
                      <option value="INVALID">停用</option>
                      <option value="LOCK">鎖定</option>
                    </select>
                    <span v-else class="status-badge" :class="statusClass(userData.status)">{{ statusLabel(userData.status) }}</span>
                  </div>
                </div>
                <div v-if="userData.disabledAt" class="field-row">
                  <span class="field-label">停用時間</span>
                  <span class="field-value">{{ formatDateTime(userData.disabledAt) }}</span>
                </div>
              </div>
            </div>

            <!-- 系統資訊 -->
            <div class="info-card">
              <div class="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                系統資訊
              </div>
              <div class="field-list">
                <div class="field-row">
                  <span class="field-label">建立時間</span>
                  <span class="field-value">{{ formatDateTime(userData.createdAt) }}</span>
                </div>
                <div v-if="userData.createdBy" class="field-row">
                  <span class="field-label">建立者</span>
                  <span class="field-value">{{ userData.createdBy }}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">最後更新</span>
                  <span class="field-value">{{ formatDateTime(userData.updatedAt) }}</span>
                </div>
                <div v-if="userData.updatedBy" class="field-row">
                  <span class="field-label">更新者</span>
                  <span class="field-value">{{ userData.updatedBy }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- 刪除確認 Dialog -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
        <div class="modal-box">
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <h3 class="modal-title">確認刪除帳號</h3>
          <p class="modal-desc">確定要刪除帳號 <strong>{{ userData?.credential }}</strong>（{{ userData?.name }}）嗎？此操作無法復原。</p>
          <div v-if="deleteError" class="alert alert-error modal-alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ deleteError }}
          </div>
          <div class="modal-actions">
            <button class="btn-modal-cancel" :disabled="deleting" @click="showDeleteConfirm = false">取消</button>
            <button class="btn-modal-delete" :disabled="deleting" @click="handleDelete">
              <div v-if="deleting" class="btn-spinner" />
              {{ deleting ? '刪除中...' : '確認刪除' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import axiosClient from '@/axios'

const router = useRouter()
const route  = useRoute()
const userId = route.params.id

const userData  = ref(null)
const loading   = ref(false)
const fetchError = ref('')
const editMode  = ref(false)
const saving    = ref(false)
const successMsg = ref('')
const errorMsg  = ref('')
const showDeleteConfirm = ref(false)
const deleting  = ref(false)
const deleteError = ref('')

const editForm = ref({
  name: '', email: '', identificationNumber: '',
  gender: '', birthDate: '', phone: '', address: '', status: 'OPEN',
})

const pageTitle = computed(() => {
  if (!userData.value) return '帳號詳情'
  return editMode.value ? `編輯：${userData.value.name}` : userData.value.name
})

const avatarInitials = computed(() => {
  const name = userData.value?.name || ''
  return name.slice(0, 2) || '??'
})

const loadUser = async () => {
  loading.value = true
  fetchError.value = ''
  try {
    const response = await axiosClient.get(`/backend/user/${userId}`)
    if (response.status === 200 && response.data.data) {
      userData.value = response.data.data
    } else {
      fetchError.value = '無法載入使用者資料'
    }
  } catch (error) {
    fetchError.value = error.response?.data?.message || '載入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  const u = userData.value
  editForm.value = {
    name:                 u.name || '',
    email:                u.email || '',
    identificationNumber: u.identificationNumber || '',
    gender:               u.gender || '',
    birthDate:            u.birthDate ? u.birthDate.slice(0, 10) : '',
    phone:                u.phone || '',
    address:              u.address || '',
    status:               u.status || 'OPEN',
  }
  successMsg.value = ''
  errorMsg.value   = ''
  editMode.value   = true
}

const cancelEdit = () => {
  editMode.value = false
  errorMsg.value = ''
}

const handleSave = async () => {
  errorMsg.value   = ''
  successMsg.value = ''
  saving.value     = true
  try {
    const payload = {
      name:                 editForm.value.name || undefined,
      email:                editForm.value.email || undefined,
      identificationNumber: editForm.value.identificationNumber || undefined,
      gender:               editForm.value.gender || undefined,
      birthDate:            editForm.value.birthDate ? new Date(editForm.value.birthDate).toISOString() : undefined,
      phone:                editForm.value.phone || undefined,
      address:              editForm.value.address || undefined,
      status:               editForm.value.status || undefined,
    }
    const response = await axiosClient.patch(`/backend/user/${userId}`, payload)
    if (response.status === 200 && response.data.data) {
      userData.value = response.data.data
      editMode.value   = false
      successMsg.value = '帳號資料已更新'
      setTimeout(() => { successMsg.value = '' }, 3000)
    } else {
      errorMsg.value = response.data?.message || '更新失敗'
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || '更新失敗，請稍後再試'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  deleteError.value = ''
  deleting.value = true
  try {
    const response = await axiosClient.delete(`/backend/user/${userId}`)
    if (response.status === 200) {
      showDeleteConfirm.value = false
      router.push('/users')
    } else {
      deleteError.value = response.data?.message || '刪除失敗'
    }
  } catch (error) {
    deleteError.value = error.response?.data?.message || '刪除失敗，請稍後再試'
  } finally {
    deleting.value = false
  }
}

const genderLabel = (g) => ({ MALE: '男', FEMALE: '女' }[g] || '未設定')

const statusLabel = (s) => ({ OPEN: '啟用', INVALID: '停用', LOCK: '鎖定' }[s] || s || '—')
const statusClass = (s) => ({ OPEN: 'status-open', INVALID: 'status-invalid', LOCK: 'status-lock' }[s] || '')

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

onMounted(loadUser)
</script>

<style scoped lang="scss">
.detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── Loading / Error ──
.loading-state, .error-state {
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
.error-state svg { width: 40px; height: 40px; color: #f87171; }
.btn-retry {
  padding: 8px 20px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #0E7490; }
}

// ── Hero ──
.hero-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px 28px;
}
.hero-avatar {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0891B2, #22B8D4);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.25);
}
.hero-info { display: flex; flex-direction: column; gap: 4px; }
.hero-name { font-size: 20px; font-weight: 700; color: #111827; }
.hero-credential { font-size: 13px; color: #6b7280; }
.hero-meta { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
.hero-email { font-size: 13px; color: #6b7280; }

// ── Alerts ──
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  svg { width: 16px; height: 16px; flex-shrink: 0; }
}
.alert-success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.alert-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

// ── Grid layout ──
.content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  align-items: start;
}
.side-col { display: flex; flex-direction: column; gap: 16px; }

// ── Info card ──
.info-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
  svg { width: 16px; height: 16px; color: #9ca3af; }
}
.field-list { display: flex; flex-direction: column; }
.field-row {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
  border-bottom: 1px solid #f3f4f6;
  &:last-child { border-bottom: none; }
}
.field-label {
  font-size: 13px;
  color: #6b7280;
  width: 110px;
  flex-shrink: 0;
}
.field-value {
  font-size: 14px;
  color: #111827;
  flex: 1;
  min-width: 0;
  &.mono { font-family: 'Courier New', monospace; font-size: 13px; }
}

// ── Edit inputs ──
.edit-input, .edit-select {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  background: #fff;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #0891B2;
    box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
  }
}
.edit-select { cursor: pointer; }

// ── Status badges ──
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}
.status-open    { background: #ecfdf5; color: #059669; }
.status-invalid { background: #f3f4f6; color: #6b7280; }
.status-lock    { background: #fef2f2; color: #dc2626; }

// ── Header action buttons ──
.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;
  svg { width: 14px; height: 14px; }
  &:hover { background: #fef2f2; border-color: #f87171; }
}
.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;
  svg { width: 14px; height: 14px; }
  &:hover { background: #f9fafb; border-color: #9ca3af; }
}
.btn-cancel-edit {
  padding: 8px 16px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  &:hover:not(:disabled) { background: #f9fafb; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.btn-save {
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
  transition: background 0.15s;
  font-family: inherit;
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

// ── Delete confirm modal ──
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #fff;
  border-radius: 16px;
  padding: 32px 36px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  svg { width: 24px; height: 24px; color: #dc2626; }
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.modal-desc {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin: 0;
  line-height: 1.6;
  strong { color: #111827; }
}
.modal-alert {
  width: 100%;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}
.btn-modal-cancel {
  flex: 1;
  padding: 10px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  &:hover:not(:disabled) { background: #f9fafb; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.btn-modal-delete {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  &:hover:not(:disabled) { background: #b91c1c; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
