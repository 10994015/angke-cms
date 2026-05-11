<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import axiosClient from '@/axios'

const router = useRouter()

const form    = ref({ name: '', email: '', smtpServer: 'smtp.gmail.com', smtpPort: '465', password: '' })
const error   = ref('')
const saving  = ref(false)
const showPwd = ref(false)

const handleSave = async () => {
  const { name, email, smtpServer, smtpPort } = form.value
  if (!name.trim())       { error.value = '請輸入名稱'; return }
  if (!email.trim())      { error.value = '請輸入 Email'; return }
  if (!smtpServer.trim()) { error.value = '請輸入 SMTP 伺服器'; return }
  if (!smtpPort.trim())   { error.value = '請輸入連接埠'; return }
  saving.value = true
  error.value  = ''
  try {
    const res = await axiosClient.post('/backend/mail/', {
      name:       name.trim(),
      email:      email.trim(),
      smtpServer: smtpServer.trim(),
      smtpPort:   smtpPort.trim(),
      password:   form.value.password || undefined,
    })
    if (res.data.statusCode === 200 || res.data.statusCode === 201) {
      router.push('/mail')
    } else {
      error.value = res.data.message || '新增失敗'
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminLayout title="新增寄信帳號">
    <template #header-actions>
      <button class="btn-back" @click="router.push('/mail')">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        返回列表
      </button>
    </template>

    <div class="form-card">
      <div class="form-section">
        <h3 class="section-title">帳號資訊</h3>

        <div class="field-group">
          <label class="field-label">名稱 <span class="required">*</span></label>
          <input v-model="form.name" type="text" class="field-input" placeholder="例：昂科官方信箱" autofocus />
        </div>

        <div class="field-group">
          <label class="field-label">Email <span class="required">*</span></label>
          <input v-model="form.email" type="email" class="field-input" placeholder="example@gmail.com" />
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">SMTP 設定</h3>

        <div class="field-row">
          <div class="field-group flex-1">
            <label class="field-label">SMTP 伺服器 <span class="required">*</span></label>
            <input v-model="form.smtpServer" type="text" class="field-input" placeholder="smtp.gmail.com" />
          </div>
          <div class="field-group port-field">
            <label class="field-label">連接埠 <span class="required">*</span></label>
            <input v-model="form.smtpPort" type="text" class="field-input" placeholder="465" />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">密碼</label>
          <div class="pwd-wrap">
            <input v-model="form.password" :type="showPwd ? 'text' : 'password'" class="field-input pwd-input" placeholder="SMTP 密碼或應用程式密碼" />
            <button class="pwd-toggle" @click="showPwd = !showPwd" type="button">
              {{ showPwd ? '隱藏' : '顯示' }}
            </button>
          </div>
        </div>
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>

      <div class="form-actions">
        <button class="btn-cancel" @click="router.push('/mail')">取消</button>
        <button class="btn-save" :disabled="saving" @click="handleSave">
          {{ saving ? '新增中...' : '新增帳號' }}
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
  transition: all 0.15s;
  &:hover { border-color: #9ca3af; background: #f9fafb; }
}

.form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  max-width: 640px;
}

.form-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  & + .form-section { border-top: 1px solid #f3f4f6; }
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-row {
  display: flex;
  gap: 12px;
  .flex-1 { flex: 1; }
  .port-field { width: 110px; }
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  .required { color: #0891B2; }
}

.field-input {
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1); }
}

.pwd-wrap {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus-within { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1); }
}

.pwd-input {
  border: none;
  border-radius: 0;
  box-shadow: none !important;
  flex: 1;
}

.pwd-toggle {
  padding: 0 14px;
  border: none;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  &:hover { color: #374151; }
}

.form-error {
  margin: 0 24px;
  font-size: 12px;
  color: #dc2626;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

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
