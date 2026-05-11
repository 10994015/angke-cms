import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

const LOCALE_LABEL = { 'ZH-TW': '繁中', 'ZH-CN': '简中', 'EN-US': 'EN' }

export const usePreviewStore = defineStore('preview', () => {
  const tenantId     = ref(null)
  const isLoading    = ref(false)
  const error        = ref(null)
  const locales      = ref([])
  const currentLocale = ref('ZH-TW')
  const currentSlug  = ref('')
  const pageCache    = ref({})
  const basemaps     = ref([])

  const hasMultipleLocales = computed(() => locales.value.length > 1)

  // ── 初始化 ──────────────────────────────────────────────────────────────────

  const init = async (tid, slug, locale) => {
    tenantId.value      = tid
    currentLocale.value = locale || 'ZH-TW'
    await fetchLocales()
    await loadPage(slug)
  }

  // ── Locales ─────────────────────────────────────────────────────────────────

  const fetchLocales = async () => {
    if (!tenantId.value) return
    try {
      const res = await axiosClient.get(`/backend/web-site/${tenantId.value}/locale`)
      if (res.data.statusCode === 200 && Array.isArray(res.data.data)) {
        locales.value = res.data.data.map(l => ({
          locale: l.locale,
          label:  l.label || LOCALE_LABEL[l.locale] || l.locale,
        }))
      }
    } catch { /* 靜默失敗 */ }
  }

  const switchLocale = async (locale) => {
    if (locale === currentLocale.value) return
    currentLocale.value = locale
    pageCache.value = {}
    await loadPage(currentSlug.value)
  }

  // ── 頁面內容 ─────────────────────────────────────────────────────────────────

  const loadPage = async (slug) => {
    if (!slug || !tenantId.value) return

    const cacheKey = `${slug}__${currentLocale.value}`
    if (pageCache.value[cacheKey]) {
      basemaps.value   = pageCache.value[cacheKey]
      currentSlug.value = slug
      return
    }

    isLoading.value = true
    error.value     = null
    try {
      const res = await axiosClient.get(
        `/backend/web-site/${tenantId.value}/page/${slug}/draft-content`,
        { params: { locale: currentLocale.value } }
      )
      const d = res.data
      if (d?.statusCode === 200) {
        const content = Array.isArray(d.data)
          ? d.data
          : (Array.isArray(d.data?.contentJson) ? d.data.contentJson : [])
        pageCache.value[cacheKey] = content
        basemaps.value            = content
        currentSlug.value         = slug
      } else {
        error.value = d?.message || '載入失敗'
      }
    } catch (err) {
      error.value = err.message || '網路錯誤'
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    tenantId.value      = null
    isLoading.value     = false
    error.value         = null
    locales.value       = []
    currentLocale.value = 'ZH-TW'
    currentSlug.value   = ''
    pageCache.value     = {}
    basemaps.value      = []
  }

  return {
    tenantId, isLoading, error,
    locales, currentLocale, hasMultipleLocales,
    currentSlug, basemaps,
    init, fetchLocales, switchLocale, loadPage, reset,
  }
})
