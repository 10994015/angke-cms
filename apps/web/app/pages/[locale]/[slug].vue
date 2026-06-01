<template>
  <div class="site-page">
    <!-- Loading -->
    <div v-if="showInitialLoading" class="site-loading">
      <div class="site-spinner" />
    </div>

    <!-- Not found -->
    <div v-else-if="!siteData" class="site-error">
      <p>找不到網站</p>
    </div>

    <!-- Route page failed -->
    <div v-else-if="showPageError" class="site-error">
      <div class="error-card">
        <div class="error-badge">頁面載入失敗</div>
        <h2 class="error-title">{{ pageErrorTitle }}</h2>
        <p class="error-message">{{ pageErrorMessage }}</p>

        <div class="error-meta">
          <div><span>網址</span><strong>{{ pageUrl }}</strong></div>
          <div><span>語系</span><strong>{{ locale }}</strong></div>
          <div><span>頁面</span><strong>{{ slug }}</strong></div>
          <div><span>狀態碼</span><strong>{{ pageStatusCode }}</strong></div>
        </div>

        <ul class="error-list">
          <li v-for="item in pageErrorHints" :key="item">{{ item }}</li>
        </ul>
      </div>
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
const pageUrl = computed(() => route.fullPath)
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
  'locales-by-site',
  () => $fetch<any>(
    '/api/locales',
    { params: webSiteId.value ? { webSiteId: webSiteId.value } : undefined }
  ),
  {
    watch: [webSiteId],
    lazy: true,
    default: () => ({ statusCode: 200, data: [] }),
  }
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
  () => `page-by-route:${locale.value}:${slug.value}`,
  () => $fetch<any>(
    `/api/page/${slug.value}`,
    {
      params: {
        locale: apiLocale.value,
        ...(webSiteId.value ? { webSiteId: webSiteId.value } : {}),
      },
    }
  ),
  {
    watch: [slug, apiLocale, webSiteId],
    default: () => ({ statusCode: 500, data: { contentJson: [] } }),
  }
)

const pageStatusCode = computed(() => Number(pageData.value?.statusCode || 500))
const showPageError = computed(() => !pending.value && pageStatusCode.value !== 200)
const pageErrorTitle = computed(() =>
  pageStatusCode.value === 404
    ? '找不到這一頁'
    : pageStatusCode.value >= 500
      ? '後端回應異常'
      : '頁面資料讀取失敗'
)
const pageErrorMessage = computed(() =>
  pageStatusCode.value === 404
    ? '後端沒有找到對應的頁面資料，可能是 slug 寫錯、這頁尚未發佈，或 CMS 內的頁面路由尚未建立。'
    : pageStatusCode.value >= 500
      ? '後端 API 回傳伺服器錯誤，通常是後端服務異常、反向代理設定、或 API 路徑錯誤造成。'
      : '前端已拿到回應，但資料不是預期格式，可能是站點設定、語系資料或頁面內容結構有問題。'
)
const pageErrorHints = computed(() => {
  if (pageStatusCode.value === 404) {
    return [
      '確認這個 slug 在 CMS 裡是否存在且已發佈。',
      '確認目前語系與網址是否一致，例如 /zh-tw/home。',
      '如果是剛更新內容，檢查正式站是否還在吃舊快取。',
    ]
  }

  if (pageStatusCode.value >= 500) {
    return [
      '確認後端服務是否正常存活。',
      '確認 NUXT_API_BASE 與反向代理是否指到正確的後端路徑。',
      '確認正式站載入的 chunk / 資源沒有被舊快取卡住。',
    ]
  }

  return [
    '確認 API 回傳的 JSON 結構是否包含 statusCode 與 data.contentJson。',
    '確認站點識別與語系參數是否正確。',
    '如果剛部署，重新整理一次再比對是否恢復。',
  ]
})

const basemaps = computed<any[]>(() => {
  const d = pageData.value
  if (!d || d.statusCode !== 200) return []
  const content = d.data?.contentJson
  return Array.isArray(content) ? content : []
})

const showInitialLoading = computed(() => pending.value && basemaps.value.length === 0)

// ── Frame type helpers ─────────────────────────────────────────────────────────

const HEADER_TYPES = new Set(['HEADER', 'PV_HEADER'])
const FOOTER_TYPES = new Set(['FOOTER', 'PV_FOOTER'])
const isHeaderFrame = (frame: any) => HEADER_TYPES.has(frame?.type)
const isFooterFrame = (frame: any) => FOOTER_TYPES.has(frame?.type)

// ── All-page tree (public API, used for navbar tabs + pre-loaded children) ────

const { data: allPageData } = await useAsyncData<any>(
  'all-page-by-locale',
  () => $fetch<any>(
    '/api/all-page',
    {
      params: {
        locale: apiLocale.value,
        ...(webSiteId.value ? { webSiteId: webSiteId.value } : {}),
      },
    }
  ),
  {
    watch: [apiLocale, webSiteId],
    lazy: true,
    default: () => ({ statusCode: 200, data: [] }),
  }
)

// ── slug → 顯示名稱 對照表（從 all-page 樹狀遞迴建立）─────────────────────────

const slugLabelMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  const flatten = (nodes: any[]) => {
    for (const n of nodes || []) {
      map[n.slug] = n.tab || n.seoTitle || n.slug
      if (n.children?.length) flatten(n.children)
    }
  }
  flatten(allPageData.value?.data || [])
  return map
})

// ── Page tabs：照 CMS header frame 設定的清單，名稱用 slugLabelMap 解析 ────────

const visibleTabs = computed(() => {
  // 找 header basemap 裡的第一個 header frame
  for (const bm of basemaps.value) {
    const isHeader = HEADER_TYPES.has(bm?.bgType) || HEADER_TYPES.has(bm?.frames?.[0]?.type)
    if (isHeader) {
      const frame = bm.frames?.[0]
      const tabs: any[] = frame?.data?.tabs || frame?.data?.tab || []
      return tabs
        .filter((t: any) => t.slug !== 'portal' && t.name !== '入口頁')
        .map((t: any) => ({
          slug: t.slug,
          name: slugLabelMap.value[t.slug] || t.name || t.slug,
        }))
    }
  }
  return []
})

// pageTree：傳給 Navbar 預填整棵 children tree
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
.site-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  color: #334155;
}

.error-card {
  width: min(640px, 100%);
  padding: 28px 30px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
}

.error-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.error-title {
  margin: 0 0 10px;
  font-size: 28px;
  line-height: 1.2;
  color: #0f172a;
}

.error-message {
  margin: 0 0 18px;
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
}

.error-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.error-meta div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-meta span {
  font-size: 12px;
  color: #64748b;
}

.error-meta strong {
  font-size: 14px;
  color: #0f172a;
  word-break: break-word;
}

.error-list {
  margin: 18px 0 0;
  padding-left: 18px;
  color: #475569;
}

.error-list li {
  margin: 8px 0;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .error-card { padding: 22px 18px; }
  .error-title { font-size: 22px; }
  .error-meta { grid-template-columns: 1fr; }
}
.scroll-top-btn { position: fixed; bottom: 28px; right: 28px; width: 44px; height: 44px; border-radius: 50%; border: none; background: #0891B2; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 16px rgba(8,145,178,0.4); transition: all 0.2s; z-index: 999; }
.scroll-top-btn:hover { background: #0E7490; transform: translateY(-2px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
