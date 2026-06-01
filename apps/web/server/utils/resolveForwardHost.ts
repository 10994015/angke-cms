import { getHeader, type H3Event } from 'h3'

export function resolveForwardHost(event: H3Event, hostOverride?: string) {
  const override = hostOverride?.trim()
  if (override) return override

  const forwardedHost = getHeader(event, 'x-forwarded-host') || ''
  const host = getHeader(event, 'host') || ''
  return (forwardedHost || host).split(',')[0].trim()
}

export function resolveDomain(event: H3Event, hostOverride?: string) {
  const host = resolveForwardHost(event, hostOverride)
  return host.split(':')[0].trim().toLowerCase()
}
