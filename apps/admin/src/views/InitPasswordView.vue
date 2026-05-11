<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

const password        = ref('')
const confirmPassword = ref('')
const isLoading       = ref(false)
const errorMsg        = ref('')
const showPw          = ref(false)
const showConfirmPw   = ref(false)

// 密碼強度規則：數字、大寫、小寫、特殊符號、8~20碼
const rules = computed(() => [
  { label: '8~20 個字元',   ok: password.value.length >= 8 && password.value.length <= 20 },
  { label: '包含數字',       ok: /[0-9]/.test(password.value) },
  { label: '包含英文大寫',   ok: /[A-Z]/.test(password.value) },
  { label: '包含英文小寫',   ok: /[a-z]/.test(password.value) },
  { label: '包含特殊符號',   ok: /[^A-Za-z0-9]/.test(password.value) },
])
const allRulesPass = computed(() => rules.value.every(r => r.ok))

const handleSubmit = async () => {
  errorMsg.value = ''
  if (!password.value)        { errorMsg.value = '請輸入新密碼'; return }
  if (!allRulesPass.value)    { errorMsg.value = '密碼不符合強度要求'; return }
  if (password.value !== confirmPassword.value) { errorMsg.value = '兩次密碼不一致'; return }

  isLoading.value = true
  try {
    const result = await authStore.changePassword({
      certificationId: route.params.token,
      password:        password.value,
      confirmPassword: confirmPassword.value,
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
      <p class="subtitle">請輸入符合強度要求的新密碼</p>

      <div class="form-field">
        <label class="form-label">新密碼</label>
        <div class="input-wrap">
          <input v-model="password" :type="showPw ? 'text' : 'password'" class="form-input"
            placeholder="請輸入新密碼" :disabled="isLoading" @keydown.enter="handleSubmit" autofocus />
          <button type="button" class="eye-btn" @click="showPw = !showPw" tabindex="-1">
            <svg v-if="showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 密碼強度指示 -->
      <div v-if="password" class="rules-list">
        <div v-for="rule in rules" :key="rule.label" class="rule-item" :class="{ pass: rule.ok }">
          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
            <path v-if="rule.ok" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
            <circle v-else cx="8" cy="8" r="3"/>
          </svg>
          {{ rule.label }}
        </div>
      </div>

      <div class="form-field">
        <label class="form-label">確認新密碼</label>
        <div class="input-wrap">
          <input v-model="confirmPassword" :type="showConfirmPw ? 'text' : 'password'" class="form-input"
            placeholder="請再輸入一次" :disabled="isLoading" @keydown.enter="handleSubmit" />
          <button type="button" class="eye-btn" @click="showConfirmPw = !showConfirmPw" tabindex="-1">
            <svg v-if="showConfirmPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
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
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.title   { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0 0 24px; }
.form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-label { font-size: 13px; font-weight: 500; color: #374151; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.form-input {
  height: 40px; padding: 0 36px 0 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; font-family: inherit; outline: none; width: 100%;
  box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8,145,178,0.1); }
  &:disabled { background: #f9fafb; color: #9ca3af; }
  &::placeholder { color: #9ca3af; }
}
.eye-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  display: flex;
  align-items: center;
  &:hover { color: #374151; }
}

.rules-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin: -6px 0 14px;
}
.rule-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.15s;
  &.pass { color: #059669; }
}

.error-msg { color: #dc2626; font-size: 13px; margin: 0 0 12px; }
.btn-submit {
  width: 100%; padding: 11px; background: #0891B2; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>
