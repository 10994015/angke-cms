import { resolveForwardHost } from '../../../utils/resolveForwardHost'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.apiBase) return { statusCode: 404, data: [] }

  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)
  const host = resolveForwardHost(event, config.devHost)

  try {
    const res = await $fetch<{ statusCode: number; data: any[] }>(
      `${config.apiBase}/api/web-site/page/${slug}`,
      {
        headers: { host },
        params: {
          locale: query.locale,
          ...(query.webSiteId ? { webSiteId: query.webSiteId } : {}),
        },
        timeout: 10000,
      }
    )
    return res
  } catch (e: any) {
    console.error(`[/nuxt-api/page/${slug}] fetch failed:`, e?.message || e)
  }

  return { statusCode: 404, data: [] }
})
