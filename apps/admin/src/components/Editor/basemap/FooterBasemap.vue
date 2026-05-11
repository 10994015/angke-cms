<template>
  <footer class="pv-footer" :class="`device-${store.currentDevice}`" :style="footerStyle">
    <div class="pv-footer-container">

      <div class="pv-footer-content">

        <!-- 左側 Logo -->
        <div class="pv-footer-brand">
          <div class="pv-footer-logo">
            <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="pv-logo-img" />
            <span v-else class="pv-logo-icon">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill="#0891B2"/>
                <text x="14" y="20" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">宮</text>
              </svg>
            </span>
            <span v-if="displayName" class="pv-logo-name">{{ displayName }}</span>
          </div>
        </div>

        <!-- 中間連結欄 -->
        <div class="pv-footer-links-wrapper">
          <div v-for="(column, colIndex) in columns" :key="colIndex" class="pv-footer-column">
            <a v-for="item in column" :key="item" href="#" class="pv-footer-link">{{ item }}</a>
          </div>
        </div>

        <!-- 右側聯絡資訊 -->
        <div class="pv-footer-contact-col">
          <h4 class="pv-contact-heading">聯絡我們</h4>
          <p v-if="displayPhone"   class="pv-contact-item">電話：{{ displayPhone }}</p>
          <p v-if="displayAddress" class="pv-contact-item">地址：{{ displayAddress }}</p>
          <p v-if="displayEmail"   class="pv-contact-item">Email：{{ displayEmail }}</p>
        </div>

      </div>

      <div class="pv-footer-divider" />

      <div class="pv-footer-bottom">
        <p>{{ displayCopyright }}</p>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'

const props = defineProps({
  frameData: { type: Object, default: () => ({}) },
})

const store = usePageEditorStore()

const displayName    = computed(() => props.frameData.tenantName    || props.frameData.brandName    || '')
const displayPhone   = computed(() => props.frameData.tenantPhone   || null)
const displayAddress = computed(() => props.frameData.tenantAddress || null)
const displayEmail   = computed(() => props.frameData.tenantEmail   || null)
const logoSrc        = computed(() => props.frameData.logoImgSrc    || null)

const columns = computed(() =>
  props.frameData.columns || [
    ['關於我們', '最新消息', '服務項目'],
    ['宮廟地圖', '聯絡我們', '隱私政策'],
  ]
)

const displayCopyright = computed(() =>
  props.frameData.copyright ||
  `Copyright © ${new Date().getFullYear()} ${displayName.value} All Rights Reserved.`
)

const footerStyle = computed(() => {
  const s = {}
  if (props.frameData.footerBgColor)   s['background']       = props.frameData.footerBgColor
  if (props.frameData.footerTextColor) s['--pv-footer-text'] = props.frameData.footerTextColor
  return s
})
</script>

<style scoped lang="scss">
.pv-footer {
  background: #1e1e1e;
  color: var(--pv-footer-text, #fff);
  padding: 3rem 0 0;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.pv-footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.pv-footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr;
  gap: 4rem;
  padding-bottom: 2.5rem;
  align-items: start;
}

.pv-footer-brand { display: flex; flex-direction: column; }

.pv-footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pv-logo-img {
  max-width: 120px;
  max-height: 40px;
  object-fit: contain;
}

.pv-logo-icon { display: flex; align-items: center; flex-shrink: 0; }

.pv-logo-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--pv-footer-text, #fff);
  white-space: nowrap;
  letter-spacing: 1px;
}

.pv-footer-links-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 2rem;
}

.pv-footer-column {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.pv-footer-link {
  font-size: 14px;
  color: var(--pv-footer-text, rgba(255, 255, 255, 0.7));
  opacity: 0.75;
  text-decoration: none;
  transition: opacity 0.2s;
  white-space: nowrap;
  &:hover { opacity: 1; }
}

.pv-footer-contact-col {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.pv-contact-heading {
  font-size: 15px;
  font-weight: 600;
  color: var(--pv-footer-text, #fff);
  margin: 0 0 0.25rem;
}

.pv-contact-item {
  font-size: 14px;
  color: var(--pv-footer-text, rgba(255, 255, 255, 0.7));
  opacity: 0.75;
  margin: 0;
  line-height: 1.7;
}

.pv-footer-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.pv-footer-bottom {
  padding: 1.5rem 0;
  text-align: center;
  p {
    margin: 0;
    font-size: 13px;
    color: var(--pv-footer-text, rgba(255, 255, 255, 0.45));
    opacity: 0.6;
  }
}

// 平板
.pv-footer.device-tablet {
  padding: 2rem 0 0;
  .pv-footer-container { padding: 0 1.5rem; }
  .pv-footer-content { grid-template-columns: 1fr 2fr 1.5fr; gap: 2rem; }
  .pv-logo-name    { font-size: 17px; }
  .pv-footer-link  { font-size: 13px; }
  .pv-contact-item { font-size: 13px; }
}

// 手機
.pv-footer.device-mobile {
  padding: 1.5rem 0 0;
  .pv-footer-container { padding: 0 1.25rem; }
  .pv-footer-content {
    grid-template-columns: 1fr;
    gap: 1.75rem;
    padding-bottom: 1.5rem;
  }
  .pv-footer-links-wrapper { grid-template-columns: repeat(2, 1fr); gap: 0.75rem 1.5rem; }
  .pv-logo-name    { font-size: 17px; }
  .pv-footer-link  { font-size: 13px; }
  .pv-contact-item { font-size: 13px; }
  .pv-footer-bottom { padding: 1rem 0; p { font-size: 12px; } }
}
</style>
