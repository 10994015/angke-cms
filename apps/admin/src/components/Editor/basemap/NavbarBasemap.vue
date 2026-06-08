<template>
  <header class="pv-navbar">
    <div class="pv-navbar-container">

      <!-- Logo 區域 -->
      <div
        class="pv-logo-wrapper"
        :class="{ 'is-selected': isLogoSelected, 'is-clickable': !!props.frame }"
        :title="props.frame ? '點擊編輯 Logo' : ''"
        @click.stop="handleLogoClick"
      >
        <div class="pv-logo">
          <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="pv-logo-image" />
          <span v-else class="pv-logo-placeholder">請上傳 Logo</span>
        </div>
        <div v-if="props.frame" class="pv-logo-edit-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
      </div>

      <!-- 桌機導航 -->
      <nav v-if="isDesktop" class="pv-nav-menu">
        <div
          v-for="tab in enrichedTabs"
          :key="tab.slug"
          class="pv-nav-item-wrapper"
          :ref="(el) => { if (el) navWrapperRefs[tab.slug] = el; else delete navWrapperRefs[tab.slug] }"
          @mouseenter="onTopNavEnter(tab.slug)"
          @mouseleave="onNavWrapperLeave"
        >
          <a
            href="#"
            class="pv-nav-item"
            :class="{ active: isSlugActive(tab.slug) }"
            @click.prevent="onNavItemClick(tab.slug)"
          >
            {{ tab.name }}
            <svg v-if="hasChildren(tab.slug)" class="pv-nav-chevron" :class="{ open: activeDropdownSlug === tab.slug }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
        </div>
      </nav>

      <Teleport to="body">
        <transition name="nav-dropdown">
          <div
            v-if="activeDropdownSlug && hasChildren(activeDropdownSlug)"
            class="pv-nav-dropdown-portal"
            :style="{ position: 'fixed', top: dropdownPortalPos.top, left: dropdownPortalPos.left, zIndex: 99999 }"
            @mouseenter="onDropdownPortalEnter"
            @mouseleave="onDropdownPortalLeave"
          >
            <NavDropdownMenu
              :items="getChildren(activeDropdownSlug)"
              :depth="0"
              :is-portal="true"
            />
          </div>
        </transition>
      </Teleport>

      <!-- 桌機右側：登入 + 語言切換 -->
      <div v-if="isDesktop" class="pv-nav-actions">
        <button class="pv-login-btn disabled">登入</button>

        <div v-if="localeOptions.length > 1" class="pv-locale-wrapper" @click.stop>
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
            <transition name="locale-dropdown">
              <div v-if="localeMenuOpen" class="pv-locale-dropdown" :style="dropdownStyle" @click.stop>
                <button
                  v-for="loc in localeOptions"
                  :key="loc.locale"
                  class="pv-locale-option"
                  :class="{ active: loc.locale === store.currentLocale }"
                  @click="handleLocaleChange(loc.locale)"
                >{{ loc.label }}</button>
              </div>
            </transition>
          </Teleport>
        </div>
      </div>

      <!-- 漢堡按鈕（非桌機） -->
      <button
        v-if="!isDesktop"
        class="pv-hamburger-btn"
        :class="{ 'is-open': mobileMenuOpen }"
        @click.stop="mobileMenuOpen = !mobileMenuOpen"
      >
        <span class="pv-hamburger-line" />
        <span class="pv-hamburger-line" />
        <span class="pv-hamburger-line" />
      </button>
    </div>

    <!-- 行動版下拉選單 -->
    <template v-if="!isDesktop">
      <transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="pv-mobile-menu" @click.stop>
          <nav class="pv-mobile-nav">
            <template v-for="item in flatMobileItems" :key="item.slug + '-' + item.depth">
              <a
                href="#"
                class="pv-mobile-nav-item"
                :class="{
                  active: item.isActive,
                  expanded: item.isExpanded,
                  'is-child': item.depth > 0,
                }"
                :style="item.depth > 0 ? { paddingLeft: `${24 + item.depth * 16}px` } : {}"
                @click.prevent="onMobileItemClick(item)"
              >
                <span>{{ item.label }}</span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  :class="['mobile-nav-arrow', { rotated: item.isExpanded }]"
                >
                  <!-- Show down-chevron if might have children, right-arrow if leaf -->
                  <polyline v-if="item.mightHaveChildren" points="6 9 12 15 18 9"/>
                  <polyline v-else points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </template>
          </nav>

          <div class="pv-mobile-actions">
            <button class="pv-mobile-login-btn disabled">登入</button>
            <div v-if="localeOptions.length > 1" class="pv-mobile-locale">
              <button
                v-for="loc in localeOptions"
                :key="loc.locale"
                class="pv-mobile-locale-btn"
                :class="{ active: loc.locale === store.currentLocale }"
                @click="handleLocaleChange(loc.locale)"
              >{{ loc.label }}</button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="overlay-fade">
        <div v-if="mobileMenuOpen" class="pv-menu-overlay" @click="mobileMenuOpen = false" />
      </transition>
    </template>
  </header>
</template>

<script setup>
import { ref, computed, watch, provide, onMounted, onUnmounted } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'
import NavDropdownMenu from './NavDropdownMenu.vue'

const props = defineProps({
  frameData: { type: Object, default: () => ({}) },
  frame:     { type: Object, default: null },
})

const store = usePageEditorStore()

const isDesktop      = computed(() => store.currentDevice === 'desktop')
const mobileMenuOpen = ref(false)
const localeMenuOpen = ref(false)
const localeBtnRef   = ref(null)
const activeDropdownSlug = ref(null)
const dropdownPortalPos  = ref({ top: '0px', left: '0px' })
const navWrapperRefs     = {}
let   closeTimer         = null

// ── Children cache (slug → [{tab, slug}]) ──────────────────────────────────

const childrenCache = ref({})

// Recursively populate cache from pageTree (which may already have deep children)
const populateFromTree = (nodes) => {
  for (const n of nodes || []) {
    if (n.slug && Array.isArray(n.children) && !(n.slug in childrenCache.value)) {
      childrenCache.value[n.slug] = n.children.map(c => ({
        tab: c.tab || c.seoTitle || c.slug,
        slug: c.slug,
      }))
      populateFromTree(n.children)
    }
  }
}

watch(() => store.pageTree, (tree) => {
  childrenCache.value = {}  // 語系切換時清除舊快取
  populateFromTree(tree)
}, { immediate: true, deep: true })

const getChildren = (slug) => childrenCache.value[slug] ?? []
const hasChildren  = (slug) => (childrenCache.value[slug]?.length ?? 0) > 0

const ensureChildren = async (slug) => {
  if (slug in childrenCache.value) return
  const children = await store.fetchPageChildren(slug)
  childrenCache.value[slug] = children
}

// ── Active state (recursive) ───────────────────────────────────────────────

const isSlugActive = (slug) => {
  const cur = store.currentPageSlug
  if (!cur) return false
  if (slug === cur) return true
  const checkKids = (kids) => {
    for (const c of kids || []) {
      if (c.slug === cur || checkKids(childrenCache.value[c.slug])) return true
    }
    return false
  }
  return checkKids(childrenCache.value[slug])
}

// ── Provide shared state to NavDropdownMenu ────────────────────────────────

provide('navDropdownState', {
  getChildren,
  hasChildren,
  ensureChildren,
  isActive: isSlugActive,
  navigate: (slug) => {
    store.loadPageContent(slug)
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
    activeDropdownSlug.value = null
  },
})

// ── Logo ───────────────────────────────────────────────────────────────────

const logoSrc      = computed(() => props.frameData.logoImgSrc || null)
const isLogoSelected = computed(() => !!props.frame && store.selected.frame === props.frame)

const handleLogoClick = () => {
  if (!props.frame) return
  store.selectFrame(props.frame)
}

// ── Tabs ───────────────────────────────────────────────────────────────────

const slugLabelMap = computed(() => {
  const map = {}
  const flatten = (nodes) => {
    for (const n of nodes || []) {
      map[n.slug] = n.tab || n.seoTitle || n.slug
      if (n.children?.length) flatten(n.children)
    }
  }
  flatten(store.pageTree)
  return map
})

const tabs = computed(() =>
  (props.frameData.tabs || props.frameData.tab || [])
    .filter(t => t.slug !== 'portal' && t.name !== '入口頁')
    .map(t => ({
      slug: t.slug,
      name: slugLabelMap.value[t.slug] || t.name || t.slug,
    }))
)

const enrichedTabs = computed(() =>
  tabs.value.map(tab => ({ ...tab, children: getChildren(tab.slug) }))
)

watch(tabs, (val) => {
  console.log('[Navbar] locale =', store.currentLocale, ', tabs =', JSON.parse(JSON.stringify(val)))
})

// ── Desktop nav hover ──────────────────────────────────────────────────────

const onTopNavEnter = async (slug) => {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
  activeDropdownSlug.value = slug
  const el = navWrapperRefs[slug]
  if (el) {
    const rect = el.getBoundingClientRect()
    dropdownPortalPos.value = { top: rect.bottom + 4 + 'px', left: rect.left + rect.width / 2 + 'px' }
  }
  await ensureChildren(slug)
}

const onNavWrapperLeave = () => {
  closeTimer = setTimeout(() => { activeDropdownSlug.value = null }, 150)
}

const onDropdownPortalEnter = () => {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
}

const onDropdownPortalLeave = () => {
  closeTimer = setTimeout(() => { activeDropdownSlug.value = null }, 150)
}

const onNavItemClick = (slug) => {
  store.loadPageContent(slug)
  if (hasChildren(slug)) {
    if (activeDropdownSlug.value === slug) {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
      activeDropdownSlug.value = null
    } else {
      activeDropdownSlug.value = slug
      const el = navWrapperRefs[slug]
      if (el) {
        const rect = el.getBoundingClientRect()
        dropdownPortalPos.value = { top: rect.bottom + 4 + 'px', left: rect.left + rect.width / 2 + 'px' }
      }
    }
  } else {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
    activeDropdownSlug.value = null
  }
}

// ── Mobile flat-list ───────────────────────────────────────────────────────

const expandedSlugs = ref(new Set())

const flatMobileItems = computed(() => {
  const result = []
  const addLevel = (items, depth) => {
    for (const item of items) {
      const cachedKids = childrenCache.value[item.slug]
      const hasKnownKids  = Array.isArray(cachedKids) && cachedKids.length > 0
      const notFetched    = !(item.slug in childrenCache.value)
      const isExpanded    = expandedSlugs.value.has(item.slug)
      result.push({
        slug:             item.slug,
        label:            item.tab || item.name || item.slug,
        depth,
        isExpanded,
        isActive:         isSlugActive(item.slug),
        mightHaveChildren: hasKnownKids || notFetched,
      })
      if (isExpanded && hasKnownKids) {
        addLevel(cachedKids, depth + 1)
      }
    }
  }
  addLevel(enrichedTabs.value, 0)
  return result
})

const collapseWithDescendants = (slug, set) => {
  set.delete(slug)
  for (const child of childrenCache.value[slug] || []) {
    collapseWithDescendants(child.slug, set)
  }
}

const onMobileItemClick = async (item) => {
  if (!item.mightHaveChildren) {
    navigateMobile(item.slug)
    return
  }
  const next = new Set(expandedSlugs.value)
  if (next.has(item.slug)) {
    collapseWithDescendants(item.slug, next)
    expandedSlugs.value = next
    return
  }
  // Expand: fetch children first if unknown
  next.add(item.slug)
  expandedSlugs.value = next
  await ensureChildren(item.slug)
  // If after fetching it has no children → navigate instead
  if (childrenCache.value[item.slug]?.length === 0) {
    const cleaned = new Set(expandedSlugs.value)
    cleaned.delete(item.slug)
    expandedSlugs.value = cleaned
    navigateMobile(item.slug)
  }
}

const navigateMobile = (slug) => {
  mobileMenuOpen.value = false
  expandedSlugs.value  = new Set()
  store.loadPageContent(slug)
}

// ── Locale ─────────────────────────────────────────────────────────────────

const LOCALE_LABEL_MAP = { 'ZH-TW': '繁中', 'ZH-CN': '简中', 'EN-US': 'EN' }

const localeOptions = computed(() =>
  (store.locales || []).map(l => ({
    locale: l.locale,
    label:  l.label || LOCALE_LABEL_MAP[l.locale] || l.locale,
  }))
)

const currentLocaleLabel = computed(() => {
  const found = localeOptions.value.find(l => l.locale === store.currentLocale)
  return found?.label || LOCALE_LABEL_MAP[store.currentLocale] || store.currentLocale || '繁中'
})

const dropdownStyle = ref({ position: 'fixed', zIndex: 99999, top: '-9999px', right: '0px' })

const updateLocaleDropdownPos = () => {
  if (!localeBtnRef.value) return
  const rect = localeBtnRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    zIndex: 99999,
    top:   rect.bottom + 8 + 'px',
    right: window.innerWidth - rect.right + 'px',
  }
}

const handleLocaleChange = (locale) => {
  localeMenuOpen.value = false
  mobileMenuOpen.value = false
  store.reloadCurrentPage(locale)
}

const handleOutsideClick = () => {
  localeMenuOpen.value = false
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
  activeDropdownSlug.value = null
}
onMounted(()   => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<style scoped lang="scss">
.pv-navbar {
  background: transparent;
  border-bottom: 1px solid #eee;
  padding: 0 2rem;
  position: relative;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
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

// ── Logo ──
.pv-logo-wrapper {
  flex-shrink: 0;
  padding: 4px;
  position: relative;
  border-radius: 6px;
  transition: outline 0.15s;

  &.is-clickable {
    cursor: pointer;
    &:hover {
      outline: 2px dashed #0891B2;
      outline-offset: 2px;
      .pv-logo-edit-hint { opacity: 1; }
    }
  }

  &.is-selected {
    outline: 2px solid #0891B2;
    outline-offset: 2px;
    background: rgba(8, 145, 178, 0.05);
    .pv-logo-edit-hint { opacity: 1; }
  }
}

.pv-logo-edit-hint {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: #0891B2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
  svg { color: #fff; }
}

.pv-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  min-height: 40px;
}

.pv-logo-image {
  max-width: 140px;
  max-height: 40px;
  width: auto;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.pv-logo-icon { flex-shrink: 0; display: flex; align-items: center; }

.pv-logo-placeholder {
  font-size: 12px;
  color: #9ca3af;
  border: 1.5px dashed #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  white-space: nowrap;
}

// ── 桌機導航 ──
.pv-nav-menu {
  display: flex;
  gap: 0.25rem;
  flex: 1;
  justify-content: center;
}

.pv-nav-item-wrapper {
  position: relative;
}

.pv-nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #444;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { color: #0891B2; }
  &.active { color: #0891B2; font-weight: 600; }
}

.pv-nav-chevron {
  width: 12px;
  height: 12px;
  transition: transform 0.2s;
  &.open { transform: rotate(180deg); }
}

// ── 右側操作 ──
.pv-nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.pv-login-btn {
  padding: 7px 20px;
  border: 1.5px solid #0891B2;
  border-radius: 20px;
  background: transparent;
  color: #0891B2;
  font-size: 14px;
  font-weight: 500;
  cursor: not-allowed;
  opacity: 0.6;
  white-space: nowrap;
  font-family: inherit;
}

// ── 語言切換 ──
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

  &:hover { border-color: #0891B2; color: #0891B2; }
}

.pv-locale-label { font-size: 13px; }

.pv-chevron {
  transition: transform 0.2s;
  &.open { transform: rotate(180deg); }
}

.pv-locale-dropdown {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  min-width: 100px;
}

.pv-locale-option {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;

  &:hover { background: #f9fafb; }
  &.active { color: #0891B2; background: #f0f9ff; }
}

// ── 漢堡 ──
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

  &:hover { background: #f5f5f5; }

  &.is-open {
    .pv-hamburger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .pv-hamburger-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .pv-hamburger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  }
}

.pv-hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: #333;
  border-radius: 2px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

// ── 行動版選單 ──
.pv-mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 300;
  overflow: hidden;
}

.pv-mobile-nav { padding: 8px 0; }

.pv-mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  color: #444;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: all 0.18s;
  cursor: pointer;

  &.is-child {
    font-size: 14px;
    font-weight: 400;
    color: #555;
    background: #fafafa;
    border-left-color: #f0e8e5;
  }

  &:hover { color: #0891B2; background: #f0f9ff; border-left-color: #0891B2; }
  &.active { color: #0891B2; background: #f0f9ff; border-left-color: #0891B2; font-weight: 600; }
}

.mobile-nav-arrow {
  flex-shrink: 0;
  transition: transform 0.2s;
  &.rotated { transform: rotate(180deg); }
}

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
  opacity: 0.6;
  cursor: not-allowed;
  font-family: inherit;
}

.pv-mobile-locale {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pv-mobile-locale-btn {
  padding: 7px 14px;
  border: 1.5px solid #ddd;
  border-radius: 16px;
  background: transparent;
  color: #555;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;

  &:hover { border-color: #0891B2; color: #0891B2; }
  &.active { border-color: #0891B2; color: #0891B2; background: #f0f9ff; font-weight: 600; }
}

.pv-menu-overlay {
  position: fixed;
  inset: 0;
  top: 64px;
  background: rgba(0, 0, 0, 0.2);
  z-index: 150;
}

// ── 動畫 ──
.nav-dropdown-enter-active { transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1); }
.nav-dropdown-leave-active { transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1); }
.nav-dropdown-enter-from   { opacity: 0; transform: translateY(-6px); }
.nav-dropdown-leave-to     { opacity: 0; transform: translateY(-4px); }

.mobile-menu-enter-active { transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.mobile-menu-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.mobile-menu-enter-from   { opacity: 0; transform: translateY(-12px); }
.mobile-menu-leave-to     { opacity: 0; transform: translateY(-8px); }

.locale-dropdown-enter-active { transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1); }
.locale-dropdown-leave-active { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
.locale-dropdown-enter-from   { opacity: 0; transform: translateY(-6px); }
.locale-dropdown-leave-to     { opacity: 0; transform: translateY(-4px); }

.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.2s; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

</style>
