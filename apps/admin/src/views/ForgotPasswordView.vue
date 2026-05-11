<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const email      = ref('')
const isLoading  = ref(false)
const errorMsg   = ref('')
const sent       = ref(false)

const handleSubmit = async () => {
  if (!email.value.trim()) { errorMsg.value = '請輸入電子郵件'; return }
  isLoading.value = true
  errorMsg.value  = ''
  try {
    const result = await authStore.sendResetPasswordEmail(email.value.trim())
    if (result.success) {
      sent.value = true
    } else {
      errorMsg.value = result.error || '發送失敗，請稍後再試'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="title">忘記密碼</h1>
      <p class="subtitle">輸入帳號電子郵件，系統將發送重設密碼連結</p>

      <template v-if="!sent">
        <div class="form-field">
          <label class="form-label">電子郵件</label>
          <input v-model="email" type="email" class="form-input" placeholder="請輸入電子郵件"
            :disabled="isLoading" @keydown.enter="handleSubmit" autofocus />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button class="btn-submit" @click="handleSubmit" :disabled="isLoading">
          {{ isLoading ? '發送中...' : '發送重設連結' }}
        </button>
      </template>

      <div v-else class="success-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" width="36" height="36">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="success-title">信件已發送！</p>
        <p class="success-desc">請前往 <strong>{{ email }}</strong> 查收重設密碼信件，連結有效期限為 15 分鐘。</p>
        <button class="btn-resend" @click="sent = false; email = ''">重新發送</button>
      </div>

      <a class="back-link" @click="router.push('/login')">← 返回登入</a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans TC', system-ui, sans-serif;
  padding: 24px;
}
.card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.title   { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0 0 24px; }
.form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-label { font-size: 13px; font-weight: 500; color: #374151; }
.form-input {
  height: 40px; padding: 0 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; font-family: inherit; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8,145,178,0.1); }
  &:disabled { background: #f9fafb; color: #9ca3af; }
  &::placeholder { color: #9ca3af; }
}
.error-msg { color: #dc2626; font-size: 13px; margin: 0 0 12px; }
.btn-submit {
  width: 100%; padding: 11px; background: #0891B2; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.success-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 16px 0 8px;
}
.success-title { font-size: 16px; font-weight: 700; color: #059669; margin: 0; }
.success-desc  { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
.btn-resend {
  margin-top: 4px;
  padding: 7px 18px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f3f4f6; }
}

.back-link {
  display: block; text-align: center; margin-top: 20px; font-size: 13px;
  color: #6b7280; cursor: pointer;
  &:hover { color: #0891B2; }
}
</style>
