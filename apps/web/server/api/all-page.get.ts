import { resolveForwardHost } from '../utils/resolveForwardHost'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.apiBase) return { statusCode: 200, data: [] }

  const query       = getQuery(event)
  const host        = resolveForwardHost(event, config.devHost)

  try {
    const res = await $fetch<{ statusCode: number; data: any[] }>(
      `${config.apiBase}/web-site/all-page`,
      {
        headers: { host },
        params: {
          locale: query.locale,
          ...(query.webSiteId ? { webSiteId: query.webSiteId } : {}),
        },
        timeout: 10000,
      }
    )
    console.log(`[/api/all-page] statusCode=${res?.statusCode} count=${res?.data?.length}`)
    return res
  } catch (e: any) {
    console.error('[/api/all-page] fetch failed:', e?.message || e)
  }

  return { statusCode: 200, data: [] }
})
