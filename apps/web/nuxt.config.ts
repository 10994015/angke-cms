import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  experimental: {
    emitRouteChunkError: 'automatic',
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // 全站可選字型（與 apps/admin/index.html 一致），實際套用由網站設定 + 語系決定
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bona+Nova:wght@400;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+TC:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=LXGW+WenKai+Mono+TC&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+SC:wght@400;600&display=swap' },
      ],
    },
  },

  vite: {
    server: {
      allowedHosts: ['angke.com.tw'],
    },
    resolve: {
      alias: {
        '@angke/ui': fileURLToPath(new URL('../../packages/ui', import.meta.url)),
      },
    },
  },

  runtimeConfig: {
    // Server-only
    apiBase: process.env.NUXT_API_BASE || '',      // NUXT_API_BASE — internal backend URL for SSR calls
    webSiteId: process.env.NUXT_WEB_SITE_ID || '', // NUXT_WEB_SITE_ID — dev override (prod uses Hostname)
    devHost: process.env.NUXT_DEV_HOST || '',      // NUXT_DEV_HOST — forwarded host override (dev/proxy fallback)
    public: {
      // Exposed to client (needs CORS)
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',    // NUXT_PUBLIC_API_BASE
      webSiteId: process.env.NUXT_PUBLIC_WEB_SITE_ID || '',  // NUXT_PUBLIC_WEB_SITE_ID — same dev override for client-side nav
      defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LOCALE || 'zh-tw',
      defaultSlug: process.env.NUXT_PUBLIC_DEFAULT_SLUG || 'home',
      loginUrl: process.env.NUXT_PUBLIC_LOGIN_URL || '',     // NUXT_PUBLIC_LOGIN_URL
    },
  },

})
