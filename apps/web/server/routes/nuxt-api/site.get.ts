import { resolveForwardHost } from '../../utils/resolveForwardHost'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.apiBase) return null

  const host = resolveForwardHost(event, config.devHost)

  try {
    const res = await $fetch<{ statusCode: number; data: Record<string, any> }>(
      `${config.apiBase}/api/web-site/`,
      {
        headers: { host },
        params: config.webSiteId ? { webSiteId: config.webSiteId } : undefined,
        timeout: 10000,
      }
    )
    if (res?.statusCode === 200 && res?.data) return res.data
  } catch (e) {
    console.error('[/nuxt-api/site] fetch failed:', e)
  }

  return null
})
