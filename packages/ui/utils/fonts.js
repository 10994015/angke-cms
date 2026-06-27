// 字型設定共用工具（admin 編輯器 / 預覽 / nuxt 前台共用）
// 對照表需與 apps/admin WebSiteListView.vue 的字型清單一致。

// 字型 value → CSS font-family
export const FONT_FAMILIES = {
  // 繁體中文
  'ibm-plex-sans-tc':    "'IBM Plex Sans TC', sans-serif",
  'lxgw-wenkai-mono-tc': "'LXGW WenKai Mono TC', monospace",
  'noto-sans-tc':        "'Noto Sans TC', sans-serif",
  'noto-serif-tc':       "'Noto Serif TC', serif",
  // 簡體中文
  'noto-sans-sc':        "'Noto Sans SC', sans-serif",
  'noto-serif-sc':       "'Noto Serif SC', serif",
  'ibm-plex-sans-sc':    "'IBM Plex Sans SC', sans-serif",
  // 英文
  'bona-nova':           "'Bona Nova', serif",
  'inter':               "'Inter', sans-serif",
  'cormorant-garamond':  "'Cormorant Garamond', serif",
  'montserrat':          "'Montserrat', sans-serif",
  'playfair-display':    "'Playfair Display', serif",
}

// 語系 → 網站設定欄位（大小寫不敏感，內部會轉大寫）
export const LOCALE_FONT_FIELD = {
  'ZH-TW': 'frontFamilyZhTw',
  'ZH-CN': 'frontFamilyZhCn',
  'EN-US': 'frontFamilyEnUs',
}

// 由「網站設定物件 + 目前語系」解析出要套用的 CSS font-family；沒設定則回 null
export function resolveSiteFont(settings, locale) {
  if (!settings || !locale) return null
  const field = LOCALE_FONT_FIELD[String(locale).toUpperCase()]
  if (!field) return null
  const value = settings[field]
  return value ? (FONT_FAMILIES[value] || null) : null
}

// Nuxt / 前台載入字型用的 Google Fonts 連結（與 apps/admin/index.html 一致）
export const GOOGLE_FONT_LINKS = [
  'https://fonts.googleapis.com/css2?family=Bona+Nova:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+TC:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=LXGW+WenKai+Mono+TC&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+SC:wght@400;600&display=swap',
]
