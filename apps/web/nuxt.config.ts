// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,

  runtimeConfig: {
    // Server-only
    apiBase: '',      // NUXT_API_BASE — internal backend URL for SSR calls
    webSiteId: '',    // NUXT_WEB_SITE_ID — dev override (prod uses Hostname)
    devHost: '',      // NUXT_DEV_HOST — host to forward in dev (e.g. angke.com.tw)
    public: {
      // Exposed to client (needs CORS)
      apiBase: '',    // NUXT_PUBLIC_API_BASE
      webSiteId: '',  // NUXT_PUBLIC_WEB_SITE_ID — same dev override for client-side nav
      defaultLocale: 'zh-tw',
      defaultSlug: 'home',
      loginUrl: '',     // NUXT_PUBLIC_LOGIN_URL
    },
  },

})
