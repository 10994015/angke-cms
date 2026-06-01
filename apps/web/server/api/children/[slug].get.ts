import { resolveForwardHost } from '../../utils/resolveForwardHost'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.apiBase) return { statusCode: 200, data: [] }

  const slug        = getRouterParam(event, 'slug')
  const query       = getQuery(event)
  const host        = resolveForwardHost(event, config.devHost)

  try {
    const res = await $fetch<{ statusCode: number; data: any[] }>(
      `${config.apiBase}/web-site/page/${slug}/children`,
      {
        headers: { host },
        params: {
          locale: query.locale,
          ...(query.webSiteId ? { webSiteId: query.webSiteId } : {}),
        },
        timeout: 8000,
      }
    )
    console.log(`[/api/children/${slug}] statusCode=${res?.statusCode} count=${res?.data?.length}`)
    return res
  } catch (e: any) {
    console.error(`[/api/children/${slug}] fetch failed:`, e?.message || e)
  }

  return { statusCode: 200, data: [] }
})
