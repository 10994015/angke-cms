<template>
  <div class="renderer" :class="{ 'is-empty': isEmpty, 'drag-over': isDragOver }">
    <!-- 空格子 -->
    <div v-if="isEmpty" class="drop-hint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>拖曳元件</span>
    </div>

    <!-- 元件內容 -->
    <template v-else>
      <!-- 刪除按鈕 -->
      <button class="delete-btn" @click.stop="$emit('delete', cellIndex)" title="刪除元件">✕</button>

      <!-- TEXT -->
      <div
        v-if="type === 'TEXT'"
        class="el-text"
        :style="{
          fontSize:   ensureUnit(meta.fontSize   || val.fontSize,   '16px'),
          color:      meta.color      || val.color      || '#333',
          textAlign:  meta.textAlign  || val.align       || 'left',
          fontWeight: meta.fontWeight || val.fontWeight  || 'normal',
        }"
        v-html="val.text || '<p>（空白文字）</p>'"
      />

      <!-- IMG -->
      <div v-else-if="type === 'IMG'" class="el-image">
        <img
          v-if="val.src"
          :src="val.src"
          :alt="val.alt || '圖片'"
          :style="{ objectFit: val.objectFit || 'cover' }"
          class="el-image-img"
        />
        <div v-if="!val.src" class="img-no-src">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>點擊設定圖片</span>
        </div>
      </div>

      <!-- BUTTON -->
      <div v-else-if="type === 'BUTTON'" class="el-button-wrap" :style="{ textAlign: val.align || 'center' }">
        <a
          class="el-button"
          href="#"
          :style="{
            color:           val.textColor || '#fff',
            backgroundColor: val.bgColor   || '#0891B2',
            fontSize:        ensureUnit(val.fontSize, '16px'),
            padding:         ensureUnit(val.padding,  '12px 32px'),
            borderRadius:    val.borderRadius || '6px',
          }"
        >{{ val.text || '按鈕' }}</a>
      </div>

      <!-- CAROUSEL_IMG -->
      <div
        v-else-if="type === 'CAROUSEL_IMG'"
        class="el-hero"
        :style="{
          minHeight: val.heroHeight || '300px',
          backgroundImage: val.heroBgImgSrc ? `url(${val.heroBgImgSrc})` : 'none',
        }"
      >
        <div class="el-hero-overlay" :style="{ backgroundColor: val.overlayColor || '#000', opacity: (val.overlayOpacity ?? 40) / 100 }" />
        <div class="el-hero-content">
          <p v-if="val.heroTitle" class="el-hero-title" :style="{ color: val.titleColor || '#fff', fontSize: ensureUnit(val.titleFontSize, '48px') }">{{ val.heroTitle }}</p>
          <p v-if="val.heroSubtitle" class="el-hero-subtitle" :style="{ color: val.subtitleColor || '#eee', fontSize: ensureUnit(val.subtitleFontSize, '20px') }">{{ val.heroSubtitle }}</p>
          <div v-if="!val.heroTitle && !val.heroSubtitle" class="el-hero-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><polyline points="7 12 12 7 17 12"/><line x1="12" y1="7" x2="12" y2="17"/></svg>
            <span>輪播圖 / 首圖</span>
          </div>
        </div>
      </div>

      <!-- GOOGLE_MAP -->
      <div v-else-if="type === 'GOOGLE_MAP'" class="el-map">
        <div class="el-map-display">
          <div class="el-map-pin">🗺️</div>
          <p class="el-map-hint">Google 地圖</p>
          <p v-if="val.lat && val.lng" class="el-map-coords">{{ val.lat }}, {{ val.lng }}</p>
        </div>
        <div v-if="val.address" class="el-map-info">
          <span class="el-map-icon">📍</span>
          <span class="el-map-addr">{{ val.address }}</span>
        </div>
      </div>

      <!-- ACCORDION -->
      <div v-else-if="type === 'ACCORDION'" class="el-accordion">
        <div
          v-for="(item, i) in (val.items || []).slice(0, 3)"
          :key="i"
          class="el-accordion-item"
          :class="{ 'is-open': i === 0 && val.defaultOpen }"
        >
          <div
            class="el-accordion-header"
            :style="{
              color: val.titleColor || '#333',
              fontSize: ensureUnit(val.titleFontSize, '16px'),
              fontWeight: val.titleFontWeight || '600',
            }"
          >
            <span class="el-accordion-title">{{ item.title || '標題' }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              :style="{ transform: (i === 0 && val.defaultOpen) ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div v-if="i === 0 && val.defaultOpen" class="el-accordion-body"
            :style="{ color: val.contentColor || '#666', fontSize: ensureUnit(val.contentFontSize, '15px') }">
            {{ item.content }}
          </div>
        </div>
        <div v-if="(val.items || []).length > 3" class="el-accordion-more">
          ...共 {{ val.items.length }} 項
        </div>
      </div>

      <!-- IFRAME -->
      <div v-else-if="type === 'IFRAME'" class="el-iframe-wrap" :style="{ height: ensureUnit(val.height, '400px') }">
        <iframe
          v-if="val.src"
          :src="val.src"
          :title="val.title || 'iframe'"
          class="el-iframe"
          frameborder="0"
          allowfullscreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
        <div v-else class="el-iframe-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 10l3 3-3 3"/><line x1="13" y1="16" x2="16" y2="16"/></svg>
          <span>請在右側輸入嵌入網址</span>
        </div>
      </div>

      <!-- HORIZON_LINE -->
      <div v-else-if="type === 'HORIZON_LINE'" class="el-hline">
        <hr :style="{
          borderColor: val.color || '#E0E0E0',
          borderTopWidth: ensureUnit(val.thickness, '2px'),
          borderTopStyle: val.style || 'solid',
          width: ensureUnit(val.width, '100%'),
        }" />
      </div>

      <!-- 未知類型 fallback -->
      <div v-else class="placeholder">
        <span>{{ type }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  element:   { type: Object, default: null },
  cellIndex: { type: Number, required: true },
  cellKey:   { type: String, default: '' },
  isEditMode:{ type: Boolean, default: false },
  isDragOver:{ type: Boolean, default: false },
})

defineEmits(['delete'])


const ensureUnit = (value, defaultValue) => {
  if (!value) return defaultValue
  if (value === 'auto') return 'auto'
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string' && /^\d+$/.test(value)) return value + 'px'
  return value
}

const isEmpty = computed(() => !props.element || !props.element.type)
const type    = computed(() => props.element?.type)
const val     = computed(() => props.element?.value    || {})
const meta    = computed(() => props.element?.metadata || {})

</script>

<style scoped lang="scss">
.renderer {
  width: 100%;
  min-height: 60px;
  position: relative;
  transition: all 0.15s;

  &.drag-over {
    background: rgba(8, 145, 178, 0.08);
    outline: 2px dashed #0891B2;
    outline-offset: -2px;
    border-radius: 4px;
  }

  &.is-empty.drag-over .drop-hint { color: #0891B2; }
}

.drop-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 60px;
  color: #d1d5db;
  font-size: 11px;
  svg { width: 20px; height: 20px; }
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10;
  line-height: 1;
  transition: background 0.15s;

  .renderer:hover & { display: flex; }
  &:hover { background: #dc2626; }
}

.el-image {
  width: 100%;
  max-width: 100%;
  display: block;
  position: relative;
  line-height: 0;
  overflow: hidden;
}

.el-image-img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.img-no-src {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(249,250,251,0.85);
  color: #9ca3af;
  font-size: 12px;
  border-radius: 4px;
  svg { width: 24px; height: 24px; }
}

.el-text {
  line-height: 1.6;
  word-break: break-word;
  :deep(p)       { margin: 0 0 6px; &:last-child { margin-bottom: 0; } }
  :deep(h1)      { margin: 0 0 8px; font-size: 2em; }
  :deep(h2)      { margin: 0 0 8px; font-size: 1.5em; }
  :deep(h3)      { margin: 0 0 6px; font-size: 1.17em; }
  :deep(ul, ol)  { margin: 0 0 6px; padding-left: 1.4em; }
  :deep(strong)  { font-weight: 700; }
  :deep(em)      { font-style: italic; }
  :deep(a)       { color: #0891B2; text-decoration: underline; }
}

.el-button-wrap {
  width: 100%;
  padding: 0.5rem 0;
}

.el-button {
  display: inline-block;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: default;
  transition: opacity 0.2s;
}

.el-hero {
  position: relative;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.el-hero-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.el-hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px;
}

.el-hero-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 12px;
  line-height: 1.2;
}

.el-hero-subtitle {
  font-size: 20px;
  margin: 0;
  line-height: 1.6;
}

.el-hero-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.7);
  svg { width: 32px; height: 32px; }
  span { font-size: 13px; }
}


.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 6px;
  color: #9ca3af;
  text-align: center;
  min-height: 60px;

  svg { width: 28px; height: 28px; }
  span { font-size: 12px; }
  small { font-size: 11px; color: #d1d5db; word-break: break-all; }
}

.el-map {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #f5f5f5;
}

.el-map-display {
  width: 100%;
  height: 200px;
  background: #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.el-map-pin { font-size: 36px; opacity: 0.5; }
.el-map-hint { font-size: 13px; color: #9ca3af; margin: 0; }
.el-map-coords { font-size: 11px; color: #9ca3af; margin: 0; }

.el-map-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

.el-map-icon { font-size: 18px; flex-shrink: 0; }
.el-map-addr { font-size: 13px; color: #4b5563; line-height: 1.4; }

.el-accordion {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.el-accordion-item {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  &.is-open { border-color: #0891B2; box-shadow: 0 3px 12px rgba(232,87,42,0.12); }
}

.el-accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  gap: 10px;
  .el-accordion-item.is-open & { color: #0891B2 !important; }
}

.el-accordion-title { flex: 1; line-height: 1.5; }

.el-accordion-body {
  padding: 0 16px 14px;
  font-size: 14px;
  line-height: 1.7;
  color: #666;
  white-space: pre-line;
}

.el-accordion-more { padding: 4px 8px; font-size: 11px; color: #9ca3af; }

.el-iframe-wrap {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.el-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.el-iframe-placeholder {
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f9fafb;
  color: #9ca3af;
  font-size: 12px;
  svg { width: 28px; height: 28px; }
}

.el-hline {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;

  hr {
    margin: 0;
    border: none;
    border-top-style: solid;
  }
}
</style>
