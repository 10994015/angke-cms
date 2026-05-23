<template>
  <div class="site-page">
    <!-- Loading -->
    <div v-if="pending" class="site-loading">
      <div class="site-spinner" />
    </div>

    <!-- Not found -->
    <div v-else-if="!siteData" class="site-error">
      <p>找不到網站</p>
    </div>

    <!-- Page content -->
    <template v-else>
      <template v-for="(basemap, bi) in basemaps" :key="bi">
        <div class="basemap-block" :style="getBasemapStyle(basemap)">
          <template v-for="(frame, fi) in (basemap.frames || [])" :key="fi">

            <!-- Header -->
            <SiteNavbar
              v-if="isHeaderFrame(frame)"
              :frame-data="frame.data || {}"
              :basemap-bg="{
                desktop: basemap.bgPcImgSrc    || null,
                tablet:  basemap.bgTabletImgSrc || null,
                mobile:  basemap.bgPhoneImgSrc  || null,
              }"
              :current-locale="locale"
              :locales="locales"
              :tabs="visibleTabs"
              :current-slug="slug"
              :page-tree="pageTree"
            />

            <!-- Footer -->
            <SiteFooter
              v-else-if="isFooterFrame(frame)"
              :frame-data="frame.data || {}"
              :tabs="visibleTabs"
            />

            <!-- Carousel wall -->
            <SiteCarouselWall
              v-else-if="frame.type === 'CAROUSEL_WALL'"
              :frame-data="frame.data || {}"
            />

            <!-- Hero banner -->
            <SiteHeroBanner
              v-else-if="frame.type === 'FIRST_PICTURE'"
              :frame-data="frame.data || {}"
            />

            <!-- Custom content frame -->
            <SiteCustomFrame
              v-else-if="frame.type?.startsWith('FRAME')"
              :frame="frame"
            />

          </template>
        </div>
      </template>

      <!-- Scroll to top -->
      <Transition name="fade">
        <button v-if="showScrollTop" class="scroll-top-btn" @click="scrollToTop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      </Transition>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const locale = computed(() => (route.params.locale as string).toLowerCase())
const slug   = computed(() => route.params.slug as string)
const apiLocale = computed(() => locale.value.toUpperCase())  // zh-tw → ZH-TW

// ── Site data (resolved by Hostname or webSiteId) ──────────────────────────────

const { data: siteData } = await useAsyncData<Record<string, any> | null>(
  'site',
  () => $fetch<any>('/api/site')
)

// webSiteId used in all API calls (backend uses Hostname in prod, but explicit ID is safer)
const webSiteId = computed(() => siteData.value?.tenantId || undefined)

// ── Locales (from /api/web-site/locale) ───────────────────────────────────────

const { data: localesData } = await useAsyncData<any>(
  'locales',
  () => $fetch<any>(
    '/api/locales',
    { params: webSiteId.value ? { webSiteId: webSiteId.value } : undefined }
  )
)

const locales = computed<{ locale: string; urlCode: string; label: string }[]>(() => {
  const arr: any[] = localesData.value?.data || []
  return arr.map(l => ({
    locale:  l.locale,
    urlCode: l.locale.toLowerCase(),  // ZH-TW → zh-tw
    label:   l.label,
  }))
})

// ── Page content ──────────────────────────────────────────────────────────────

const { data: pageData, pending } = await useAsyncData<any>(
  `page-${slug.value}-${apiLocale.value}`,
  () => $fetch<any>(
    `/api/page/${slug.value}`,
    {
      params: {
        locale: apiLocale.value,
        ...(webSiteId.value ? { webSiteId: webSiteId.value } : {}),
      },
    }
  )
)

const basemaps = computed<any[]>(() => {
  const d = pageData.value
  if (!d || d.statusCode !== 200) return []
  const content = d.data?.contentJson
  return Array.isArray(content) ? content : []
})

// ── Frame type helpers ─────────────────────────────────────────────────────────

const HEADER_TYPES = new Set(['HEADER', 'PV_HEADER'])
const FOOTER_TYPES = new Set(['FOOTER', 'PV_FOOTER'])
const isHeaderFrame = (frame: any) => HEADER_TYPES.has(frame?.type)
const isFooterFrame = (frame: any) => FOOTER_TYPES.has(frame?.type)

// ── All-page tree (public API, used for navbar tabs + pre-loaded children) ────

const { data: allPageData } = await useAsyncData<any>(
  `all-page-${apiLocale.value}`,
  () => $fetch<any>(
    '/api/all-page',
    {
      params: {
        locale: apiLocale.value,
        ...(webSiteId.value ? { webSiteId: webSiteId.value } : {}),
      },
    }
  )
)

// ── Page tabs (from all-page API) ─────────────────────────────────────────────

const visibleTabs = computed(() => {
  const pages: any[] = allPageData.value?.data || []
  return pages
    .filter((p: any) => p.slug !== 'portal')
    .map((p: any) => ({ slug: p.slug, name: p.tab || p.seoTitle || p.slug }))
})

// pageTree：傳給 Navbar 預填 children，避免 hover 才懶載
const pageTree = computed(() => allPageData.value?.data || [])

// ── Basemap background style ───────────────────────────────────────────────────

const getBasemapStyle = (basemap: any) => {
  const src = basemap.bgPcImgSrc
  if (!src) return {}
  return { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
}

// ── Scroll to top ──────────────────────────────────────────────────────────────

const showScrollTop = ref(false)
const onScroll   = () => { showScrollTop.value = window.scrollY > 300 }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

// ── SEO ────────────────────────────────────────────────────────────────────────

const siteName   = computed(() => siteData.value?.tenantName || '')
const pageInfo   = computed(() => pageData.value?.data || {})
const seoTitle   = computed(() => pageInfo.value.seoTitle || pageInfo.value.tab || slug.value)
const seoDesc    = computed(() => pageInfo.value.seoDescription || '')
const seoKeyword = computed(() => pageInfo.value.seoKeywords || '')

useHead({
  title: () => `${seoTitle.value}${siteName.value ? ' | ' + siteName.value : ''}`,
  htmlAttrs: { lang: locale.value },
})

useSeoMeta({
  description: () => seoDesc.value || undefined,
  keywords:    () => seoKeyword.value || undefined,
  ogTitle:     () => `${seoTitle.value}${siteName.value ? ' | ' + siteName.value : ''}`,
  ogDescription: () => seoDesc.value || undefined,
})
</script>

<style scoped>
.site-page { min-height: 100vh; background: #fff; }
.basemap-block { position: relative; width: 100%; background-size: cover; background-position: center; }
.site-loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.site-spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #0891B2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.site-error { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-size: 16px; color: #6b7280; }
.scroll-top-btn { position: fixed; bottom: 28px; right: 28px; width: 44px; height: 44px; border-radius: 50%; border: none; background: #0891B2; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 16px rgba(8,145,178,0.4); transition: all 0.2s; z-index: 999; }
.scroll-top-btn:hover { background: #0E7490; transform: translateY(-2px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
