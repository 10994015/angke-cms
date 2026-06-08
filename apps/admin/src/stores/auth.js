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
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
      0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
      0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
      0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
      0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
      0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
      0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
      0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
      0xc67178f2,
    ]

    const H = [
      0x6a09e667,
      0xbb67ae85,
      0x3c6ef372,
      0xa54ff53a,
      0x510e527f,
      0x9b05688c,
      0x1f83d9ab,
      0x5be0cd19,
    ]

    const rightRotate = (x, n) => (x >>> n) | (x << (32 - n))
    const encoder = new TextEncoder()
    const bytes = Array.from(encoder.encode(String(message ?? '')))

    const bitLength = bytes.length * 8
    bytes.push(0x80)
    while ((bytes.length % 64) !== 56) bytes.push(0x00)

    const high = Math.floor(bitLength / 0x100000000)
    const low = bitLength >>> 0

    bytes.push((high >>> 24) & 0xff)
    bytes.push((high >>> 16) & 0xff)
    bytes.push((high >>> 8) & 0xff)
    bytes.push(high & 0xff)
    bytes.push((low >>> 24) & 0xff)
    bytes.push((low >>> 16) & 0xff)
    bytes.push((low >>> 8) & 0xff)
    bytes.push(low & 0xff)

    for (let i = 0; i < bytes.length; i += 64) {
      const w = new Array(64)

      for (let t = 0; t < 16; t++) {
        const j = i + t * 4
        w[t] =
          ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0
      }

      for (let t = 16; t < 64; t++) {
        const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3)
        const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10)
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0
      }

      let a = H[0]
      let b = H[1]
      let c = H[2]
      let d = H[3]
      let e = H[4]
      let f = H[5]
      let g = H[6]
      let h = H[7]

      for (let t = 0; t < 64; t++) {
        const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
        const ch = (e & f) ^ (~e & g)
        const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0
        const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
        const maj = (a & b) ^ (a & c) ^ (b & c)
        const temp2 = (S0 + maj) >>> 0

        h = g
        g = f
        f = e
        e = (d + temp1) >>> 0
        d = c
        c = b
        b = a
        a = (temp1 + temp2) >>> 0
      }

      H[0] = (H[0] + a) >>> 0
      H[1] = (H[1] + b) >>> 0
      H[2] = (H[2] + c) >>> 0
      H[3] = (H[3] + d) >>> 0
      H[4] = (H[4] + e) >>> 0
      H[5] = (H[5] + f) >>> 0
      H[6] = (H[6] + g) >>> 0
      H[7] = (H[7] + h) >>> 0
    }

    return H.map((n) => n.toString(16).padStart(8, '0')).join('')
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
