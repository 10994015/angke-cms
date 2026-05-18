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
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.slug"
          :to="`/${currentLocale}/${tab.slug}`"
          class="pv-nav-item"
          :class="{ active: tab.slug === currentSlug }"
        >{{ tab.name }}</NuxtLink>
      </nav>

      <!-- Right actions (desktop) -->
      <div v-if="!isMobile" class="pv-nav-actions">
        <a class="pv-login-btn" :href="`${loginUrl}/login`">登入</a>

        <div v-if="locales.length >= 1" class="pv-locale-wrapper" @click.stop>
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

    <!-- Mobile dropdown -->
    <Transition name="mobile-menu">
      <div v-if="isMobile && mobileOpen" class="pv-mobile-menu">
        <nav class="pv-mobile-nav">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.slug"
            :to="`/${currentLocale}/${tab.slug}`"
            class="pv-mobile-nav-item"
            :class="{ active: tab.slug === currentSlug }"
            @click="mobileOpen = false"
          >{{ tab.name }}</NuxtLink>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  frameData:     Record<string, any>
  currentLocale: string
  locales:       { locale: string; label: string; urlCode: string }[]
  tabs:          { slug: string; name: string }[]
  currentSlug:   string
}>()

const config      = useRuntimeConfig()
const defaultSlug = config.public.defaultSlug
const loginUrl    = config.public.loginUrl

const mobileOpen    = ref(false)
const localeMenuOpen = ref(false)
const localeBtnRef   = ref<HTMLElement | null>(null)

const isMobile = ref(false)
const updateMobile = () => { isMobile.value = window.innerWidth <= 768 }
onMounted(() => { updateMobile(); window.addEventListener('resize', updateMobile) })
onUnmounted(() => { window.removeEventListener('resize', updateMobile) })

const logoSrc = computed(() => props.frameData.logoImgUrl || props.frameData.logoImgSrc || null)

const navbarBgStyle = computed(() => ({
  backgroundColor: props.frameData.navBgColor || props.frameData.bgColor || '#ffffff',
  color: props.frameData.navTextColor || props.frameData.textColor || '#333333',
}))

const currentLocaleLabel = computed(() => {
  const found = props.locales.find(l => l.urlCode === props.currentLocale)
  return found?.label || props.currentLocale || '語言'
})

const localeDropdownStyle = ref({})

const updateDropdownPos = () => {
  if (!localeBtnRef.value) return
  const rect = localeBtnRef.value.getBoundingClientRect()
  localeDropdownStyle.value = {
    position: 'fixed',
    top:   rect.bottom + 8 + 'px',
    right: window.innerWidth - rect.right + 'px',
    zIndex: '99999',
  }
}

watch(localeMenuOpen, (open) => { if (open) nextTick(updateDropdownPos) })

const handleOutsideClick = () => { localeMenuOpen.value = false }
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.pv-navbar {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
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
.pv-logo-icon { display: flex; align-items: center; }

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
}
.pv-nav-item:hover, .pv-nav-item.active { opacity: 1; color: #0891B2; }
.pv-nav-item.active { font-weight: 600; }

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
  border: none;
  background: transparent;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  text-decoration: none;
}
.pv-locale-option:hover { background: #f9fafb; }
.pv-locale-option.active { color: #0891B2; background: #f0f9ff; }

.locale-dropdown-enter-active { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
.locale-dropdown-leave-active { transition: all 0.15s cubic-bezier(0.4,0,0.2,1); }
.locale-dropdown-enter-from, .locale-dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

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
  padding: 14px 24px;
  color: inherit;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: all 0.18s;
}
.pv-mobile-nav-item:hover, .pv-mobile-nav-item.active {
  color: #0891B2;
  background: #f0f9ff;
  border-left-color: #0891B2;
}
.pv-mobile-nav-item.active { font-weight: 600; }

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
  &:hover { background: #0891B2; color: #fff; }
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
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
  &:hover { background: #0E7490; }
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
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  text-decoration: none;
}
.pv-mobile-locale-btn:hover, .pv-mobile-locale-btn.active { border-color: #0891B2; color: #0891B2; }
.pv-mobile-locale-btn.active { background: #f0f9ff; font-weight: 600; }

.mobile-menu-enter-active { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
.mobile-menu-leave-active { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
