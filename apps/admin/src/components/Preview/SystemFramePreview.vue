<template>
  <div class="sys-frame-wrap" :data-type="frameType">

    <!-- ── HEADER ── -->
    <header v-if="isHeader" class="pv-navbar" :style="navbarBgStyle">
      <div class="pv-navbar-container">

        <!-- Logo -->
        <div class="pv-logo-wrapper">
          <div class="pv-logo">
            <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="pv-logo-image" />
            <span v-else class="pv-logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill="#0891B2"/>
                <text x="14" y="20" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">宮</text>
              </svg>
            </span>
          </div>
        </div>

        <!-- Desktop nav -->
        <nav v-if="!isMobile" class="pv-nav-menu">
          <a
            v-for="tab in visibleTabs"
            :key="tab.slug"
            href="#"
            class="pv-nav-item"
            :class="{ active: tab.slug === currentPageSlug }"
            @click.prevent="$emit('change-page', tab.slug)"
          >{{ tab.name }}</a>
        </nav>

        <!-- Right actions (desktop) -->
        <div v-if="!isMobile" class="pv-nav-actions">
          <button class="pv-login-btn" disabled>登入</button>

          <div v-if="locales.length > 1" class="pv-locale-wrapper" @click.stop>
            <button ref="localeBtnRef" class="pv-locale-btn" @click="localeMenuOpen = !localeMenuOpen">
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
                <div v-if="localeMenuOpen" class="pv-locale-dropdown" :style="localeDropdownStyle" @click.stop>
                  <button
                    v-for="loc in locales"
                    :key="loc.locale"
                    class="pv-locale-option"
                    :class="{ active: loc.locale === currentLocale }"
                    @click="onLocaleChange(loc.locale)"
                  >{{ loc.label }}</button>
                </div>
              </transition>
            </Teleport>
          </div>
        </div>

        <!-- Hamburger (mobile/tablet) -->
        <button v-if="isMobile" class="pv-hamburger-btn" :class="{ 'is-open': mobileOpen }" @click="mobileOpen = !mobileOpen">
          <span class="pv-hamburger-line" />
          <span class="pv-hamburger-line" />
          <span class="pv-hamburger-line" />
        </button>
      </div>

      <!-- Mobile dropdown -->
      <transition name="mobile-menu">
        <div v-if="isMobile && mobileOpen" class="pv-mobile-menu">
          <nav class="pv-mobile-nav">
            <a
              v-for="tab in visibleTabs"
              :key="tab.slug"
              href="#"
              class="pv-mobile-nav-item"
              :class="{ active: tab.slug === currentPageSlug }"
              @click.prevent="$emit('change-page', tab.slug); mobileOpen = false"
            >{{ tab.name }}</a>
          </nav>
          <div class="pv-mobile-actions">
            <button class="pv-mobile-login-btn" disabled>登入</button>
            <div v-if="locales.length > 1" class="pv-mobile-locale">
              <button
                v-for="loc in locales"
                :key="loc.locale"
                class="pv-mobile-locale-btn"
                :class="{ active: loc.locale === currentLocale }"
                @click="$emit('change-locale', loc.locale); mobileOpen = false"
              >{{ loc.label }}</button>
            </div>
          </div>
        </div>
      </transition>
    </header>

    <!-- ── FOOTER ── -->
    <footer v-else-if="isFooter" class="pv-footer" :style="footerBgStyle">
      <div class="pv-footer-container" :class="`device-${device}`">

        <div class="pv-footer-top">
          <div class="pv-footer-brand">
            <img v-if="footerLogo" :src="footerLogo" alt="Logo" class="pv-footer-logo" />
            <span v-if="displayName" class="pv-logo-name">{{ displayName }}</span>
          </div>
          <div v-if="displayPhone" class="pv-footer-phone">
            <span class="pv-phone-label">聯絡電話</span>
            <span class="pv-phone-num">{{ displayPhone }}</span>
          </div>
        </div>

        <div class="pv-footer-divider" />

        <div class="pv-footer-links-area">
          <div v-for="(col, ci) in navColumns" :key="ci" class="pv-footer-col">
            <a
              v-for="item in col"
              :key="item.slug"
              href="#"
              class="pv-footer-link"
              @click.prevent="$emit('change-page', item.slug)"
            >{{ item.label }}</a>
          </div>
          <div v-if="displayAddress || displayEmail" class="pv-footer-col pv-footer-col--contact">
            <span v-if="displayAddress" class="pv-footer-link pv-footer-info">{{ displayAddress }}</span>
            <span v-if="displayEmail" class="pv-footer-link pv-footer-info">{{ displayEmail }}</span>
          </div>
        </div>

        <div class="pv-footer-divider" />

        <div class="pv-footer-bottom">
          <p>{{ displayCopyright }}</p>
        </div>
      </div>
    </footer>

    <!-- ── 其他系統區塊 ── -->
    <div v-else class="sys-placeholder">
      <span class="sys-placeholder-label">系統區塊・{{ frameType }}</span>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  frameType:       { type: String, required: true },
  frameData:       { type: Object, default: () => ({}) },
  currentPageSlug: { type: String, default: null },
  device:          { type: String, default: 'desktop' },
  locales:         { type: Array,  default: () => [] },
  currentLocale:   { type: String, default: '' },
  pageTabs:        { type: Array,  default: () => [] },
})

const emit = defineEmits(['change-page', 'change-locale'])

const HEADER_TYPES = ['HEADER', 'PV_HEADER']
const FOOTER_TYPES = ['FOOTER', 'PV_FOOTER']

const isHeader = computed(() => HEADER_TYPES.includes(props.frameType))
const isFooter = computed(() => FOOTER_TYPES.includes(props.frameType))
const isMobile = computed(() => props.device === 'mobile')

const mobileOpen   = ref(false)
const localeMenuOpen = ref(false)
const localeBtnRef   = ref(null)

// ── Header ──────────────────────────────────────────────────────────────────

const logoSrc = computed(() => props.frameData.logoImgSrc || null)

const navbarBgStyle = computed(() => ({
  backgroundColor: props.frameData.navBgColor || props.frameData.bgColor || '#ffffff',
  color: props.frameData.navTextColor || props.frameData.textColor || '#333333',
}))

const visibleTabs = computed(() =>
  (props.frameData.tabs || props.frameData.tab || [])
    .filter(t => t.slug !== 'portal' && t.name !== '入口頁')
    .map(t => ({ slug: t.slug, name: t.name || t.tab || t.slug }))
)

// ── Locale dropdown ──────────────────────────────────────────────────────────

const currentLocaleLabel = computed(() => {
  const found = props.locales.find(l => l.locale === props.currentLocale)
  return found?.label || props.currentLocale || '語言'
})

const localeDropdownStyle = computed(() => {
  if (!localeBtnRef.value) return {}
  const rect = localeBtnRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top:   rect.bottom + 8 + 'px',
    right: window.innerWidth - rect.right + 'px',
    zIndex: 99999,
  }
})

const onLocaleChange = (locale) => {
  localeMenuOpen.value = false
  mobileOpen.value = false
  emit('change-locale', locale)
}

const handleOutsideClick = () => { localeMenuOpen.value = false }
onMounted(()   => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

// ── Footer ──────────────────────────────────────────────────────────────────

const footerLogo    = computed(() => props.frameData.logoImgSrc || null)
const displayName   = computed(() => props.frameData.tenantName   || props.frameData.brandName   || '')
const displayPhone  = computed(() => props.frameData.tenantPhone  || null)
const displayAddress = computed(() => props.frameData.tenantAddress || null)
const displayEmail  = computed(() => props.frameData.tenantEmail  || null)

const navColumns = computed(() => {
  const tabs = props.pageTabs.filter(t => t.slug !== 'portal' && t.name !== '入口頁')
  if (!tabs.length) return []
  const mid = Math.ceil(tabs.length / 2)
  return [tabs.slice(0, mid), tabs.slice(mid)]
    .filter(c => c.length > 0)
    .map(col => col.map(t => ({ slug: t.slug, label: t.name || t.tab || t.slug })))
})

const displayCopyright = computed(() =>
  props.frameData.copyright ||
  `Copyright © ${new Date().getFullYear()} ${displayName.value} All Rights Reserved.`
)

const footerBgStyle = computed(() => {
  const s = { background: props.frameData.background || '#0a1628' }
  if (props.frameData.footerTextColor) s['--pv-footer-text'] = props.frameData.footerTextColor
  return s
})
</script>

<style scoped lang="scss">
.sys-frame-wrap { width: 100%; }

// ══════════════════════════════════════════════════════════════
// NAVBAR  (mirrors NavbarBasemap.vue)
// ══════════════════════════════════════════════════════════════

.pv-navbar {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
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

// Logo
.pv-logo-wrapper { flex-shrink: 0; padding: 4px; }
.pv-logo { display: flex; align-items: center; gap: 8px; min-width: 80px; min-height: 40px; }
.pv-logo-image { max-width: 140px; max-height: 40px; width: auto; height: auto; object-fit: contain; flex-shrink: 0; }
.pv-logo-icon { flex-shrink: 0; display: flex; align-items: center; }

// Desktop nav
.pv-nav-menu { display: flex; gap: 0.25rem; flex: 1; justify-content: center; }
.pv-nav-item {
  display: flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.8;
  &:hover { opacity: 1; color: #0891B2; }
  &.active { opacity: 1; color: #0891B2; font-weight: 600; }
}

// Right actions
.pv-nav-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

// Locale dropdown (mirrors NavbarBasemap)
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

.locale-dropdown-enter-active { transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1); }
.locale-dropdown-leave-active { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
.locale-dropdown-enter-from, .locale-dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

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

// Hamburger
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

// Mobile menu
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
}
.pv-mobile-nav { padding: 8px 0; }
.pv-mobile-nav-item {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  color: inherit;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: all 0.18s;
  cursor: pointer;
  &:hover { color: #0891B2; background: #f0f9ff; border-left-color: #0891B2; }
  &.active { color: #0891B2; background: #f0f9ff; border-left-color: #0891B2; font-weight: 600; }
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
  &:hover { border-color: #0891B2; color: #0891B2; }
  &.active { border-color: #0891B2; color: #0891B2; background: #f0f9ff; font-weight: 600; }
}

// Transition
.mobile-menu-enter-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.mobile-menu-leave-active { transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1); }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-10px); }


// ══════════════════════════════════════════════════════════════
// FOOTER  (mirrors FooterBasemap.vue)
// ══════════════════════════════════════════════════════════════

.pv-footer {
  background: #0a1628;
  color: var(--pv-footer-text, rgba(255, 255, 255, 0.82));
  word-break: keep-all;
  overflow-wrap: break-word;
}

.pv-footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 3rem;

  &.device-tablet { padding: 2rem 1.5rem; }
  &.device-mobile { padding: 1.75rem 1.25rem; }
}

.pv-footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 2rem;
  .device-mobile & { flex-direction: column; align-items: flex-start; gap: 1rem; }
}

.pv-footer-brand { display: flex; align-items: center; gap: 12px; }
.pv-footer-logo { max-width: 130px; max-height: 40px; object-fit: contain; }
.pv-logo-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--pv-footer-text, #fff);
  .device-tablet & { font-size: 15px; }
}

.pv-footer-phone { display: flex; align-items: center; gap: 10px; }
.pv-phone-label { font-size: 13px; font-weight: 600; color: #0891B2; white-space: nowrap; }
.pv-phone-num { font-size: 15px; font-weight: 600; color: var(--pv-footer-text, #fff); white-space: nowrap; }

.pv-footer-divider { border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); }

.pv-footer-links-area {
  display: flex;
  gap: 3rem;
  padding: 2rem 0;
  .device-tablet & { gap: 2rem; }
  .device-mobile & { flex-wrap: wrap; gap: 1.5rem; padding: 1.5rem 0; }
}

.pv-footer-col { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.pv-footer-col--contact { flex: 1.4; }

.pv-footer-link {
  font-size: 14px;
  color: var(--pv-footer-text, rgba(255, 255, 255, 0.65));
  text-decoration: none;
  line-height: 1.5;
  transition: color 0.18s;
  white-space: nowrap;
  cursor: pointer;
  &:hover { color: var(--pv-footer-text, #fff); }
  .device-tablet & { font-size: 13px; }
}
.pv-footer-info { cursor: default; white-space: normal; &:hover { color: var(--pv-footer-text, rgba(255,255,255,0.65)); } }

.pv-footer-bottom {
  padding: 1.5rem 0 0;
  p { margin: 0; font-size: 13px; color: var(--pv-footer-text, rgba(255, 255, 255, 0.38)); }
}


// ══════════════════════════════════════════════════════════════
// PLACEHOLDER
// ══════════════════════════════════════════════════════════════

.sys-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  background: repeating-linear-gradient(45deg, #f8f8f8, #f8f8f8 6px, #f0f0f0 6px, #f0f0f0 12px);
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}
.sys-placeholder-label {
  font-size: 12px;
  color: #9ca3af;
  background: rgba(255,255,255,0.85);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}
</style>
