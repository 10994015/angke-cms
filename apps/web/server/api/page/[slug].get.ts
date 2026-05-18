export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.apiBase) return { statusCode: 404, data: [] }

  const slug  = getRouterParam(event, 'slug')
  const query = getQuery(event)

  try {
    const res = await $fetch<{ statusCode: number; data: any[] }>(
      `${config.apiBase}/api/web-site/page/${slug}`,
      {
        params: {
          locale: query.locale,
          ...(query.webSiteId ? { webSiteId: query.webSiteId } : {}),
        },
        timeout: 10000,
      }
    )
    return res
  } catch (e) {
    console.error(`[/api/page/${slug}] fetch failed:`, e)
  }

  return { statusCode: 404, data: [] }
})
