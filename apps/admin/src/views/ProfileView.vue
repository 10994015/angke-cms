<template>
  <AdminLayout title="個人資料">

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner" />
      <span>載入中...</span>
    </div>

    <div v-else-if="errorMsg" class="error-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ errorMsg }}
    </div>

    <template v-else>

      <!-- 頂部：頭像 + 名稱 -->
      <div class="profile-hero">
        <div class="avatar">{{ avatarInitial }}</div>
        <div class="profile-hero-info">
          <h2 class="profile-name">{{ user.name || '—' }}</h2>
          <div class="profile-meta">
            <span class="meta-tag">{{ user.credential }}</span>
            <span class="status-badge" :class="user.status === 'OPEN' ? 'badge-ok' : 'badge-warn'">
              {{ statusMap[user.status] ?? user.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="profile-body">

        <!-- 左欄：基本資訊 + 密碼 -->
        <div class="profile-col">

          <!-- 基本資訊 card -->
          <div class="card">
            <div class="card-header">
              <div class="card-header-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                基本資訊
              </div>
              <div class="card-header-actions">
                <template v-if="!isEditing">
                  <button class="btn-edit" @click="startEdit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    編輯
                  </button>
                </template>
                <template v-else>
                  <button class="btn-cancel" :disabled="saveLoading" @click="cancelEdit">取消</button>
                  <button class="btn-save" :disabled="saveLoading" @click="handleSaveProfile">
                    {{ saveLoading ? '儲存中...' : '儲存' }}
                  </button>
                </template>
              </div>
            </div>

            <!-- 成功 / 錯誤提示 -->
            <div v-if="saveSuccess" class="inline-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              資料更新成功！
            </div>
            <div v-if="saveError" class="inline-error">{{ saveError }}</div>

            <!-- 顯示模式 -->
            <div v-if="!isEditing" class="info-list">
              <div class="info-row">
                <span class="info-label">姓名</span>
                <span class="info-value">{{ user.name || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">帳號</span>
                <span class="info-value mono">{{ user.credential || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">電子郵件</span>
                <span class="info-value">{{ user.email || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">性別</span>
                <span class="info-value">{{ genderMap[user.gender] ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">生日</span>
                <span class="info-value">{{ formatDate(user.birthDate) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">手機</span>
                <span class="info-value">{{ user.phone || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">身分證字號</span>
                <span class="info-value mono">{{ user.identificationNumber || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">地址</span>
                <span class="info-value">{{ user.address || '—' }}</span>
              </div>
            </div>

            <!-- 編輯模式 -->
            <div v-else class="edit-form">
              <div class="form-group">
                <label class="form-label">姓名 <span class="required">*</span></label>
                <input v-model="editForm.name" type="text" class="form-input" placeholder="請輸入姓名" />
              </div>
              <div class="form-group">
                <label class="form-label">電子郵件</label>
                <input v-model="editForm.email" type="email" class="form-input" placeholder="user@example.com" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">性別</label>
                  <select v-model="editForm.gender" class="form-select">
                    <option value="">不填寫</option>
                    <option value="MALE">男</option>
                    <option value="FEMALE">女</option>
                    <option value="OTHER">其他</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">生日</label>
                  <input v-model="editForm.birthDate" type="date" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">手機</label>
                <input v-model="editForm.phone" type="tel" class="form-input" placeholder="0912345678" />
              </div>
              <div class="form-group">
                <label class="form-label">身分證字號</label>
                <input v-model="editForm.identificationNumber" type="text" class="form-input" placeholder="A123456789" />
              </div>
              <div class="form-group">
                <label class="form-label">地址</label>
                <input v-model="editForm.address" type="text" class="form-input" placeholder="台北市中山區..." />
              </div>
            </div>
          </div>

          <!-- 帳號安全 card -->
          <div class="card">
            <div class="card-header">
              <div class="card-header-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                帳號安全
              </div>
            </div>
            <div class="security-body">
              <div class="security-row">
                <div class="security-info">
                  <span class="security-label">登入密碼</span>
                  <span class="security-desc">定期更換密碼可提升帳號安全性</span>
                </div>
                <button class="btn-goto" @click="router.push('/profile/change-password')">
                  修改密碼
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- 右欄：系統資訊 + 權限 -->
        <div class="profile-col">

          <div class="card">
            <div class="card-header">
              <div class="card-header-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                系統資訊
              </div>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">帳號狀態</span>
                <span class="status-badge" :class="user.status === 'OPEN' ? 'badge-ok' : 'badge-warn'">
                  {{ statusMap[user.status] ?? user.status ?? '—' }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">建立時間</span>
                <span class="info-value">{{ formatDateTime(user.createdAt) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">最後更新</span>
                <span class="info-value">{{ formatDateTime(user.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-header-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                系統權限
              </div>
              <button class="btn-refresh" :class="{ spinning: permLoading }" :disabled="permLoading" @click="refreshPermissions" title="重新整理權限">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
            </div>
            <div v-if="permLoading" class="perm-loading">
              <div class="perm-spinner" />
            </div>
            <template v-else>
              <div v-if="!authStore.systemPermissions.length" class="empty-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                無系統權限
              </div>
              <div v-else class="permission-list">
                <div v-for="perm in authStore.systemPermissions" :key="perm.permissionName" class="permission-item">
                  <span class="perm-name">{{ perm.permissionName }}</span>
                  <span class="perm-mode" :class="perm.mode === 'FULL' ? 'mode-full' : 'mode-read'">
                    {{ perm.mode === 'FULL' ? '完整' : '唯讀' }}
                  </span>
                </div>
              </div>
            </template>
          </div>

        </div>
      </div>
    </template>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = useRouter()

const authStore = useAuthStore()
const isLoading = ref(false)
const errorMsg  = ref('')

const genderMap = { MALE: '男', FEMALE: '女', OTHER: '其他' }
const statusMap = { OPEN: '正常', DISABLED: '停用', DELETED: '已刪除' }

const user = computed(() => authStore.user || {})

const avatarInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.credential || '?'
  return name.charAt(0).toUpperCase()
})

const formatDate = (str) => {
  if (!str || str === 'string') return '—'
  try {
    return new Date(str).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch { return str }
}

const toDateInputValue = (str) => {
  if (!str || str === 'string') return ''
  try {
    return new Date(str).toISOString().slice(0, 10)
  } catch { return '' }
}

const formatDateTime = (str) => {
  if (!str) return '—'
  try {
    return new Date(str).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return str }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await authStore.fetchUser()
  } catch {
    errorMsg.value = '無法載入個人資料，請重新整理'
  } finally {
    isLoading.value = false
  }
})

// ── 編輯個人資料 ──
const isEditing  = ref(false)
const saveLoading = ref(false)
const saveError  = ref('')
const saveSuccess = ref(false)

const editForm = ref({
  name: '', email: '', gender: '', birthDate: '',
  phone: '', identificationNumber: '', address: '',
})

const startEdit = () => {
  const u = authStore.user || {}
  editForm.value = {
    name:                 u.name || '',
    email:                u.email || '',
    gender:               u.gender || '',
    birthDate:            toDateInputValue(u.birthDate),
    phone:                u.phone || '',
    identificationNumber: u.identificationNumber || '',
    address:              u.address || '',
  }
  saveError.value   = ''
  saveSuccess.value = false
  isEditing.value   = true
}

const cancelEdit = () => {
  isEditing.value   = false
  saveError.value   = ''
}

const handleSaveProfile = async () => {
  saveError.value   = ''
  saveSuccess.value = false

  if (!editForm.value.name?.trim()) {
    saveError.value = '姓名為必填欄位'
    return
  }

  const payload = {
    name:                 editForm.value.name.trim(),
    email:                editForm.value.email || undefined,
    gender:               editForm.value.gender || undefined,
    birthDate:            editForm.value.birthDate
                            ? new Date(editForm.value.birthDate).toISOString()
                            : undefined,
    phone:                editForm.value.phone || undefined,
    identificationNumber: editForm.value.identificationNumber || undefined,
    address:              editForm.value.address || undefined,
  }

  saveLoading.value = true
  const result = await authStore.updateProfile(payload)
  saveLoading.value = false

  if (result.success) {
    isEditing.value   = false
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 4000)
  } else {
    saveError.value = result.error || '儲存失敗，請稍後再試'
  }
}

// ── 重新整理權限 ──
const permLoading = ref(false)

const refreshPermissions = async () => {
  permLoading.value = true
  try {
    await authStore.fetchUserPermissions()
  } finally {
    permLoading.value = false
  }
}

</script>

<style scoped lang="scss">
// ── 載入 / 錯誤 ──
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  color: #6b7280;
  font-size: 14px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #0891B2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 14px;
  svg { width: 18px; height: 18px; flex-shrink: 0; }
}

// ── 頂部英雄區 ──
.profile-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 28px;
  margin-bottom: 20px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0891B2, #22B8D4);
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
  user-select: none;
}

.profile-hero-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-tag {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 2px 8px;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  padding: 2px 10px;
  &.badge-ok   { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  &.badge-warn { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
}

// ── 雙欄佈局 ──
.profile-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.profile-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── Card ──
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  svg { width: 16px; height: 16px; color: #0891B2; flex-shrink: 0; }
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  svg { width: 13px; height: 13px; }
  &:hover { border-color: #0891B2; color: #0891B2; background: #f0f9ff; }
}

.btn-cancel {
  padding: 5px 12px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  &:hover:not(:disabled) { background: #f3f4f6; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-save {
  padding: 5px 14px;
  border: none;
  border-radius: 20px;
  background: #0891B2;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

// ── 行內提示 ──
.inline-success {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  svg { width: 15px; height: 15px; flex-shrink: 0; }
}

.inline-error {
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 13px;
}

// ── 資訊列表（檢視模式）──
.info-list { padding: 4px 0; }

.info-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 20px;
  border-bottom: 1px solid #f9fafb;
  &:last-child { border-bottom: none; }
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: #111827;
  text-align: right;
  word-break: break-all;
  &.mono  { font-family: 'Courier New', monospace; font-size: 12px; }
  &.small { font-size: 11px; color: #6b7280; }
  &.selectable { user-select: all; }
}

// ── 編輯表單 ──
.edit-form {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pw-form {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.required { color: #0891B2; }

.form-input,
.form-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: #0891B2;
    box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
  }
}

.btn-primary {
  align-self: flex-start;
  padding: 9px 20px;
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

// ── 帳號安全 ──
.security-body { padding: 4px 0; }

.security-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  gap: 16px;
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.security-label {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.security-desc {
  font-size: 12px;
  color: #9ca3af;
}

.btn-goto {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border: 1px solid #0891B2;
  border-radius: 20px;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: #0891B2;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: all 0.15s;
  flex-shrink: 0;
  svg { width: 13px; height: 13px; }
  &:hover { background: #0891B2; color: #fff; }
}

// ── 重新整理按鈕 ──
.btn-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
  flex-shrink: 0;

  svg { width: 13px; height: 13px; transition: transform 0.4s; }
  &:hover:not(:disabled) { border-color: #0891B2; color: #0891B2; background: #f0f9ff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &.spinning svg { animation: spin 0.7s linear infinite; }
}

.perm-loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.perm-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #0891B2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

// ── 權限 ──
.empty-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  font-size: 13px;
  color: #9ca3af;
  svg { width: 18px; height: 18px; }
}

.permission-list { padding: 4px 0; }

.permission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #f9fafb;
  &:last-child { border-bottom: none; }
}

.perm-name { font-size: 13px; color: #374151; font-weight: 500; }

.perm-mode {
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  padding: 2px 8px;
  &.mode-full { background: #f0f9ff; color: #0891B2; border: 1px solid #bae6fd; }
  &.mode-read { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; }
}
</style>
