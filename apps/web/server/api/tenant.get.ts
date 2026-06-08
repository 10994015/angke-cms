import { resolveDomain } from '../utils/resolveForwardHost'

// Resolves tenantId from the incoming request's host header.
// Calls the backend's domain-lookup endpoint; falls back to NUXT_TENANT_ID env var.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const domain = resolveDomain(event, config.devHost)

  if (config.apiBase && domain) {
    try {
      const res = await $fetch<{ statusCode: number; data?: { tenantId?: string }; tenantId?: string }>(
        `${config.apiBase}/api/frontend/web-site/by-domain`,
        { params: { domain } }
      )
      const tenantId = res?.data?.tenantId || (res as any)?.tenantId
      if (tenantId) return { tenantId }
    } catch {
      // fall through to env fallback
    }
  }

  return { tenantId: config.tenantId || null }
})
