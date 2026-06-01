import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isHandling401 = false
let onUnauthorized = null

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

export const resetHandling401 = () => {
  isHandling401 = false
}

axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (isHandling401) return Promise.reject(error)
      isHandling401 = true

      const currentPath = window.location.pathname
      const publicPages = ['/backend/login', '/backend/forgot-password', '/backend/init-password']
      const isPublicPage = publicPages.some((page) => currentPath.startsWith(page))

      if (isPublicPage) {
        isHandling401 = false
        return Promise.reject(error)
      }

      if (onUnauthorized) {
        onUnauthorized()
      } else {
        window.location.href = '/backend/login'
      }
    }

    return Promise.reject(error)
  },
)

export default axiosClient

export const get = (url, config) => axiosClient.get(url, config)
export const post = (url, data, config) => axiosClient.post(url, data, config)
export const put = (url, data, config) => axiosClient.put(url, data, config)
export const del = (url, config) => axiosClient.delete(url, config)
export const patch = (url, data, config) => axiosClient.patch(url, data, config)
