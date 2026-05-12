import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient, { resetHandling401 } from '../axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const systemPermissions = ref([])
  const templeRoles = ref([])
  const hasDesignerPermission = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  // ==================== 權限檢查 ====================

  const hasSystemPermission = (permissionName, mode = 'Readonly') => {
    if (!systemPermissions.value?.length) return false
    const permission = systemPermissions.value.find((p) => p.permissionName === permissionName)
    if (!permission) return false
    if (mode === 'Readonly' || mode === 'readonly') {
      return permission.mode === 'Readonly' || permission.mode === 'FULL'
    }
    if (mode === 'Full' || mode === 'FULL') {
      return permission.mode === 'FULL'
    }
    return false
  }

  const hasTemplePermission = (templeId, permissionName, mode = 'Readonly') => {
    if (!templeRoles.value?.length) return false
    const temple = templeRoles.value.find((t) => t.tenantId === templeId)
    if (!temple) return false
    const permission = temple.permissions.find((p) => p.permissionName === permissionName)
    if (!permission) return false
    if (mode === 'Readonly' || mode === 'readonly') {
      return permission.mode === 'Readonly' || permission.mode === 'FULL'
    }
    if (mode === 'Full' || mode === 'FULL') {
      return permission.mode === 'FULL'
    }
    return false
  }

  const hasPermission = (permissionName, mode = 'Readonly') =>
    hasSystemPermission(permissionName, mode)

  const canAccessPage = (permissionName) =>
    hasSystemPermission(permissionName, 'Readonly') || hasSystemPermission(permissionName, 'FULL')

  const canModify = (permissionName) => hasSystemPermission(permissionName, 'FULL')

  // ==================== SHA256 ====================

  async function hashSHA256(message) {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  // ==================== 認證 ====================

  const forceLogout = (message = '登入憑證已過期，請重新登入') => {
    user.value = null
    systemPermissions.value = []
    templeRoles.value = []
    hasDesignerPermission.value = false
    isInitialized.value = false
    if (message) console.warn(message)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const login = async (credentials) => {
    try {
      credentials.password = await hashSHA256(credentials.password)
      const response = await axiosClient.post('/login', credentials)

      if (response.status === 202) {
        return { success: true, data: response.data.data, statusCode: response.status }
      }

      if (response.status === 200) {
        const data = response.data.data
        user.value = { userId: data.userId, name: data.name }
        systemPermissions.value = data.systemPermissions || []
        templeRoles.value = data.tenantRoles || []
        hasDesignerPermission.value = !!data.hasDesignerPermission
        isInitialized.value = true
        resetHandling401()
        return { success: true, statusCode: response.status, data }
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status
        const responseData = error.response.data
        const message = responseData?.message

        switch (statusCode) {
          case 401:
            return { success: false, error: message || '帳號或密碼錯誤', statusCode }
          case 403:
            if (responseData.data?.status === 'LOCK') {
              const lockedUntil = responseData.data?.lockedUntil
              return {
                success: false,
                error: `${message}！帳號已被鎖定${lockedUntil ? `至 ${formatDateTime(lockedUntil)}` : ''}`,
                statusCode,
                data: responseData.data,
              }
            }
            return {
              success: false,
              error: message || '帳號狀態異常，請聯繫管理員',
              statusCode,
              data: responseData.data,
            }
          case 407:
            return { success: false, error: message || '帳號未審核', statusCode }
          default:
            return { success: false, error: message || `伺服器錯誤 (${statusCode})`, statusCode }
        }
      } else if (error.request) {
        return { success: false, error: '網路連線錯誤，請檢查網路狀態', statusCode: 500 }
      } else {
        return { success: false, error: error.message || '未知錯誤', statusCode: 500 }
      }
    }
  }

  const googleLogin = async (credential) => {
    try {
      const response = await axiosClient.post('/login/google', { token: credential })

      if (response.status === 202) {
        return { success: true, data: response.data.data, statusCode: response.status }
      }

      if (response.status === 200) {
        const data = response.data.data
        user.value = { userId: data.userId, name: data.name }
        systemPermissions.value = data.systemPermissions || []
        templeRoles.value = data.tenantRoles || []
        hasDesignerPermission.value = !!data.hasDesignerPermission
        isInitialized.value = true
        resetHandling401()
        return { success: true, statusCode: response.status, data }
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status
        const message = error.response.data?.message
        switch (statusCode) {
          case 401:
            return { success: false, error: message || 'Google 登入驗證失敗', statusCode }
          case 407:
            return { success: false, error: message || '帳號未審核', statusCode }
          default:
            return { success: false, error: message || `伺服器錯誤 (${statusCode})`, statusCode }
        }
      } else if (error.request) {
        return { success: false, error: '網路連線錯誤，請檢查網路狀態', statusCode: 500 }
      } else {
        return { success: false, error: error.message || '未知錯誤', statusCode: 500 }
      }
    }
  }

  const fetchUserPermissions = async () => {
    try {
      const response = await axiosClient.get('/frontend/user/permission')
      if (response.status === 200 && response.data.data) {
        const data = response.data.data
        systemPermissions.value = data.systemPermissions || []
        return { systemPermissions: systemPermissions.value }
      }
      return { systemPermissions: [] }
    } catch (error) {
      throw error
    }
  }

  const fetchUser = async () => {
    try {
      const response = await axiosClient.get('/frontend/user')
      if (response.status === 200 && response.data.data) {
        const data = response.data.data
        user.value = {
          userId: data.id,
          credential: data.credential,
          name: data.name,
          email: data.email,
          gender: data.gender,
          status: data.status,
          birthDate: data.birthDate,
          phone: data.phone,
          address: data.address,
          identificationNumber: data.identificationNumber,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }
        await fetchUserPermissions()
        return user.value
      }
    } catch (error) {
      user.value = null
      systemPermissions.value = []
      templeRoles.value = []
      throw error
    }
  }

  const checkAuth = async () => {
    if (isInitialized.value) return isAuthenticated.value
    isLoading.value = true
    try {
      await fetchUser()
      return true
    } catch (error) {
      user.value = null
      systemPermissions.value = []
      templeRoles.value = []
      return false
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const logout = async () => {
    try {
      await axiosClient.post('/login/out')
    } catch (error) {
      console.error('登出請求失敗:', error)
    } finally {
      user.value = null
      systemPermissions.value = []
      templeRoles.value = []
      hasDesignerPermission.value = false
      isInitialized.value = false
      return true
    }
  }

  const changePassword = async ({ certificationId, password, confirmPassword }) => {
    try {
      const response = await axiosClient.patch('/user/change-password', {
        certificationId,
        password: await hashSHA256(password),
        confirmPassword: await hashSHA256(confirmPassword),
      })
      if (response.status === 200) return { success: true }
      return { success: false, error: response.data?.message || '密碼變更失敗' }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || '密碼變更失敗，請稍後再試' }
    }
  }

  const updatePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    try {
      if (newPassword !== confirmPassword)
        return { success: false, error: '新密碼和確認密碼不一致' }
      const response = await axiosClient.patch('/frontend/user/change-password', {
        originalPassword: await hashSHA256(currentPassword),
        password: await hashSHA256(newPassword),
        confirmPassword: await hashSHA256(confirmPassword),
      })
      if (response.status === 200) return { success: true, response }
      return { success: false, error: response.data?.message || '密碼更新失敗' }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || '密碼更新失敗，請稍後再試' }
    }
  }

  const updateProfile = async (payload) => {
    try {
      const response = await axiosClient.patch('/frontend/user', payload)
      if (response.status === 200 && response.data.data) {
        const data = response.data.data
        user.value = {
          ...user.value,
          name:                 data.name,
          email:                data.email,
          gender:               data.gender,
          birthDate:            data.birthDate,
          phone:                data.phone,
          address:              data.address,
          identificationNumber: data.identificationNumber,
          updatedAt:            data.updatedAt,
        }
        return { success: true }
      }
      return { success: false, error: response.data?.message || '更新失敗' }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || '更新失敗，請稍後再試' }
    }
  }

  const sendResetPasswordEmail = async (email) => {
    try {
      const response = await axiosClient.post('/user/change-password', { email })
      if (response.status === 202 || response.status === 200) return { success: true }
      return { success: false, error: response.data?.message || '發送失敗' }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || '發送失敗，請稍後再試',
      }
    }
  }

  return {
    user: computed(() => user.value),
    systemPermissions: computed(() => systemPermissions.value),
    templeRoles: computed(() => templeRoles.value),
    hasDesignerPermission: computed(() => hasDesignerPermission.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    isInitialized: computed(() => isInitialized.value),

    hasPermission,
    hasSystemPermission,
    hasTemplePermission,
    canAccessPage,
    canModify,

    login,
    googleLogin,
    logout,
    checkAuth,
    fetchUser,
    fetchUserPermissions,
    forceLogout,

    changePassword,
    updatePassword,
    updateProfile,
    sendResetPasswordEmail,
  }
})
