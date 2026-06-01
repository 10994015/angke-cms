<template>
  <AdminLayout title="修改密碼">
    <div class="change-pw-wrap">
      <div class="change-pw-card">

        <!-- 返回連結 -->
        <button class="back-link" @click="router.push('/backend/profile')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          返回個人資料
        </button>

        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>

        <h2 class="card-title">修改密碼</h2>
        <p class="card-desc">請輸入目前密碼及新密碼，密碼需至少 8 個字元。</p>

        <!-- 成功 -->
        <div v-if="success" class="alert alert-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          密碼修改成功！即將返回個人資料頁...
        </div>

        <!-- 錯誤 -->
        <div v-if="errorMsg" class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errorMsg }}
        </div>

        <form class="pw-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">目前密碼</label>
            <div class="input-wrap">
              <input
                v-model="form.current"
                :type="showCurrent ? 'text' : 'password'"
                class="form-input"
                placeholder="輸入目前的密碼"
                autocomplete="current-password"
                :disabled="loading || success"
              />
              <button type="button" class="eye-btn" @click="showCurrent = !showCurrent" tabindex="-1">
                <svg v-if="showCurrent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">新密碼</label>
            <div class="input-wrap">
              <input
                v-model="form.next"
                :type="showNext ? 'text' : 'password'"
                class="form-input"
                :class="{ 'input-error': form.next && form.next.length < 8 }"
                placeholder="至少 8 個字元"
                autocomplete="new-password"
                :disabled="loading || success"
              />
              <button type="button" class="eye-btn" @click="showNext = !showNext" tabindex="-1">
                <svg v-if="showNext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <p v-if="form.next && form.next.length < 8" class="field-hint error">密碼至少需要 8 個字元</p>
          </div>

          <div class="form-group">
            <label class="form-label">確認新密碼</label>
            <div class="input-wrap">
              <input
                v-model="form.confirm"
                :type="showConfirm ? 'text' : 'password'"
                class="form-input"
                :class="{ 'input-error': form.confirm && form.confirm !== form.next }"
                placeholder="再輸入一次新密碼"
                autocomplete="new-password"
                :disabled="loading || success"
              />
              <button type="button" class="eye-btn" @click="showConfirm = !showConfirm" tabindex="-1">
                <svg v-if="showConfirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <p v-if="form.confirm && form.confirm !== form.next" class="field-hint error">兩次密碼不一致</p>
          </div>

          <button type="submit" class="btn-submit" :disabled="loading || success">
            <div v-if="loading" class="btn-spinner" />
            {{ loading ? '更新中...' : '確認修改密碼' }}
          </button>
        </form>

      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router    = useRouter()
const authStore = useAuthStore()

const form = ref({ current: '', next: '', confirm: '' })
const loading    = ref(false)
const success    = ref(false)
const errorMsg   = ref('')
const showCurrent = ref(false)
const showNext    = ref(false)
const showConfirm = ref(false)

const handleSubmit = async () => {
  errorMsg.value = ''

  if (!form.value.current)                        { errorMsg.value = '請輸入目前密碼'; return }
  if (!form.value.next)                           { errorMsg.value = '請輸入新密碼'; return }
  if (form.value.next.length < 8)                 { errorMsg.value = '新密碼至少需要 8 個字元'; return }
  if (form.value.next !== form.value.confirm)     { errorMsg.value = '新密碼與確認密碼不一致'; return }

  loading.value = true
  const result = await authStore.updatePassword({
    currentPassword: form.value.current,
    newPassword:     form.value.next,
    confirmPassword: form.value.confirm,
  })
  loading.value = false

  if (result.success) {
    success.value = true
    setTimeout(() => router.push('/backend/profile'), 2000)
  } else {
    errorMsg.value = result.error || '密碼更新失敗，請稍後再試'
  }
}
</script>

<style scoped lang="scss">
.change-pw-wrap {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.change-pw-card {
  width: 100%;
  max-width: 460px;
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

// ── 提示 ──
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

// ── 表單 ──
.pw-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.input-wrap {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 10px 40px 10px 14px;
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

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  svg { width: 16px; height: 16px; }
  &:hover { color: #374151; }
}

.field-hint {
  font-size: 12px;
  margin: 0;
  &.error { color: #dc2626; }
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  margin-top: 4px;

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
