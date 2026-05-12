<template>
  <footer class="pv-footer" :class="`device-${store.currentDevice}`" :style="footerStyle">
    <div class="pv-footer-container">

      <!-- 上方：Logo + 聯絡電話 -->
      <div class="pv-footer-top">
        <div class="pv-footer-brand">
          <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="pv-logo-img" />
          <span v-else class="pv-logo-icon">
            <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#0891B2"/>
              <text x="14" y="20" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">宮</text>
            </svg>
          </span>
          <span v-if="displayName" class="pv-logo-name">{{ displayName }}</span>
        </div>
        <div v-if="displayPhone" class="pv-footer-phone">
          <span class="pv-phone-label">聯絡電話</span>
          <span class="pv-phone-num">{{ displayPhone }}</span>
        </div>
      </div>

      <div class="pv-footer-divider" />

      <!-- 中間：連結欄 + 聯絡資訊欄 -->
      <div class="pv-footer-links-area">
        <div v-for="(column, colIndex) in columns" :key="colIndex" class="pv-footer-col">
          <a v-for="item in column" :key="item" href="#" class="pv-footer-link">{{ item }}</a>
        </div>

        <div v-if="displayAddress || displayEmail" class="pv-footer-col pv-footer-col--contact">
          <span v-if="displayAddress" class="pv-footer-link pv-footer-info">{{ displayAddress }}</span>
          <span v-if="displayEmail"   class="pv-footer-link pv-footer-info">{{ displayEmail }}</span>
        </div>
      </div>

      <div class="pv-footer-divider" />

      <!-- 下方：版權 -->
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
  background: #06082d;
  color: var(--pv-footer-text, rgba(255, 255, 255, 0.82));
  word-break: keep-all;
  overflow-wrap: break-word;
}

.pv-footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 3rem;
}

// ── 上方列：Logo + 電話 ──
.pv-footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 2rem;
}

.pv-footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pv-logo-img {
  max-width: 130px;
  max-height: 40px;
  object-fit: contain;
}

.pv-logo-icon { display: flex; align-items: center; flex-shrink: 0; }

.pv-logo-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--pv-footer-text, #fff);
}

.pv-footer-phone {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pv-phone-label {
  font-size: 13px;
  font-weight: 600;
  color: #0891B2;
  white-space: nowrap;
}

.pv-phone-num {
  font-size: 15px;
  font-weight: 600;
  color: var(--pv-footer-text, #fff);
  white-space: nowrap;
}

// ── 分隔線 ──
.pv-footer-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

// ── 連結區 ──
.pv-footer-links-area {
  display: flex;
  gap: 3rem;
  padding: 2rem 0;
}

.pv-footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.pv-footer-col--contact {
  flex: 1.4;
}

.pv-footer-link {
  font-size: 14px;
  color: var(--pv-footer-text, rgba(255, 255, 255, 0.65));
  text-decoration: none;
  line-height: 1.5;
  transition: color 0.18s;
  white-space: nowrap;

  &:hover { color: var(--pv-footer-text, #fff); }
}

.pv-footer-info {
  cursor: default;
  white-space: normal;
  &:hover { color: var(--pv-footer-text, rgba(255, 255, 255, 0.65)); }
}

// ── 底部版權 ──
.pv-footer-bottom {
  padding: 1.5rem 0 0;

  p {
    margin: 0;
    font-size: 13px;
    color: var(--pv-footer-text, rgba(255, 255, 255, 0.38));
  }
}

// ── 平板 ──
.pv-footer.device-tablet {
  .pv-footer-container { padding: 2rem 1.5rem; }
  .pv-footer-links-area { gap: 2rem; }
  .pv-logo-name { font-size: 15px; }
  .pv-footer-link { font-size: 13px; }
}

// ── 手機 ──
.pv-footer.device-mobile {
  .pv-footer-container { padding: 1.75rem 1.25rem; }
  .pv-footer-top { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .pv-footer-links-area {
    flex-wrap: wrap;
    gap: 1.5rem;
    .pv-footer-col { flex: 0 0 calc(50% - 0.75rem); }
  }
  .pv-logo-name { font-size: 15px; }
  .pv-footer-link { font-size: 13px; }
  .pv-footer-bottom { p { font-size: 12px; } }
}
</style>
