<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSubmit = async () => {
  if (!email.value) { errorMsg.value = '請輸入電子郵件'; return }

  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const result = await authStore.sendResetPasswordEmail(email.value)
    if (result.success) {
      successMsg.value = '重設密碼信已發送，請檢查您的信箱'
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
      <p class="subtitle">輸入您的帳號電子郵件，我們將發送重設密碼連結</p>

      <div class="form-field">
        <label class="form-label">電子郵件</label>
        <input v-model="email" type="email" class="form-input" placeholder="請輸入電子郵件" @keydown.enter="handleSubmit" />
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

      <button class="btn-submit" @click="handleSubmit" :disabled="isLoading">
        {{ isLoading ? '發送中...' : '發送重設連結' }}
      </button>

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
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
.title { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0 0 24px; }
.form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-label { font-size: 13px; font-weight: 500; color: #374151; }
.form-input {
  height: 40px; padding: 0 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; font-family: inherit; outline: none;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(232,87,42,0.1); }
}
.error-msg { color: #dc2626; font-size: 13px; margin: 0 0 12px; }
.success-msg { color: #059669; font-size: 13px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 8px 12px; margin: 0 0 12px; }
.btn-submit {
  width: 100%; padding: 11px; background: #0891B2; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  &:hover:not(:disabled) { background: #d04a20; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
.back-link {
  display: block; text-align: center; margin-top: 16px; font-size: 13px;
  color: #6b7280; cursor: pointer;
  &:hover { color: #0891B2; }
}
</style>
