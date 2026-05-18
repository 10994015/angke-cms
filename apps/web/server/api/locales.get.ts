export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.apiBase) return null

  const query = getQuery(event)

  try {
    const res = await $fetch<{ statusCode: number; data: any[] }>(
      `${config.apiBase}/api/web-site/locale`,
      {
        params: query.webSiteId ? { webSiteId: query.webSiteId } : undefined,
        timeout: 10000,
      }
    )
    if (res?.statusCode === 200) return res
  } catch (e) {
    console.error('[/api/locales] fetch failed:', e)
  }

  return { statusCode: 200, data: [] }
})
