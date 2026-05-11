<template>
  <div class="sys-frame-wrap" :data-type="frameType">
    <!-- HEADER -->
    <div v-if="isHeader" class="sys-navbar" :style="navbarStyle">
      <div class="sys-navbar-inner">
        <div class="sys-logo">
          <img v-if="frameData.logoSrc" :src="frameData.logoSrc" class="sys-logo-img" />
          <span v-else class="sys-logo-text">{{ frameData.siteName || 'LOGO' }}</span>
        </div>
        <nav class="sys-nav">
          <span
            v-for="tab in tabs"
            :key="tab.slug"
            class="sys-nav-item"
            :class="{ active: tab.slug === currentPageSlug }"
            @click="$emit('change-page', tab.slug)"
          >{{ tab.name || tab.tab || tab.slug }}</span>
        </nav>
      </div>
    </div>

    <!-- FOOTER -->
    <div v-else-if="isFooter" class="sys-footer" :style="footerStyle">
      <div class="sys-footer-inner">
        <p class="sys-footer-text">{{ frameData.footerText || frameData.copyright || '© 版權所有' }}</p>
      </div>
    </div>

    <!-- 其他功能總覽 (CAROUSEL_WALL, INDEX_NEWS, INDEX_PRODUCT ...) -->
    <div v-else class="sys-placeholder">
      <span class="sys-placeholder-label">系統區塊・{{ frameType }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  frameType:       { type: String, required: true },
  frameData:       { type: Object, default: () => ({}) },
  currentPageSlug: { type: String, default: null },
  device:          { type: String, default: 'desktop' },
})

defineEmits(['change-page'])

const HEADER_TYPES = ['HEADER', 'PV_HEADER']
const FOOTER_TYPES = ['FOOTER', 'PV_FOOTER']

const isHeader = computed(() => HEADER_TYPES.includes(props.frameType))
const isFooter = computed(() => FOOTER_TYPES.includes(props.frameType))

const tabs = computed(() => props.frameData?.tabs || props.frameData?.navItems || [])

const navbarStyle = computed(() => ({
  backgroundColor: props.frameData?.navBgColor || props.frameData?.bgColor || '#ffffff',
  color: props.frameData?.navTextColor || props.frameData?.textColor || '#333333',
}))

const footerStyle = computed(() => ({
  backgroundColor: props.frameData?.footerBgColor || '#1a1a1a',
  color: props.frameData?.footerTextColor || '#ffffff',
}))
</script>

<style scoped>
.sys-frame-wrap { width: 100%; }

/* Navbar */
.sys-navbar { width: 100%; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.sys-navbar-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 64px; }
.sys-logo { display: flex; align-items: center; }
.sys-logo-img { height: 40px; object-fit: contain; }
.sys-logo-text { font-size: 20px; font-weight: 700; }
.sys-nav { display: flex; gap: 24px; }
.sys-nav-item { font-size: 14px; cursor: pointer; opacity: 0.7; transition: opacity 0.15s; }
.sys-nav-item:hover, .sys-nav-item.active { opacity: 1; font-weight: 600; }

/* Footer */
.sys-footer { width: 100%; padding: 40px 0; }
.sys-footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; text-align: center; }
.sys-footer-text { font-size: 13px; opacity: 0.7; margin: 0; }

/* Placeholder */
.sys-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  background: repeating-linear-gradient(
    45deg,
    #f8f8f8,
    #f8f8f8 6px,
    #f0f0f0 6px,
    #f0f0f0 12px
  );
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
