<template>
  <AdminLayout title="新增帳號">
    <div class="page-wrap">
      <div class="page-card">

        <button class="back-link" @click="router.push('/backend/users')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          返回帳號管理
        </button>

        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        </div>

        <h2 class="card-title">新增帳號</h2>
        <p class="card-desc">建立新的使用者帳號，帳號建立後將發送通知郵件。</p>

        <div v-if="success" class="alert alert-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          帳號建立成功！即將返回帳號管理...
        </div>

        <div v-if="errorMsg" class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errorMsg }}
        </div>

        <form class="create-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">帳號 <span class="required">*</span></label>
            <input
              v-model="form.credential"
              type="text"
              class="form-input"
              :class="{ 'input-error': touched.credential && !form.credential }"
              placeholder="輸入登入帳號"
              autocomplete="username"
              :disabled="loading || success"
              @blur="touched.credential = true"
            />
            <p v-if="touched.credential && !form.credential" class="field-hint error">帳號為必填</p>
          </div>

          <div class="form-group">
            <label class="form-label">姓名 <span class="required">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ 'input-error': touched.name && !form.name }"
              placeholder="輸入使用者姓名"
              :disabled="loading || success"
              @blur="touched.name = true"
            />
            <p v-if="touched.name && !form.name" class="field-hint error">姓名為必填</p>
          </div>

          <div class="form-group">
            <label class="form-label">電子郵件 <span class="required">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'input-error': touched.email && !isValidEmail }"
              placeholder="輸入電子郵件地址"
              autocomplete="email"
              :disabled="loading || success"
              @blur="touched.email = true"
            />
            <p v-if="touched.email && !form.email" class="field-hint error">電子郵件為必填</p>
            <p v-else-if="touched.email && form.email && !isValidEmail" class="field-hint error">電子郵件格式不正確</p>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" :disabled="loading || success" @click="router.push('/backend/users')">
              取消
            </button>
            <button type="submit" class="btn-submit" :disabled="loading || success">
              <div v-if="loading" class="btn-spinner" />
              {{ loading ? '建立中...' : '建立帳號' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import axiosClient from '@/axios'

const router = useRouter()

const form = ref({ credential: '', name: '', email: '' })
const touched = ref({ credential: false, name: false, email: false })
const loading = ref(false)
const success = ref(false)
const errorMsg = ref('')

const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))

const handleSubmit = async () => {
  touched.value = { credential: true, name: true, email: true }
  errorMsg.value = ''

  if (!form.value.credential) { errorMsg.value = '請輸入帳號'; return }
  if (!form.value.name)       { errorMsg.value = '請輸入姓名'; return }
  if (!form.value.email)      { errorMsg.value = '請輸入電子郵件'; return }
  if (!isValidEmail.value)    { errorMsg.value = '電子郵件格式不正確'; return }

  loading.value = true
  try {
    const response = await axiosClient.post('/backend/user/', {
      credential: form.value.credential,
      name: form.value.name,
      email: form.value.email,
    })
    if (response.status === 200 || response.status === 201) {
      success.value = true
      setTimeout(() => router.push('/backend/users'), 1500)
    } else {
      errorMsg.value = response.data?.message || '建立失敗，請稍後再試'
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || '建立失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.page-wrap {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.page-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px 36px 36px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
  font-family: inherit;
  transition: color 0.15s;
  svg { width: 15px; height: 15px; }
  &:hover { color: #0891B2; }
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0891B2, #22B8D4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.25);
  svg { width: 26px; height: 26px; color: #fff; }
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px;
  line-height: 1.6;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  svg { width: 16px; height: 16px; flex-shrink: 0; }
}

.alert-success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #0891B2;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  color: #111827;
  outline: none;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    border-color: #0891B2;
    box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  &.input-error {
    border-color: #f87171;
    &:focus { box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15); }
  }
}

.field-hint {
  font-size: 12px;
  margin: 0;
  &.error { color: #dc2626; }
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.btn-cancel {
  flex: 1;
  padding: 11px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.btn-submit {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;

  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
