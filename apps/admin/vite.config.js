import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const rawPrefix = (env.VITE_URL_PREFIX || '').trim()
  const normalizedPrefix = rawPrefix
    ? `/${rawPrefix.replace(/^\/+|\/+$/g, '')}/`
    : '/'

  return {
    base: normalizedPrefix,
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@angke/ui': fileURLToPath(new URL('../../packages/ui', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://angke.com.tw',
          changeOrigin: true,
          cookieDomainRewrite: '',
          cookiePathRewrite: '/',
        },
      },
    },
  }
})
