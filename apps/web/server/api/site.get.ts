import { resolveForwardHost } from '../utils/resolveForwardHost'

// Resolves web-site data using /api/web-site/
// Production: backend resolves by the Host header (Hostname)
// Development: NUXT_DEV_HOST overrides the forwarded host (e.g. angke.com.tw)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.apiBase) return null

  const host = resolveForwardHost(event, config.devHost)

  try {
    const res = await $fetch<{ statusCode: number; data: Record<string, any> }>(
      `${config.apiBase}/web-site/`,
      {
        headers: { host },
        params: config.webSiteId ? { webSiteId: config.webSiteId } : undefined,
        timeout: 10000,
      }
    )
    if (res?.statusCode === 200 && res?.data) return res.data
  } catch (e) {
    console.error('[/api/site] fetch failed:', e)
  }

  return null
})
