import { resolveForwardHost } from '../../utils/resolveForwardHost'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.apiBase) {
    return {
      statusCode: 500,
      data: [],
      error: {
        message: 'NUXT_API_BASE is not configured',
      },
    }
  }

  const slug        = getRouterParam(event, 'slug')
  const query       = getQuery(event)
  const host        = resolveForwardHost(event, config.devHost)
  const backendUrl  = `${config.apiBase}/api/web-site/page/${slug}`

  try {
    const res = await $fetch<{ statusCode: number; data: any[] }>(
      backendUrl,
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
    const backendStatusCode = e?.response?.status ?? e?.statusCode ?? e?.status ?? 500
    const backendData = e?.response?._data ?? e?.data ?? e?.response?.data ?? null

    console.error(`[/api/page/${slug}] fetch failed:`, {
      message: e?.message || String(e),
      backendUrl,
      backendStatusCode,
      backendData,
    })

    return {
      statusCode: backendStatusCode,
      data: [],
      error: {
        message: e?.message || String(e),
        backendUrl,
        backendStatusCode,
        backendData,
      },
    }
  }
})
