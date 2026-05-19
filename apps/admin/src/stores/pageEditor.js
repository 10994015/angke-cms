import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

// ── 各元件預設 value（工廠函數，每次回傳全新物件，避免共用參考） ──
export const makeDefaultElementValue = (type) => {
  switch (type) {
    case 'TEXT':
      return { text: '請輸入文字內容', fontSize: '16px', color: '#333333', align: 'left',
        borderWidth: 0, borderColor: '#e5e7eb', borderStyle: 'solid', borderRadius: 0,
        bgColor: '', padding: 0,
      }
    case 'IMG':
      return { id: null, src: null, alt: '', width: '100%', height: 'auto', objectFit: 'cover' }
    case 'BUTTON':
      return { text: '按鈕文字', link: '#', align: 'center', bgColor: '#0891B2', textColor: '#ffffff', fontSize: '16px', padding: '12px 32px', borderRadius: '6px' }
    case 'CAROUSEL_IMG':
      return {
        height: 400,
        imgs: [],
        autoPlay: true,
        interval: 3000,
      }
    case 'GOOGLE_MAP':
      return { address: '台北市信義區信義路五段7號', lat: 25.0339639, lng: 121.5644722, zoom: 17 }
    case 'IFRAME':
      return { src: '', height: '400px', title: '' }
    case 'HORIZON_LINE':
      return { color: '#E0E0E0', thickness: '2px', width: '100%', style: 'solid' }
    case 'ACCORDION':
      return {
        items: [
          { title: '常見問題一', content: '請在此輸入說明內容。' },
          { title: '常見問題二', content: '請在此輸入說明內容。' },
        ],
        titleColor: '#333333',
        titleFontSize: '16px',
        titleFontWeight: '600',
        contentColor: '#666666',
        contentFontSize: '15px',
        defaultOpen: false,
      }
    default:
      return {}
  }
}

// 保留向後相容（讀取用，不要直接拿來當 element.value）
export const DEFAULT_ELEMENT_VALUE = {
  TEXT:         makeDefaultElementValue('TEXT'),
  IMG:          makeDefaultElementValue('IMG'),
  BUTTON:       makeDefaultElementValue('BUTTON'),
  CAROUSEL_IMG: makeDefaultElementValue('CAROUSEL_IMG'),
  GOOGLE_MAP:   makeDefaultElementValue('GOOGLE_MAP'),
  IFRAME:       makeDefaultElementValue('IFRAME'),
  HORIZON_LINE: makeDefaultElementValue('HORIZON_LINE'),
  ACCORDION:    makeDefaultElementValue('ACCORDION'),
}

// ── 各版面配置類型的格子數 ──
export const FRAME_CELL_COUNT = {
  'A': 3, 'B': 3, 'C': 4, 'D': 4,
  '1_1': 1, '1_2': 2, '1_3': 3, '1_4': 4,
  '2_2': 4, '2_3': 6, '2_4': 8,
}

// 從 frame.type（如 FRAME_1_2）解析 layout key（如 1_2）
export const parseFrameLayout = (frameType) => {
  if (!frameType) return '1_1'
  if (frameType.startsWith('FRAME')) {
    const key = frameType.replace(/^FRAME[-_]?/, '').replace(/-/g, '_')
    return key || '1_1'
  }
  return frameType
}

export const getCellCount = (frameType) => {
  const layout = parseFrameLayout(frameType)
  return FRAME_CELL_COUNT[layout] ?? 1
}

const createDefaultPadding = () => ({
  pc:     { top: 20, right: 20, bottom: 20, left: 20 },
  tablet: { top: 20, right: 20, bottom: 20, left: 20 },
  phone:  { top: 20, right: 20, bottom: 20, left: 20 },
})

const createDefaultMetadata = () => ({
  color: null, fontSize: null, fontWeight: null, textAlign: null,
  width: null, height: null, backgroundColor: null,
})

export const usePageEditorStore = defineStore('pageEditor', () => {
  // ==================== State ====================

  const tenantId         = ref(null)
  const headerTabs       = ref([])
  const isLoading        = ref(false)
  const isSaving         = ref(false)
  const error            = ref(null)
  const currentPageSlug  = ref(null)
  const locales          = ref([])
  const currentLocale    = ref('ZH-TW')
  const pageData         = ref({})
  const systemFrames     = ref({})
  const websiteSettings  = ref(null)
  const pageSeoData      = ref({})
  const isTemplateMode   = ref(false)
  const isFrontendTemplateMode = ref(false)
  const frontendTemplateId     = ref(null)
  const isBackendTemplateMode  = ref(false)
  const currentDevice    = ref('desktop')

  const selected = ref({ basemap: null, frame: null, element: null, cell: null })
  const pageTree = ref([])
  const availableSystemFrames = ref([])

  // ==================== Computed ====================

  const currentPageBasemaps = computed(() => pageData.value[currentPageSlug.value]?.data || [])
  const currentPageSystemFrames = computed(() => systemFrames.value[currentPageSlug.value] || [])
  const hasUnsavedChanges = computed(() => isTemplateMode.value)

  // ==================== 同步 headerTabs ====================

  const syncHeaderTabsFromPageData = (pages) => {
    if (!Array.isArray(pages) || !pages.length) return
    for (const page of pages) {
      const hb = page.contentJson?.find(b => b.bgType === 'HEADER' || b.bgType === 'PV_HEADER')
      const hf = hb?.frames?.[0]
      if (hf?.data?.tabs?.length) { headerTabs.value = hf.data.tabs; return }
    }
  }

  // ==================== API ====================

  const fetchLocales = async (tid) => {
    if (!tid) return []
    try {
      const res = await axiosClient.get(`/backend/web-site/${tid}/locale`)
      if (res.data.statusCode === 200 && Array.isArray(res.data.data)) {
        locales.value = res.data.data
        if (res.data.data.length && !currentLocale.value) {
          currentLocale.value = res.data.data[0].locale
        }
        return res.data.data
      }
    } catch (err) { error.value = err.message }
    return []
  }

  const fetchAvailableSystemFrames = async () => {
    try {
      const res = await axiosClient.get('/backend/web-site/frame')
      if (res.data.statusCode === 200 && Array.isArray(res.data.data)) {
        availableSystemFrames.value = res.data.data
        return res.data.data
      }
    } catch (err) { error.value = err.message }
    return []
  }

  const fetchSystemFrames = async (tid, slug) => {
    if (!tid || !slug) return []
    try {
      const res = await axiosClient.get(`/tenant/${tid}/web-site/draft-page/${slug}/system-frame`)
      if (res.data.statusCode === 200) { systemFrames.value[slug] = res.data.data; return res.data.data }
    } catch { systemFrames.value[slug] = [] }
    return []
  }

  const fetchAllPages = async (tid, locale = null) => {
    if (!tid) return null
    isLoading.value = true
    try {
      const res = await axiosClient.get(`/backend/web-site/${tid}/all-page`, { params: { locale: locale || currentLocale.value } })
      if (res.data.statusCode === 200 && Array.isArray(res.data.data)) {
        res.data.data.forEach(p => { pageData.value[p.slug] = { data: p.contentJson } })
        syncHeaderTabsFromPageData(res.data.data)
        return res.data.data
      }
    } catch (err) { error.value = err.message } finally { isLoading.value = false }
    return null
  }

  const loadTemplateAsEditorData = async (tid, webTemplateId) => {
    if (!tid || !webTemplateId) return false
    isLoading.value = true
    try {
      const res = await axiosClient.post(`/tenant/${tid}/web-site/temp-content`, { webTemplateId })
      if (res.data.statusCode !== 200 || !Array.isArray(res.data.data)) throw new Error(res.data.message)
      res.data.data.forEach(p => { pageData.value[p.slug] = { data: p.contentJson } })
      syncHeaderTabsFromPageData(res.data.data)
      isTemplateMode.value = true
      return res.data.data
    } catch (err) { error.value = err.message; return false } finally { isLoading.value = false }
  }

  const validateAndFixContent = (basemaps) => {
    if (!Array.isArray(basemaps)) return []
    return basemaps.map(basemap => {
      if (!Array.isArray(basemap.frames)) basemap.frames = []
      basemap.frames = basemap.frames.filter(Boolean).map(frame => {
        if (!frame.data) frame.data = {}
        const isSystemFrame = frame.type && !frame.type.startsWith('FRAME')
        if (!isSystemFrame) {
          const count = getCellCount(frame.type)
          if (!Array.isArray(frame.elements)) frame.elements = Array(count).fill(null)
          while (frame.elements.length < count) frame.elements.push(null)
          frame.elements = frame.elements.map(el => {
            if (!el) return null
            if (!el.value) el.value = {}
            if (!el.metadata) el.metadata = createDefaultMetadata()
            if (el.padding && el.padding.pc === undefined) {
              const f = el.padding
              const s = { top: f.top ?? 20, right: f.right ?? 20, bottom: f.bottom ?? 20, left: f.left ?? 20 }
              el.padding = { pc: { ...s }, tablet: { ...s }, phone: { ...s } }
            }
            if (!el.padding) el.padding = createDefaultPadding()
            return el
          })
        } else if (!Array.isArray(frame.elements)) {
          frame.elements = []
        }
        return frame
      })
      return basemap
    })
  }

  const saveAllPages = async (tid) => {
    if (!tid) return false
    isSaving.value = true
    error.value = null
    try {
      const entries = Object.entries(pageData.value)
      for (const [slug, val] of entries) {
        const contentJson = validateAndFixContent(val.data)
        const res = await axiosClient.patch(
          `/backend/web-site/${tid}/page/${slug}/draft-content`,
          { locale: currentLocale.value, contentJson }
        )
        if (res.data.statusCode !== 200) {
          throw new Error(res.data.message || `儲存頁面 ${slug} 失敗`)
        }
      }
      isTemplateMode.value = false
      await fetchPageTree(tid)
      await loadPageContent(currentPageSlug.value)
      return true
    } catch (err) { error.value = err.message; return false } finally { isSaving.value = false }
  }

  const saveCurrentPage = async () => {
    return saveAllPages(tenantId.value)
  }

  // ==================== 頁面切換 ====================

  const setTenantId = (tid) => { tenantId.value = tid }

  const initializePage = async (slug, locale = null) => {
    if (!tenantId.value) return
    if (Object.keys(pageData.value).length && !locale) { currentPageSlug.value = slug; return }
    const data = await fetchAllPages(tenantId.value, locale)
    if (data) currentPageSlug.value = slug
  }

  const switchPage = (slug) => { clearSelection(); currentPageSlug.value = slug }

  const reloadCurrentPage = async (newLocale) => {
    const slug = currentPageSlug.value
    if (!slug) return
    isLoading.value = true
    currentLocale.value = newLocale
    clearSelection()
    pageData.value = {}
    // 重新抓新語系的 page tree，navbar 才能跟著更新
    await fetchPageTree(tenantId.value, newLocale)
    await loadPageContent(slug)
  }

  const setCurrentDevice = (device) => { currentDevice.value = device }

  // ==================== 選取 ====================

  const selectBasemap = (basemap) => { selected.value = { basemap, frame: null, element: null, cell: null } }
  const selectFrame   = (frame)   => { selected.value = { basemap: null, frame, element: null, cell: null } }
  const selectElement = (element) => { selected.value = { basemap: null, frame: null, element, cell: null } }
  const selectCell    = (cell)    => { selected.value = { basemap: null, frame: null, element: null, cell } }
  const clearSelection = ()       => { selected.value = { basemap: null, frame: null, element: null, cell: null } }

  // ==================== Basemap 操作 ====================

  const addBasemap = (insertIndex) => {
    const basemaps = currentPageBasemaps.value
    const idx = insertIndex !== undefined ? insertIndex + 1 : basemaps.length
    const newBasemap = {
      bgPcImgSrc: null, bgPcImgId: null,
      bgTabletImgSrc: null, bgTabletImgId: null,
      bgPhoneImgSrc: null, bgPhoneImgId: null,
      bgIsDeletable: true, bgAllowMultipleFrames: true, bgCanChangeImg: true,
      bgType: 'CONTENT', frames: [],
    }
    basemaps.splice(idx, 0, newBasemap)
    return newBasemap
  }

  const deleteBasemap = (index) => {
    const basemaps = currentPageBasemaps.value
    if (index < 0 || index >= basemaps.length || !basemaps[index].bgIsDeletable) return false
    basemaps.splice(index, 1)
    clearSelection()
    return true
  }

  const moveBasemapUp = (index) => {
    const b = currentPageBasemaps.value
    if (index <= 0 || b[index].bgType === 'HEADER' || b[index - 1].bgType === 'HEADER') return false
    ;[b[index], b[index - 1]] = [b[index - 1], b[index]]
    return true
  }

  const moveBasemapDown = (index) => {
    const b = currentPageBasemaps.value
    if (index >= b.length - 1 || b[index].bgType === 'FOOTER' || b[index + 1].bgType === 'FOOTER') return false
    ;[b[index], b[index + 1]] = [b[index + 1], b[index]]
    return true
  }

  // ==================== Frame 操作 ====================

  const addCustomFrame = (basemap, frameType = 'FRAME_1_1') => {
    if (!basemap) return null
    if (!Array.isArray(basemap.frames)) basemap.frames = []
    const count = getCellCount(frameType)
    const newFrame = {
      type: frameType,
      data: {},
      elements: Array(count).fill(null),
      isDeletable: true,
    }
    basemap.frames.push(newFrame)
    return newFrame
  }

  const makeSystemFrameData = (frameType) => {
    switch (frameType) {
      case 'CAROUSEL_WALL':
        return {
          caroiselWallImgs: [],
          carouselWallHeight: 600,
          carouselWallAutoPlay: true,
          carouselWallInterval: 5000,
        }
      case 'FIRST_PICTURE':
        return {
          heroBgImgSrc: null,
          heroTitle: '',
          heroSubtitle: '',
          heroHeight: '600px',
          overlayOpacity: 40,
          overlayColor: '#000000',
          titleColor: '#ffffff',
          titleFontSize: '48px',
          subtitleColor: '#eeeeee',
          subtitleFontSize: '20px',
        }
      default:
        return {}
    }
  }

  const addSystemFrame = (basemap, frameType, defaultData = {}) => {
    if (!basemap) return null
    if (!Array.isArray(basemap.frames)) basemap.frames = []
    const newFrame = { type: frameType, data: { ...makeSystemFrameData(frameType), ...defaultData }, isDeletable: true }
    basemap.frames.push(newFrame)
    return newFrame
  }

  const deleteFrame = (basemap, frameIndex) => {
    if (!basemap?.frames) return false
    const frame = basemap.frames[frameIndex]
    if (selected.value.frame === frame) clearSelection()
    basemap.frames.splice(frameIndex, 1)
    return true
  }

  const moveFrameUp = (basemap, frameIndex) => {
    if (!basemap?.frames || frameIndex <= 0) return false
    ;[basemap.frames[frameIndex], basemap.frames[frameIndex - 1]] = [basemap.frames[frameIndex - 1], basemap.frames[frameIndex]]
    return true
  }

  const moveFrameDown = (basemap, frameIndex) => {
    if (!basemap?.frames || frameIndex >= basemap.frames.length - 1) return false
    ;[basemap.frames[frameIndex], basemap.frames[frameIndex + 1]] = [basemap.frames[frameIndex + 1], basemap.frames[frameIndex]]
    return true
  }

  // ==================== Element 操作 ====================

  const addElementToCell = (frame, cellIndex, elementType) => {
    if (!frame) return null
    const count = getCellCount(frame.type)
    if (!Array.isArray(frame.elements)) frame.elements = Array(count).fill(null)
    while (frame.elements.length < count) frame.elements.push(null)

    // 不覆寫已有元件
    if (frame.elements[cellIndex]?.type) return null

    const newElement = {
      type: elementType,
      value: makeDefaultElementValue(elementType),
      metadata: createDefaultMetadata(),
      padding: createDefaultPadding(),
      width: null,
    }
    frame.elements[cellIndex] = newElement
    selectElement(newElement)
    return newElement
  }

  const deleteElementFromCell = (frame, cellIndex) => {
    if (!frame?.elements || cellIndex >= frame.elements.length) return false
    if (selected.value.element === frame.elements[cellIndex]) clearSelection()
    frame.elements[cellIndex] = null
    return true
  }

  const updateSelectedElementValue = (key, value) => {
    if (!selected.value.element) return
    if (!selected.value.element.value) selected.value.element.value = {}
    selected.value.element.value[key] = value
  }

  const updateSelectedElementMetadata = (key, value) => {
    if (!selected.value.element) return
    if (!selected.value.element.metadata) selected.value.element.metadata = createDefaultMetadata()
    selected.value.element.metadata[key] = value
  }

  // ==================== 網站設定 ====================

  const fetchWebsiteSettings = async (tid) => {
    if (!tid) return null
    isLoading.value = true
    try {
      const res = await axiosClient.get(`/backend/web-site/${tid}`)
      console.log('[fetchSiteSettings]', res.data)
      if (res.data.statusCode === 200 && res.data.data) { websiteSettings.value = res.data.data; return res.data.data }
    } catch (err) { error.value = err.message } finally { isLoading.value = false }
    return null
  }

  const updateWebsiteSettings = async (tid, data) => {
    if (!tid || !data) return false
    isLoading.value = true
    try {
      const res = await axiosClient.patch(`/backend/web-site/${tid}`, data)
      if (res.data.statusCode === 200) { if (res.data.data) websiteSettings.value = res.data.data; return true }
    } catch (err) { error.value = err.message } finally { isLoading.value = false }
    return false
  }

  const publishWebsite = async (tid, locale) => {
    if (!tid || !locale) return false
    isLoading.value = true
    try {
      const res = await axiosClient.patch(`/backend/web-site/${tid}/publish`, { locale })
      if (res.data.statusCode === 200) return true
      error.value = res.data.message
    } catch (err) { error.value = err.message } finally { isLoading.value = false }
    return false
  }

  const uploadImage = async (file) => {
    if (!file) return null
    if (file.size > 10 * 1024 * 1024) { error.value = '圖片大小不能超過 10MB'; return null }
    if (!tenantId.value) { error.value = '缺少網站 ID'; return null }
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axiosClient.post(
        `/backend/web-site/${tenantId.value}/page/file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      if (res.data.statusCode === 200) {
        const raw = res.data.data
        const uploadedFile = Array.isArray(raw) ? raw[0] : raw
        if (!uploadedFile) return null
        const fileUrl = uploadedFile.fileDir || uploadedFile.publicFileUrl || uploadedFile.fileUrl
        return {
          id:           uploadedFile.id,
          fileUrl,
          fileName:     uploadedFile.filename || uploadedFile.fileName,
          originalName: uploadedFile.originalName,
          size:         uploadedFile.size,
        }
      }
      error.value = res.data.message || '上傳失敗'
    } catch (err) { error.value = err.message }
    return null
  }

  const saveDraftForSlug = async (slug) => {
    if (!tenantId.value || !slug) return false
    const val = pageData.value[slug]
    if (!val) return false
    try {
      const contentJson = validateAndFixContent(val.data)
      const res = await axiosClient.patch(
        `/backend/web-site/${tenantId.value}/page/${slug}/draft-content`,
        { locale: currentLocale.value || 'ZH-TW', contentJson }
      )
      return res.data.statusCode === 200
    } catch { return false }
  }

  const loadPageContent = async (slug) => {
    if (!tenantId.value || !slug) return

    isLoading.value = true

    // 先 loading，再儲存草稿，再切頁
    const prevSlug = currentPageSlug.value
    if (prevSlug && prevSlug !== slug && pageData.value[prevSlug]) {
      const saved = await saveDraftForSlug(prevSlug)
      if (!saved) { error.value = '儲存草稿失敗，請稍後再試'; isLoading.value = false; return }
    }
    try {
      const res = await axiosClient.get(
        `/backend/web-site/${tenantId.value}/page/${slug}/draft-content`,
        { params: { locale: currentLocale.value || 'ZH-TW' } }
      )
      const d = res.data
      if (d?.statusCode === 200) {
        const basemaps = Array.isArray(d.data) ? d.data : (Array.isArray(d.data?.contentJson) ? d.data.contentJson : [])
        console.log(`[loadPageContent] slug="${slug}" contentJson:`, basemaps)
        pageData.value[slug] = { data: basemaps }
        clearSelection()
        currentPageSlug.value = slug
      }
    } catch (err) {
      console.error('[PageContent] fetch error:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchPageTree = async (websiteId, locale = null) => {
    if (!websiteId) return []
    try {
      const res = await axiosClient.get(`/backend/web-site/${websiteId}/all-page`, {
        params: { locale: locale || currentLocale.value || 'ZH-TW' },
      })
      console.log('[PageTree] raw response:', res.data)
      if (res.data.statusCode === 200 && Array.isArray(res.data.data)) {
        pageTree.value = res.data.data
        return res.data.data
      }
    } catch (err) {
      console.error('[PageTree] fetch error:', err)
    }
    return []
  }

  const fetchPageChildren = async (slug) => {
    if (!tenantId.value || !slug) return []
    try {
      const res = await axiosClient.get(
        `/backend/web-site/${tenantId.value}/page/${slug}/children`,
        { params: { locale: currentLocale.value || 'ZH-TW' } }
      )
      if (res.data.statusCode === 200 && Array.isArray(res.data.data)) return res.data.data
    } catch (err) { error.value = err.message }
    return []
  }

  const fetchPageInfo = async (slug) => {
    if (!tenantId.value || !slug) return null
    try {
      const res = await axiosClient.get(
        `/backend/web-site/${tenantId.value}/page/${slug}`,
        { params: { locale: currentLocale.value || 'ZH-TW' } }
      )
      if (res.data.statusCode === 200) return res.data.data
    } catch (err) { error.value = err.message }
    return null
  }

  const updatePageInfo = async (slug, data) => {
    if (!tenantId.value || !slug) return false
    try {
      const res = await axiosClient.patch(
        `/backend/web-site/${tenantId.value}/page/${slug}`,
        { locale: currentLocale.value || 'ZH-TW', ...data }
      )
      if (res.data.statusCode === 200) {
        await fetchPageTree(tenantId.value)
        return true
      }
      error.value = res.data.message
    } catch (err) { error.value = err.message }
    return false
  }

  const deletePage = async (slug) => {
    if (!tenantId.value || !slug) return false
    isLoading.value = true
    try {
      const res = await axiosClient.delete(`/backend/web-site/${tenantId.value}/page/${slug}`)
      if (res.data.statusCode === 200) {
        delete pageData.value[slug]
        pageTree.value = pageTree.value.filter(n => n.slug !== slug)
        if (currentPageSlug.value === slug) currentPageSlug.value = null
        return true
      }
      error.value = res.data.message
    } catch (err) { error.value = err.message } finally { isLoading.value = false }
    return false
  }

  const deleteDraft = async (slug) => {
    if (!tenantId.value || !slug) return false
    isLoading.value = true
    try {
      const res = await axiosClient.delete(
        `/backend/web-site/${tenantId.value}/page/${slug}/draft-content`,
        { data: { locale: currentLocale.value || 'ZH-TW' } }
      )
      if (res.data.statusCode === 200) {
        delete pageData.value[slug]
        if (currentPageSlug.value === slug) {
          const next = Object.keys(pageData.value)[0] ?? null
          currentPageSlug.value = next
        }
        return true
      }
      error.value = res.data.message
    } catch (err) { error.value = err.message } finally { isLoading.value = false }
    return false
  }

  // ==================== 重置 ====================

  const resetStore = () => {
    tenantId.value = null; headerTabs.value = []; isLoading.value = false; isSaving.value = false
    error.value = null; currentPageSlug.value = null; pageData.value = {}; systemFrames.value = {}
    locales.value = []; selected.value = { basemap: null, frame: null, element: null, cell: null }
    websiteSettings.value = null; isTemplateMode.value = false; isFrontendTemplateMode.value = false
    frontendTemplateId.value = null; isBackendTemplateMode.value = false; currentDevice.value = 'desktop'
  }

  const initWithDemo = () => {
    pageData.value = { index: { data: [] } }
    currentPageSlug.value = 'index'
    headerTabs.value = [{ slug: 'index', name: '首頁' }]
    websiteSettings.value = { domainName: '' }
  }

  // ==================== Return ====================

  return {
    tenantId, headerTabs, isLoading, isSaving, error,
    currentPageSlug, locales, currentLocale, pageData, systemFrames, availableSystemFrames,
    selected, websiteSettings, pageSeoData,
    isTemplateMode, hasUnsavedChanges,
    isFrontendTemplateMode, frontendTemplateId, isBackendTemplateMode,
    currentDevice,

    currentPageBasemaps, currentPageSystemFrames,

    fetchLocales, fetchAvailableSystemFrames, fetchSystemFrames, fetchAllPages, saveAllPages, saveCurrentPage, saveDraftForSlug,
    loadTemplateAsEditorData, fetchWebsiteSettings, updateWebsiteSettings,
    publishWebsite, uploadImage, deleteDraft,

    setTenantId, initializePage, switchPage, reloadCurrentPage, setCurrentDevice,

    selectBasemap, selectFrame, selectElement, selectCell, clearSelection,

    pageTree, fetchPageTree, fetchPageChildren, loadPageContent,
    fetchPageInfo, updatePageInfo, deletePage,

    addBasemap, deleteBasemap, moveBasemapUp, moveBasemapDown,
    addCustomFrame, addSystemFrame, deleteFrame, moveFrameUp, moveFrameDown,
    addElementToCell, deleteElementFromCell,
    updateSelectedElementValue, updateSelectedElementMetadata,

    initWithDemo, resetStore,
  }
})
