<template>
  <header class="pv-navbar" :style="navbarBgStyle">
    <div class="pv-navbar-container">

      <!-- Logo -->
      <div class="pv-logo-wrapper">
        <NuxtLink :to="`/${currentLocale}/${defaultSlug}`" class="pv-logo">
          <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="pv-logo-image" />
        </NuxtLink>
      </div>

      <!-- Desktop nav -->
      <nav v-if="!isMobile" class="pv-nav-menu">
        <div
          v-for="tab in tabs"
          :key="tab.slug"
          class="pv-nav-item-wrapper"
          :ref="(el) => { if (el) wrapperRefs[tab.slug] = el as HTMLElement }"
          @mouseenter="onNavEnter(tab.slug)"
          @mouseleave="onNavWrapperLeave"
        >
          <NuxtLink
            :to="`/${currentLocale}/${tab.slug}`"
            class="pv-nav-item"
            :class="{ active: isActive(tab.slug) }"
          >
            {{ tab.name }}
            <svg
              v-if="hasChildren(tab.slug)"
              class="pv-nav-chevron"
              :class="{ open: activeDropdown === tab.slug }"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </NuxtLink>
        </div>
      </nav>

      <!-- Desktop dropdown：交給 NavDropdownMenu 遞迴處理多層 -->
      <Teleport to="body">
        <Transition name="nav-dropdown">
          <div
            v-if="activeDropdown && hasChildren(activeDropdown)"
            class="pv-nav-dropdown"
            :style="dropdownStyle"
            @mouseenter="onDropdownEnter"
            @mouseleave="onDropdownLeave"
          >
            <NavDropdownMenu
              :items="getChildren(activeDropdown)"
              :depth="0"
              :is-portal="true"
            />
          </div>
        </Transition>
      </Teleport>

      <!-- Right actions (desktop) -->
      <div v-if="!isMobile" class="pv-nav-actions">
        <a class="pv-login-btn" :href="`${loginUrl}/login`">登入</a>

        <div v-if="locales.length >= 1" class="pv-locale-wrapper" @click.stop>
          <button ref="localeBtnRef" class="pv-locale-btn" @click="updateLocaleDropdownPos(); localeMenuOpen = !localeMenuOpen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span class="pv-locale-label">{{ currentLocaleLabel }}</span>
            <svg class="pv-chevron" :class="{ open: localeMenuOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <Teleport to="body">
            <Transition name="locale-dropdown">
              <div v-if="localeMenuOpen" class="pv-locale-dropdown" :style="localeDropdownStyle" @click.stop>
                <NuxtLink
                  v-for="loc in locales"
                  :key="loc.locale"
                  :to="`/${loc.urlCode}/${currentSlug}`"
                  class="pv-locale-option"
                  :class="{ active: loc.urlCode === currentLocale }"
                  @click="localeMenuOpen = false"
                >{{ loc.label }}</NuxtLink>
              </div>
            </Transition>
          </Teleport>
        </div>
      </div>

      <!-- Hamburger (mobile) -->
      <button v-if="isMobile" class="pv-hamburger-btn" :class="{ 'is-open': mobileOpen }" @click="mobileOpen = !mobileOpen">
        <span class="pv-hamburger-line" />
        <span class="pv-hamburger-line" />
        <span class="pv-hamburger-line" />
      </button>
    </div>

    <!-- Mobile dropdown：flatten 遞迴，depth 用 paddingLeft 縮排 -->
    <Transition name="mobile-menu">
      <div v-if="isMobile && mobileOpen" class="pv-mobile-menu">
        <nav class="pv-mobile-nav">
          <template v-for="item in flatMobileItems" :key="item.slug + '-' + item.depth">
            <div
              class="pv-mobile-nav-item"
              :class="{ active: item.isActive, 'is-child': item.depth > 0 }"
              :style="item.depth > 0 ? { paddingLeft: `${24 + item.depth * 16}px` } : {}"
              @click="onMobileItemClick(item)"
            >
              <span>{{ item.label }}</span>
              <svg
                class="pv-mobile-arrow"
                :class="{ rotated: item.isExpanded }"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              >
                <polyline v-if="item.mightHaveChildren" points="6 9 12 15 18 9"/>
                <polyline v-else points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </template>
        </nav>
        <div class="pv-mobile-actions">
          <a class="pv-mobile-login-btn" :href="`${loginUrl}/login`">登入</a>
          <div v-if="locales.length >= 1" class="pv-mobile-locale">
            <NuxtLink
              v-for="loc in locales"
              :key="loc.locale"
              :to="`/${loc.urlCode}/${currentSlug}`"
              class="pv-mobile-locale-btn"
              :class="{ active: loc.urlCode === currentLocale }"
              @click="mobileOpen = false"
            >{{ loc.label }}</NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, provide, onMounted, onUnmounted, nextTick } from 'vue'
import NavDropdownMenu from './NavDropdownMenu.vue'

const props = defineProps<{
  frameData:     Record<string, any>
  basemapBg?:    { desktop?: string | null; tablet?: string | null; mobile?: string | null }
  currentLocale: string
  locales:       { locale: string; label: string; urlCode: string }[]
  tabs:          { slug: string; name: string }[]
  currentSlug:   string
  pageTree?:     { slug: string; tab?: string; seoTitle?: string; children?: any[] }[]
  scale?:        number
}>()

const config      = useRuntimeConfig()
const defaultSlug = config.public.defaultSlug
const loginUrl    = config.public.loginUrl

// ── Mobile / resize ───────────────────────────────────────────────────────────
const navViewportWidth = ref(1280)
// scale 不等於 1（整站被 CSS 縮放）時，導航列一律改用漢堡選單，避免桌機橫向選單跑版
const forceHamburger = computed(() => {
  const s = Number(props.scale)
  return Number.isFinite(s) && s !== 1
})
// 只有桌機（>1080）顯示橫向選單；平板與電子刊版寬度(≤1080)以下一律漢堡
const HAMBURGER_MAX_WIDTH = 1080
const isMobile = computed(() => forceHamburger.value || navViewportWidth.value <= HAMBURGER_MAX_WIDTH)
const updateMobile = () => { navViewportWidth.value = window.innerWidth }
onMounted(() => {
  updateMobile()
  window.addEventListener('resize', updateMobile)
})
onUnmounted(() => { window.removeEventListener('resize', updateMobile) })

const mobileOpen = ref(false)

// ── Logo / bg ─────────────────────────────────────────────────────────────────
const logoSrc = computed(() => props.frameData.logoImgUrl || props.frameData.logoImgSrc || null)

// 背景圖改用 CSS 變數 + media query 切換（SSR 友善、無閃爍），fallback 烤進變數值。
// 串接：手機→平板→桌機；平板→桌機；桌機用自己。
const navbarBgStyle = computed(() => {
  const d = props.basemapBg?.desktop, t = props.basemapBg?.tablet, m = props.basemapBg?.mobile
  const toUrl = (v: any) => (v ? `url(${v})` : 'none')
  return {
    backgroundColor: props.frameData.navBgColor || props.frameData.bgColor || 'transparent',
    color: props.frameData.navTextColor || props.frameData.textColor || '#333333',
    '--nav-bg-desktop': toUrl(d),
    '--nav-bg-tablet':  toUrl(t || d),
    '--nav-bg-mobile':  toUrl(m || t || d),
  }
})

// ── Children cache ────────────────────────────────────────────────────────────
const childrenCache = reactive<Record<string, { tab: string; slug: string }[]>>({})

const getChildren = (slug: string) => childrenCache[slug] ?? []
const hasChildren  = (slug: string) => (childrenCache[slug]?.length ?? 0) > 0

// 懶載：cache 中沒有的節點才打 API
const ensureChildren = async (slug: string) => {
  if (slug in childrenCache) return
  try {
    const res = await $fetch<any>(`/nuxt-api/children/${slug}`, {
      params: { locale: props.currentLocale.toUpperCase() },
    })
    if (res?.statusCode === 200 && Array.isArray(res.data)) {
      childrenCache[slug] = res.data.map((c: any) => ({ tab: c.tab || c.slug, slug: c.slug }))
    } else {
      childrenCache[slug] = []
    }
  } catch {
    childrenCache[slug] = []
  }
}

// 遞迴預填 pageTree → childrenCache（所有層）
const populateFromTree = (nodes: any[]) => {
  for (const n of nodes || []) {
    if (n.slug && !(n.slug in childrenCache)) {
      childrenCache[n.slug] = (Array.isArray(n.children) ? n.children : []).map((c: any) => ({
        tab:  c.tab || c.seoTitle || c.slug,
        slug: c.slug,
      }))
    }
    if (Array.isArray(n.children) && n.children.length > 0) {
      populateFromTree(n.children)
    }
  }
}

watch(() => props.pageTree, (tree) => {
  Object.keys(childrenCache).forEach(k => delete childrenCache[k])
  if (tree?.length) populateFromTree(tree)
}, { immediate: true })

// ── Active state（遞迴：只要後代是當前頁就算 active）────────────────────────
const isActive = (slug: string): boolean => {
  if (slug === props.currentSlug) return true
  const checkKids = (kids: any[]): boolean => {
    for (const c of kids || []) {
      if (c.slug === props.currentSlug || checkKids(childrenCache[c.slug] || [])) return true
    }
    return false
  }
  return checkKids(childrenCache[slug] || [])
}

// ── Provide 給 NavDropdownMenu（inject）───────────────────────────────────────
const activeDropdown = ref<string | null>(null)

provide('navDropdownState', {
  getChildren,
  hasChildren,
  ensureChildren,
  isActive,
  getPath:    (slug: string) => `/${props.currentLocale}/${slug}`,
  onNavigate: () => { activeDropdown.value = null },
})

// ── Desktop dropdown ──────────────────────────────────────────────────────────
const dropdownStyle = ref<Record<string, string>>({})
const wrapperRefs: Record<string, HTMLElement> = {}
let closeTimer: ReturnType<typeof setTimeout> | null = null

const updateDropdownPos = (slug: string) => {
  const el = wrapperRefs[slug]
  if (!el) return
  const rect = el.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top:  rect.bottom + 4 + 'px',
    left: rect.left + rect.width / 2 + 'px',
    zIndex: '99999',
  }
}

const onNavEnter = async (slug: string) => {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
  // 先量好位置再顯示，避免下拉以「未定位」狀態 render 一瞬間掉到頁面流底部（飛很遠）
  updateDropdownPos(slug)
  activeDropdown.value = slug
  await ensureChildren(slug)
  await nextTick()
  // 子項載入後尺寸可能變，重量一次確保置中正確
  updateDropdownPos(slug)
}

// 開啟時隨捲動/縮放重新定位，讓下拉持續貼齊導航項
const repositionDropdown = () => {
  if (activeDropdown.value) updateDropdownPos(activeDropdown.value)
}
onMounted(() => {
  window.addEventListener('scroll', repositionDropdown, { passive: true })
  window.addEventListener('resize', repositionDropdown)
})
onUnmounted(() => {
  window.removeEventListener('scroll', repositionDropdown)
  window.removeEventListener('resize', repositionDropdown)
})

const onNavWrapperLeave = () => {
  closeTimer = setTimeout(() => { activeDropdown.value = null }, 150)
}

const onDropdownEnter = () => {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
}

const onDropdownLeave = () => {
  closeTimer = setTimeout(() => { activeDropdown.value = null }, 150)
}

// ── Mobile flat-list（遞迴展開，N 層）────────────────────────────────────────
const expandedSlugs = ref(new Set<string>())

const flatMobileItems = computed(() => {
  const result: any[] = []
  const addLevel = (items: { slug: string; name?: string; tab?: string }[], depth: number) => {
    for (const item of items) {
      const cachedKids   = childrenCache[item.slug]
      const hasKnownKids = Array.isArray(cachedKids) && cachedKids.length > 0
      const notFetched   = !(item.slug in childrenCache)
      const isExpanded   = expandedSlugs.value.has(item.slug)
      result.push({
        slug:              item.slug,
        label:             (item as any).name || (item as any).tab || item.slug,
        depth,
        isExpanded,
        isActive:          isActive(item.slug),
        mightHaveChildren: hasKnownKids || notFetched,
      })
      if (isExpanded && hasKnownKids) {
        addLevel(cachedKids, depth + 1)
      }
    }
  }
  addLevel(props.tabs, 0)
  return result
})

const collapseWithDescendants = (slug: string, set: Set<string>) => {
  set.delete(slug)
  for (const child of childrenCache[slug] || []) {
    collapseWithDescendants(child.slug, set)
  }
}

const onMobileItemClick = async (item: any) => {
  if (!item.mightHaveChildren) {
    navigateMobile(item.slug)
    return
  }
  const next = new Set(expandedSlugs.value)
  if (next.has(item.slug)) {
    // 收合自己及所有後代
    collapseWithDescendants(item.slug, next)
    expandedSlugs.value = next
    return
  }
  // 展開：先 fetch（若尚未在 cache）
  next.add(item.slug)
  expandedSlugs.value = next
  await ensureChildren(item.slug)
  // fetch 完確認真的沒有子頁面 → 直接導頁
  if ((childrenCache[item.slug]?.length ?? 0) === 0) {
    const cleaned = new Set(expandedSlugs.value)
    cleaned.delete(item.slug)
    expandedSlugs.value = cleaned
    navigateMobile(item.slug)
  }
}

const navigateMobile = (slug: string) => {
  mobileOpen.value    = false
  expandedSlugs.value = new Set()
  navigateTo(`/${props.currentLocale}/${slug}`)
}

// ── Locale ────────────────────────────────────────────────────────────────────
const localeMenuOpen      = ref(false)
const localeBtnRef        = ref<HTMLElement | null>(null)
const localeDropdownStyle = ref<Record<string, string>>({})

const currentLocaleLabel = computed(() => {
  const found = props.locales.find(l => l.urlCode === props.currentLocale)
  return found?.label || props.currentLocale || '語言'
})

const updateLocaleDropdownPos = () => {
  if (!localeBtnRef.value) return
  const rect = localeBtnRef.value.getBoundingClientRect()
  localeDropdownStyle.value = {
    position: 'fixed',
    top:   rect.bottom + 8 + 'px',
    right: window.innerWidth - rect.right + 'px',
    zIndex: '99999',
  }
}


const handleOutsideClick = () => { localeMenuOpen.value = false; activeDropdown.value = null }
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<style scoped>
.pv-navbar {
  /* 背景色由 inline style 控制（預設 transparent）；背景圖用 CSS 變數依裝置切換 */
  background-image: var(--nav-bg-desktop, none);
  background-size: cover;
  background-position: center;
  border-bottom: 1px solid #eee;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
@media (max-width: 1024px) {
  .pv-navbar { background-image: var(--nav-bg-tablet, none); }
}
@media (max-width: 768px) {
  .pv-navbar { background-image: var(--nav-bg-mobile, none); }
}

.pv-navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: relative;
}

.pv-logo-wrapper { flex-shrink: 0; padding: 4px; }
.pv-logo { display: flex; align-items: center; gap: 8px; min-width: 80px; min-height: 40px; }
.pv-logo-image { max-width: 140px; max-height: 40px; width: auto; height: auto; object-fit: contain; }

/* Desktop nav */
.pv-nav-menu { display: flex; gap: 0.25rem; flex: 1; justify-content: center; }
.pv-nav-item-wrapper { position: relative; }

.pv-nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: inherit;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.8;
}
.pv-nav-item:hover, .pv-nav-item.active { opacity: 1; color: #0891B2; }
.pv-nav-item.active { font-weight: 600; }

.pv-nav-chevron { transition: transform 0.2s; flex-shrink: 0; }
.pv-nav-chevron.open { transform: rotate(180deg); }

/* Desktop dropdown wrapper：position/top/left 由 dropdownStyle 控制，
   translateX(-50%) 由 .ndm--portal 負責，這裡不能重複加 */

.nav-dropdown-enter-active { transition: opacity 0.18s cubic-bezier(0.4,0,0.2,1); }
.nav-dropdown-leave-active { transition: opacity 0.12s cubic-bezier(0.4,0,0.2,1); }
.nav-dropdown-enter-from, .nav-dropdown-leave-to { opacity: 0; }

/* Right actions */
.pv-nav-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.pv-locale-wrapper { position: relative; }

.pv-locale-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border: 1.5px solid #ddd;
  border-radius: 20px;
  background: transparent;
  color: #555;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}
.pv-locale-btn:hover { border-color: #0891B2; color: #0891B2; }
.pv-locale-label { font-size: 13px; }
.pv-chevron { transition: transform 0.2s; }
.pv-chevron.open { transform: rotate(180deg); }

.pv-locale-dropdown {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  overflow: hidden;
  min-width: 100px;
}
.pv-locale-option {
  display: block;
  width: 100%;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  text-decoration: none;
}
.pv-locale-option:hover { background: #f9fafb; }
.pv-locale-option.active { color: #0891B2; background: #f0f9ff; }

.locale-dropdown-enter-active { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
.locale-dropdown-leave-active { transition: all 0.15s cubic-bezier(0.4,0,0.2,1); }
.locale-dropdown-enter-from, .locale-dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

/* Login */
.pv-login-btn {
  padding: 7px 20px;
  border: 1.5px solid #0891B2;
  border-radius: 20px;
  background: transparent;
  color: #0891B2;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  text-decoration: none;
  transition: all 0.2s;
}
.pv-login-btn:hover { background: #0891B2; color: #fff; }

/* Hamburger */
.pv-hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.pv-hamburger-btn:hover { background: #f5f5f5; }
.pv-hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: #333;
  border-radius: 2px;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  transform-origin: center;
}
.pv-hamburger-btn.is-open .pv-hamburger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.pv-hamburger-btn.is-open .pv-hamburger-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
.pv-hamburger-btn.is-open .pv-hamburger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile menu */
.pv-mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 300;
}

.pv-mobile-nav { padding: 8px 0; }

.pv-mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  color: inherit;
  font-size: 15px;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: all 0.18s;
  cursor: pointer;
}

/* 子層：背景略深、字體縮小；padding-left 由 inline style 控制 */
.pv-mobile-nav-item.is-child {
  font-size: 14px;
  font-weight: 400;
  color: #555;
  background: #fafafa;
  border-left-color: #f0e8e5;
}

.pv-mobile-nav-item:hover,
.pv-mobile-nav-item.active {
  color: #0891B2;
  background: #f0f9ff;
  border-left-color: #0891B2;
}
.pv-mobile-nav-item.active { font-weight: 600; }

.pv-mobile-arrow { flex-shrink: 0; transition: transform 0.2s; }
.pv-mobile-arrow.rotated { transform: rotate(180deg); }

.pv-mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 24px 20px;
  border-top: 1px solid #f0f0f0;
}

.pv-mobile-login-btn {
  width: 100%;
  padding: 10px 16px;
  background: #0891B2;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  text-align: center;
  transition: background 0.2s;
}
.pv-mobile-login-btn:hover { background: #0E7490; }

.pv-mobile-locale { display: flex; gap: 8px; flex-wrap: wrap; }
.pv-mobile-locale-btn {
  padding: 7px 14px;
  border: 1.5px solid #ddd;
  border-radius: 16px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  text-decoration: none;
}
.pv-mobile-locale-btn:hover,
.pv-mobile-locale-btn.active { border-color: #0891B2; color: #0891B2; }
.pv-mobile-locale-btn.active { background: #f0f9ff; font-weight: 600; }

.mobile-menu-enter-active { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
.mobile-menu-leave-active { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
