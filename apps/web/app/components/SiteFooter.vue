<template>
  <footer class="pv-footer" :style="footerBgStyle">
    <div class="pv-footer-container">

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
          <NuxtLink
            v-for="item in col"
            :key="item.slug"
            :to="`${item.slug}`"
            class="pv-footer-link"
          >{{ item.label }}</NuxtLink>
        </div>
        <div v-if="displayAddress || displayEmail" class="pv-footer-col">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  frameData: Record<string, any>
  tabs:      { slug: string; name: string }[]
}>()

const footerLogo     = computed(() => props.frameData.logoImgUrl || props.frameData.logoImgSrc || null)
const displayName    = computed(() => props.frameData.tenantName  || props.frameData.brandName   || '')
const displayPhone   = computed(() => props.frameData.tenantPhone  || null)
const displayAddress = computed(() => props.frameData.tenantAddress || null)
const displayEmail   = computed(() => props.frameData.tenantEmail  || null)

const navColumns = computed(() => {
  if (!props.tabs.length) return []
  const mid = Math.ceil(props.tabs.length / 2)
  return [props.tabs.slice(0, mid), props.tabs.slice(mid)]
    .filter(c => c.length > 0)
    .map(col => col.map(t => ({ slug: t.slug, label: t.name })))
})

const displayCopyright = computed(() =>
  props.frameData.copyright ||
  `Copyright © ${new Date().getFullYear()} ${displayName.value} All Rights Reserved.`
)

const footerBgStyle = computed(() => ({
  background: props.frameData.background || '#0a1628',
  '--pv-footer-text': props.frameData.footerTextColor || 'rgba(255,255,255,0.82)',
}))
</script>

<style scoped>
.pv-footer {
  background: #0a1628;
  color: var(--pv-footer-text, rgba(255,255,255,0.82));
  word-break: keep-all;
  overflow-wrap: break-word;
}

.pv-footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 3rem;
}

.pv-footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 2rem;
}

.pv-footer-brand { display: flex; align-items: center; gap: 12px; }
.pv-footer-logo { max-width: 130px; max-height: 40px; object-fit: contain; }
.pv-logo-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--pv-footer-text, #fff);
}

.pv-footer-phone { display: flex; align-items: center; gap: 10px; }
.pv-phone-label { font-size: 13px; font-weight: 600; color: #0891B2; white-space: nowrap; }
.pv-phone-num { font-size: 15px; font-weight: 600; color: var(--pv-footer-text, #fff); white-space: nowrap; }

.pv-footer-divider { border: none; border-top: 1px solid rgba(255,255,255,0.1); }

.pv-footer-links-area {
  display: flex;
  gap: 3rem;
  padding: 2rem 0;
  flex-wrap: wrap;
}

.pv-footer-col { display: flex; flex-direction: column; gap: 10px; flex: 1; }

.pv-footer-link {
  font-size: 14px;
  color: var(--pv-footer-text, rgba(255,255,255,0.65));
  text-decoration: none;
  line-height: 1.5;
  transition: color 0.18s;
  white-space: nowrap;
}
.pv-footer-link:hover { color: var(--pv-footer-text, #fff); }
.pv-footer-info { cursor: default; white-space: normal; }

.pv-footer-bottom {
  padding: 1.5rem 0 0;
}
.pv-footer-bottom p {
  margin: 0;
  font-size: 13px;
  color: var(--pv-footer-text, rgba(255,255,255,0.38));
}

@media (max-width: 768px) {
  .pv-footer-container { padding: 1.75rem 1.25rem; }
  .pv-footer-top { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
</style>
