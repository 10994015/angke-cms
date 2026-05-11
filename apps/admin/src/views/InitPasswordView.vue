<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({ password: '', confirmPassword: '' })
const isLoading = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  if (!form.value.password) { errorMsg.value = '請輸入新密碼'; return }
  if (form.value.password !== form.value.confirmPassword) { errorMsg.value = '兩次密碼不一致'; return }

  isLoading.value = true
  errorMsg.value = ''
  try {
    const result = await authStore.changePassword({
      certificationId: route.params.token,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
    })
    if (result.success) {
      alert('密碼設定成功，請重新登入')
      router.push('/login')
    } else {
      errorMsg.value = result.error || '設定失敗，請稍後再試'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="title">設定新密碼</h1>
      <p class="subtitle">請輸入您的新密碼</p>

      <div class="form-field">
        <label class="form-label">新密碼</label>
        <input v-model="form.password" type="password" class="form-input" placeholder="請輸入新密碼" @keydown.enter="handleSubmit" />
      </div>
      <div class="form-field">
        <label class="form-label">確認新密碼</label>
        <input v-model="form.confirmPassword" type="password" class="form-input" placeholder="請再輸入一次" @keydown.enter="handleSubmit" />
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="btn-submit" @click="handleSubmit" :disabled="isLoading">
        {{ isLoading ? '設定中...' : '確認設定' }}
      </button>
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
.btn-submit {
  width: 100%; padding: 11px; background: #0891B2; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  &:hover:not(:disabled) { background: #d04a20; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>
