<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginForm = ref({ credential: '', password: '' })
const isLoading = ref(false)
const errorMsg = ref('')

const getRedirectTarget = () => {
  const redirect = route.query.redirect
  if (redirect) {
    try {
      const url = new URL(redirect)
      if (url.origin === window.location.origin) return redirect
    } catch {
      return redirect
    }
  }
  return '/dashboard'
}

const afterLogin = () => {
  const target = getRedirectTarget()
  try {
    const url = new URL(target)
    if (url.origin !== window.location.origin) {
      router.push('/dashboard')
      return
    }
  } catch {
    // Relative path — safe to push directly
  }
  router.push(target)
}

const handleLogin = async () => {
  if (!loginForm.value.credential) { errorMsg.value = '請輸入帳號'; return }
  if (!loginForm.value.password) { errorMsg.value = '請輸入密碼'; return }

  isLoading.value = true
  errorMsg.value = ''
  try {
    const result = await authStore.login({
      credential: loginForm.value.credential,
      password: loginForm.value.password,
    })
    if (result.success) {
      if (result.statusCode === 202) {
        alert(result.data.firstLogin ? '首次登入需重設密碼！' : '密碼已過期，請重新設定密碼！')
        router.push(`/init-password/${result.data.changePwToken}`)
        return
      }
      afterLogin()
    } else {
      errorMsg.value = result.error || '登入失敗，請檢查帳號或密碼'
    }
  } catch {
    errorMsg.value = '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Left brand panel -->
    <div class="brand-panel">
      <div class="brand-content">
        <img src="/images/logo.png" alt="Logo" class="brand-logo" />
        <h2 class="brand-title">Angke On Prem</h2>
        <p class="brand-desc">後台管理系統</p>
      </div>
      <div class="brand-footer">
        <p>© 2025 Angke On Prem. All rights reserved.</p>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="form-panel">
      <div class="form-container">
        <div class="form-header">
          <h1 class="form-title">登入後台</h1>
          <p class="form-subtitle">輸入您的帳號與密碼以繼續</p>
        </div>

        <!-- Form -->
        <div class="form-field">
          <label class="form-label">帳號</label>
          <input
            v-model="loginForm.credential"
            type="text"
            class="form-input"
            placeholder="請輸入帳號"
            autocomplete="username"
            @keydown.enter="handleLogin"
          />
        </div>

        <div class="form-field">
          <div class="label-row">
            <label class="form-label">密碼</label>
            <a class="forgot-link" @click="router.push('/forgot-password')">忘記密碼？</a>
          </div>
          <input
            v-model="loginForm.password"
            type="password"
            class="form-input"
            placeholder="請輸入密碼"
            autocomplete="current-password"
            @keydown.enter="handleLogin"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="flex-shrink:0">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          {{ errorMsg }}
        </p>

        <button
          class="btn-login"
          @click="handleLogin"
          :disabled="isLoading"
        >
          <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24" fill="none" width="16" height="16">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40" stroke-dashoffset="15"/>
          </svg>
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  font-family: 'Noto Sans TC', system-ui, sans-serif;
}

/* ===== Left Panel ===== */
.brand-panel {
  width: 380px;
  flex-shrink: 0;
  background: #1f2937;
  display: flex;
  flex-direction: column;
  padding: 48px 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 40%, rgba(8, 145, 178, 0.25) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 80%, rgba(8, 145, 178, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
}

.brand-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.brand-logo {
  height: 56px;
  object-fit: contain;
  margin-bottom: 24px;
  filter: brightness(0) invert(1);
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.brand-desc {
  font-size: 15px;
  color: #9ca3af;
  margin: 0;
}

.brand-footer {
  position: relative;
  p {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }
}

/* ===== Right Panel ===== */
.form-panel {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.form-header {
  margin-bottom: 28px;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
}

.form-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* ===== Form ===== */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #0891B2;
    box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
}

.forgot-link {
  font-size: 12px;
  color: #0891B2;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

/* ===== Error ===== */
.error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #dc2626;
  font-size: 13px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0 0 12px;
}

/* ===== Login Button ===== */
.btn-login {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  margin-top: 6px;

  &:hover:not(:disabled) {
    background: #0E7490;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 0.8s linear infinite;
}
</style>
