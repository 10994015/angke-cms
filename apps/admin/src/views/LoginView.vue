<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { GoogleSignInButton } from 'vue3-google-signin'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginForm = ref({ credential: '', password: '' })
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const errorMsg = ref('')
const googleSignInButton = ref(null)

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
    if (url.origin === window.location.origin) {
      window.location.href = target
    } else {
      router.push('/dashboard')
    }
  } catch {
    router.push(target)
  }
}

const triggerGoogleLogin = () => {
  if (isGoogleLoading.value || isLoading.value) return
  const googleBtn = googleSignInButton.value?.$el?.querySelector('div[role="button"]')
  googleBtn?.click()
}

const handleGoogleSuccess = async (response) => {
  isGoogleLoading.value = true
  errorMsg.value = ''
  try {
    const result = await authStore.googleLogin(response.credential)
    if (result.success) {
      if (result.statusCode === 202) {
        alert(result.data.firstLogin ? '首次登入需重設密碼！' : '密碼已過期，請重新設定密碼！')
        router.push(`/init-password/${result.data.changePwToken}`)
        return
      }
      afterLogin()
    } else {
      errorMsg.value = result.error || 'Google 登入失敗，請稍後再試'
    }
  } catch {
    errorMsg.value = 'Google 登入失敗，請稍後再試'
  } finally {
    isGoogleLoading.value = false
  }
}

const handleGoogleError = () => {
  errorMsg.value = 'Google 登入失敗，請稍後再試'
  isGoogleLoading.value = false
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
        <p>© 2025 昂科 CMS. All rights reserved.</p>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="form-panel">
      <div class="form-container">
        <div class="form-header">
          <h1 class="form-title">登入後台</h1>
          <p class="form-subtitle">輸入您的帳號與密碼以繼續</p>
        </div>

        <!-- Google login -->
        <button
          class="btn-google"
          @click="triggerGoogleLogin"
          :disabled="isGoogleLoading || isLoading"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ isGoogleLoading ? '登入中...' : '使用 Google 帳號登入' }}
        </button>

        <div style="display: none">
          <GoogleSignInButton
            ref="googleSignInButton"
            @success="handleGoogleSuccess"
            @error="handleGoogleError"
          />
        </div>

        <div class="divider"><span>或使用帳號密碼</span></div>

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
          :disabled="isLoading || isGoogleLoading"
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

/* ===== Google Button ===== */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* ===== Divider ===== */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: #9ca3af;
  font-size: 12px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
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
    background: #d04a20;
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
