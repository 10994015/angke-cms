<template>
  <aside class="props-panel" :class="{ 'is-collapsed': collapsed }">
    <!-- 收合 toggle strip -->
    <div class="panel-topbar">
      <button class="sidebar-toggle-btn" @click="collapsed = !collapsed" :title="collapsed ? '展開屬性欄' : '收合屬性欄'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline :points="collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"/>
        </svg>
      </button>
    </div>

    <div v-show="!collapsed" class="panel-main">
    <!-- 無選取 -->
    <div v-if="!el && !selectedFrame" class="no-selection">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>點選畫布中的元件或版面配置以編輯屬性</p>
    </div>

    <!-- 版面配置設定 -->
    <template v-else-if="selectedFrame && !el">
      <div class="panel-header">
        <span class="panel-title">{{ isNavbarFrame ? '導覽列設定' : '版面配置設定' }}</span>
        <button class="close-btn" @click="store.clearSelection()">✕</button>
      </div>
      <div class="panel-body">

        <!-- Navbar Logo 上傳 -->
        <template v-if="isNavbarFrame">
          <div class="prop-group">
            <label class="prop-label">導覽列 Logo</label>
            <div v-if="frameData.logoImgSrc" class="logo-preview-wrap">
              <img :src="frameData.logoImgSrc" class="logo-preview" alt="Logo" />
              <button class="logo-remove-btn" @click="setFrameData('logoImgSrc', null); setFrameData('logoImgId', null)">✕</button>
            </div>
            <label class="upload-btn-label" :class="{ loading: logoUploading }">
              <input type="file" accept="image/*" class="hidden-input" :disabled="logoUploading" @change="handleLogoUpload" />
              {{ logoUploading ? '上傳中...' : (frameData.logoImgSrc ? '更換 Logo' : '上傳 Logo') }}
            </label>
            <p class="prop-hint">建議尺寸：寬 200px 以內，高 60px 以內，PNG / SVG</p>
          </div>
          <div class="prop-divider" />
        </template>

        <div class="prop-group">
          <label class="prop-label">背景色</label>
          <div class="color-row">
            <input type="color" class="color-input" :value="colorOrWhite(frameData.background)" @input="setFrameData('background', $event.target.value)" />
            <input type="text" class="prop-input" :value="frameData.background || ''" @input="setFrameData('background', $event.target.value)" placeholder="transparent / #ffffff" />
          </div>
        </div>
        <div class="prop-group">
          <label class="prop-label">版面配置內距 (px)</label>
          <div class="padding-grid">
            <div />
            <input type="number" class="pad-input" :value="frameData.padding?.pc?.top ?? 0" @input="setFramePad('top', +$event.target.value)" title="上" />
            <div />
            <input type="number" class="pad-input" :value="frameData.padding?.pc?.left ?? 0" @input="setFramePad('left', +$event.target.value)" title="左" />
            <div class="pad-center">內距</div>
            <input type="number" class="pad-input" :value="frameData.padding?.pc?.right ?? 0" @input="setFramePad('right', +$event.target.value)" title="右" />
            <div />
            <input type="number" class="pad-input" :value="frameData.padding?.pc?.bottom ?? 0" @input="setFramePad('bottom', +$event.target.value)" title="下" />
            <div />
          </div>
        </div>
      </div>
    </template>

    <!-- 元件屬性 -->
    <template v-else-if="el">
      <div class="panel-header">
        <span class="panel-title">{{ ELEMENT_LABELS[el.type] || el.type }} 屬性</span>
        <button class="close-btn" @click="store.clearSelection()">✕</button>
      </div>
      <div class="panel-body">

        <!-- 元件內距 -->
        <details class="prop-section">
          <summary class="prop-section-title">內距設定 (px)</summary>
          <div class="padding-grid" style="margin-top:8px">
            <div />
            <input type="number" class="pad-input" :value="elPad('top')" @input="setElPad('top', +$event.target.value)" title="上" />
            <div />
            <input type="number" class="pad-input" :value="elPad('left')" @input="setElPad('left', +$event.target.value)" title="左" />
            <div class="pad-center">內距</div>
            <input type="number" class="pad-input" :value="elPad('right')" @input="setElPad('right', +$event.target.value)" title="右" />
            <div />
            <input type="number" class="pad-input" :value="elPad('bottom')" @input="setElPad('bottom', +$event.target.value)" title="下" />
            <div />
          </div>
        </details>

        <!-- TEXT -->
        <template v-if="el.type === 'TEXT'">
          <div class="prop-group">
            <label class="prop-label">文字內容</label>
            <textarea class="prop-textarea" :value="v('text')" @input="up('text', $event.target.value)" rows="7" />
          </div>
          <div class="prop-group">
            <label class="prop-label">字體大小</label>
            <input type="text" class="prop-input" :value="v('fontSize') || ''" @input="up('fontSize', $event.target.value)" placeholder="16px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">對齊方式</label>
            <div class="btn-group">
              <button class="toggle-btn" :class="{ active: v('align') === 'left' }" @click="up('align', 'left')">靠左</button>
              <button class="toggle-btn" :class="{ active: v('align') === 'center' }" @click="up('align', 'center')">置中</button>
              <button class="toggle-btn" :class="{ active: v('align') === 'right' }" @click="up('align', 'right')">靠右</button>
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">文字顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('color') || '#333333'" @input="up('color', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('color') || ''" @input="up('color', $event.target.value)" placeholder="#333333" />
            </div>
          </div>
        </template>

        <!-- IMG -->
        <template v-else-if="el.type === 'IMG'">
          <div v-if="v('src')" class="prop-group">
            <img :src="v('src')" class="img-preview" :alt="v('alt') || ''" />
          </div>
          <div class="prop-group">
            <label class="prop-label">上傳圖片</label>
            <label class="upload-btn">
              <input type="file" accept="image/*" @change="handleImgUpload" style="display:none" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {{ uploading ? '上傳中...' : '選擇圖片' }}
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">替代文字</label>
            <input type="text" class="prop-input" :value="v('alt') || ''" @input="up('alt', $event.target.value)" placeholder="圖片描述" />
          </div>
          <div class="prop-group">
            <label class="prop-label">寬度</label>
            <input type="text" class="prop-input" :value="v('width') || ''" @input="up('width', $event.target.value)" placeholder="100%" />
          </div>
          <div class="prop-group">
            <label class="prop-label">高度</label>
            <input type="text" class="prop-input" :value="v('height') || ''" @input="up('height', $event.target.value)" placeholder="auto" />
          </div>
          <div class="prop-group">
            <label class="prop-label">填滿方式</label>
            <select class="prop-select" :value="v('objectFit') || 'cover'" @change="up('objectFit', $event.target.value)">
              <option value="cover">cover（裁切）</option>
              <option value="contain">contain（完整）</option>
              <option value="fill">fill（拉伸）</option>
              <option value="none">none（原始）</option>
            </select>
          </div>
          <div class="prop-group">
            <label class="prop-label">圓角</label>
            <input type="text" class="prop-input" :value="v('borderRadius') || ''" @input="up('borderRadius', $event.target.value)" placeholder="0px" />
          </div>
        </template>

        <!-- BUTTON -->
        <template v-else-if="el.type === 'BUTTON'">
          <div class="prop-group">
            <label class="prop-label">按鈕文字</label>
            <input type="text" class="prop-input" :value="v('text') || ''" @input="up('text', $event.target.value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">連結網址</label>
            <input type="text" class="prop-input" :value="v('link') || ''" @input="up('link', $event.target.value)" placeholder="https://..." />
          </div>
          <div class="prop-group">
            <label class="prop-label">對齊方式</label>
            <div class="btn-group">
              <button class="toggle-btn" :class="{ active: v('align') === 'left' }" @click="up('align', 'left')">靠左</button>
              <button class="toggle-btn" :class="{ active: (v('align') || 'center') === 'center' }" @click="up('align', 'center')">置中</button>
              <button class="toggle-btn" :class="{ active: v('align') === 'right' }" @click="up('align', 'right')">靠右</button>
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">字體大小</label>
            <input type="text" class="prop-input" :value="v('fontSize') || ''" @input="up('fontSize', $event.target.value)" placeholder="16px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">背景色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('bgColor') || '#0891B2'" @input="up('bgColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('bgColor') || ''" @input="up('bgColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">文字色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('textColor') || '#ffffff'" @input="up('textColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('textColor') || ''" @input="up('textColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">圓角</label>
            <input type="text" class="prop-input" :value="v('borderRadius') || ''" @input="up('borderRadius', $event.target.value)" placeholder="6px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">內距</label>
            <input type="text" class="prop-input" :value="v('padding') || ''" @input="up('padding', $event.target.value)" placeholder="12px 32px" />
          </div>
        </template>

        <!-- CAROUSEL_IMG -->
        <template v-else-if="el.type === 'CAROUSEL_IMG'">
          <div class="prop-group">
            <label class="prop-label">背景圖片網址</label>
            <input type="text" class="prop-input" :value="v('heroBgImgSrc') || ''" @input="up('heroBgImgSrc', $event.target.value)" placeholder="https://..." />
          </div>
          <div class="prop-group">
            <label class="prop-label">上傳背景圖片</label>
            <label class="upload-btn">
              <input type="file" accept="image/*" @change="handleCarouselBgUpload" style="display:none" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {{ uploading ? '上傳中...' : '選擇圖片' }}
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">最小高度</label>
            <input type="text" class="prop-input" :value="v('heroHeight') || ''" @input="up('heroHeight', $event.target.value)" placeholder="600px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">主標題</label>
            <input type="text" class="prop-input" :value="v('heroTitle') || ''" @input="up('heroTitle', $event.target.value)" placeholder="主標題文字" />
          </div>
          <div class="prop-group">
            <label class="prop-label">主標題顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('titleColor') || '#ffffff'" @input="up('titleColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('titleColor') || ''" @input="up('titleColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">主標題大小</label>
            <input type="text" class="prop-input" :value="v('titleFontSize') || ''" @input="up('titleFontSize', $event.target.value)" placeholder="48px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">副標題</label>
            <input type="text" class="prop-input" :value="v('heroSubtitle') || ''" @input="up('heroSubtitle', $event.target.value)" placeholder="副標題文字" />
          </div>
          <div class="prop-group">
            <label class="prop-label">副標題顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('subtitleColor') || '#eeeeee'" @input="up('subtitleColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('subtitleColor') || ''" @input="up('subtitleColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">副標題大小</label>
            <input type="text" class="prop-input" :value="v('subtitleFontSize') || ''" @input="up('subtitleFontSize', $event.target.value)" placeholder="20px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">遮罩顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('overlayColor') || '#000000'" @input="up('overlayColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('overlayColor') || ''" @input="up('overlayColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">遮罩透明度 (0–100)</label>
            <input type="range" min="0" max="100" :value="v('overlayOpacity') ?? 40" @input="up('overlayOpacity', +$event.target.value)" class="prop-range" />
            <span class="range-val">{{ v('overlayOpacity') ?? 40 }}%</span>
          </div>
        </template>

        <!-- GOOGLE_MAP -->
        <template v-else-if="el.type === 'GOOGLE_MAP'">
          <div class="prop-group">
            <label class="prop-label">地址</label>
            <input type="text" class="prop-input" :value="v('address') || ''" @input="up('address', $event.target.value)" placeholder="台北市信義區..." />
          </div>
          <div class="prop-group">
            <label class="prop-label">緯度</label>
            <input type="number" class="prop-input" step="0.0001" :value="v('lat') || 25.0340" @input="up('lat', +$event.target.value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">經度</label>
            <input type="number" class="prop-input" step="0.0001" :value="v('lng') || 121.5645" @input="up('lng', +$event.target.value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">縮放層級 (1–21)</label>
            <input type="number" class="prop-input" min="1" max="21" :value="v('zoom') || 17" @input="up('zoom', +$event.target.value)" />
          </div>
        </template>

        <!-- ACCORDION -->
        <template v-else-if="el.type === 'ACCORDION'">
          <div class="prop-group">
            <div class="checkbox-list">
              <label>
                <input type="checkbox" :checked="v('defaultOpen')" @change="up('defaultOpen', $event.target.checked)" />
                預設展開第一項
              </label>
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">標題顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('titleColor') || '#333333'" @input="up('titleColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('titleColor') || ''" @input="up('titleColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">標題大小</label>
            <input type="text" class="prop-input" :value="v('titleFontSize') || ''" @input="up('titleFontSize', $event.target.value)" placeholder="16px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">標題粗細</label>
            <div class="btn-group">
              <button class="toggle-btn" :class="{ active: v('titleFontWeight') === 'normal' }" @click="up('titleFontWeight', 'normal')">一般</button>
              <button class="toggle-btn" :class="{ active: (v('titleFontWeight') || '600') === '600' }" @click="up('titleFontWeight', '600')">半粗</button>
              <button class="toggle-btn" :class="{ active: v('titleFontWeight') === 'bold' }" @click="up('titleFontWeight', 'bold')">粗體</button>
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">內容顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('contentColor') || '#666666'" @input="up('contentColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('contentColor') || ''" @input="up('contentColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">內容大小</label>
            <input type="text" class="prop-input" :value="v('contentFontSize') || ''" @input="up('contentFontSize', $event.target.value)" placeholder="15px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">FAQ 列表 ({{ (v('items') || []).length }} 項)</label>
            <div class="list-editor accordion-editor">
              <div v-for="(item, i) in (v('items') || [])" :key="i" class="accordion-item-editor">
                <div class="accordion-item-head">
                  <span class="list-num">{{ i + 1 }}</span>
                  <button class="list-del" @click="removeAccordionItem(i)">✕</button>
                </div>
                <input type="text" class="prop-input" :value="item.title" @input="updateAccordionItem(i, 'title', $event.target.value)" placeholder="問題標題" />
                <textarea class="prop-textarea" :value="item.content" @input="updateAccordionItem(i, 'content', $event.target.value)" rows="3" placeholder="回答內容" style="margin-top:4px" />
              </div>
              <button class="list-add" @click="addAccordionItem">＋ 新增問答</button>
            </div>
          </div>
        </template>

        <!-- IFRAME -->
        <template v-else-if="el.type === 'IFRAME'">
          <div class="prop-group">
            <label class="prop-label">嵌入網址</label>
            <input type="text" class="prop-input" :value="v('src') || ''" @input="up('src', $event.target.value)" placeholder="https://..." />
          </div>
          <div class="prop-group">
            <label class="prop-label">高度</label>
            <input type="text" class="prop-input" :value="v('height') || ''" @input="up('height', $event.target.value)" placeholder="400px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">標題（accessibility）</label>
            <input type="text" class="prop-input" :value="v('title') || ''" @input="up('title', $event.target.value)" placeholder="嵌入內容描述" />
          </div>
        </template>

        <!-- HORIZON_LINE -->
        <template v-else-if="el.type === 'HORIZON_LINE'">
          <div class="prop-group">
            <label class="prop-label">線條顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="v('color') || '#E0E0E0'" @input="up('color', $event.target.value)" />
              <input type="text" class="prop-input" :value="v('color') || ''" @input="up('color', $event.target.value)" placeholder="#E0E0E0" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">線條粗細</label>
            <input type="text" class="prop-input" :value="v('thickness') || ''" @input="up('thickness', $event.target.value)" placeholder="2px" />
          </div>
          <div class="prop-group">
            <label class="prop-label">線條寬度</label>
            <input type="text" class="prop-input" :value="v('width') || ''" @input="up('width', $event.target.value)" placeholder="100%" />
          </div>
          <div class="prop-group">
            <label class="prop-label">線條樣式</label>
            <div class="btn-group">
              <button class="toggle-btn" :class="{ active: (v('style') || 'solid') === 'solid' }" @click="up('style', 'solid')">實線</button>
              <button class="toggle-btn" :class="{ active: v('style') === 'dashed' }" @click="up('style', 'dashed')">虛線</button>
              <button class="toggle-btn" :class="{ active: v('style') === 'dotted' }" @click="up('style', 'dotted')">點線</button>
            </div>
          </div>
        </template>

        <!-- 未知類型 -->
        <div v-else class="no-selection">
          <p>{{ el.type }} 尚無設定面板</p>
        </div>

      </div>
    </template>
    </div><!-- /panel-main -->
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { usePageEditorStore } from '@/stores/pageEditor'

const store = usePageEditorStore()
const collapsed     = ref(false)

watch(() => store.selected, (sel) => {
  if ((sel.basemap || sel.frame || sel.element || sel.cell) && collapsed.value) {
    collapsed.value = false
  }
}, { deep: true })
const uploading     = ref(false)
const logoUploading = ref(false)

const ELEMENT_LABELS = {
  TEXT: '文字', IMG: '圖片', BUTTON: '按鈕',
  CAROUSEL_IMG: '輪播圖', GOOGLE_MAP: '地圖', ACCORDION: '折疊', IFRAME: 'iFrame',
  HORIZON_LINE: '橫線',
}

const el            = computed(() => store.selected.element)
const selectedFrame = computed(() => store.selected.frame)
const frameData     = computed(() => store.selected.frame?.data || {})
const isNavbarFrame = computed(() => {
  const t = store.selected.frame?.type
  return t === 'PV_HEADER' || t === 'HEADER'
})

const v  = (key) => el.value?.value?.[key]
const up = (key, value) => store.updateSelectedElementValue(key, value)

const setFrameData = (key, value) => {
  const frame = store.selected.frame
  if (!frame) return
  if (!frame.data) frame.data = {}
  frame.data[key] = value
}

const elPad    = (side) => el.value?.padding?.pc?.[side] ?? 0
const setElPad = (side, value) => {
  if (!el.value) return
  if (!el.value.padding) el.value.padding = { pc: {}, tablet: {}, phone: {} }
  if (!el.value.padding.pc)     el.value.padding.pc     = {}
  if (!el.value.padding.tablet) el.value.padding.tablet = {}
  if (!el.value.padding.phone)  el.value.padding.phone  = {}
  el.value.padding.pc[side]     = value
  el.value.padding.tablet[side] = value
  el.value.padding.phone[side]  = value
}

const setFramePad = (side, value) => {
  const frame = store.selected.frame
  if (!frame) return
  if (!frame.data.padding)     frame.data.padding     = { pc: {}, tablet: {}, phone: {} }
  if (!frame.data.padding.pc)  frame.data.padding.pc  = {}
  frame.data.padding.pc[side] = value
}

const colorOrWhite = (val) => (!val || val === 'transparent') ? '#ffffff' : val

// Logo upload (Navbar)
const handleLogoUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  logoUploading.value = true
  const result = await store.uploadImage(file)
  if (result) {
    setFrameData('logoImgSrc', result.fileUrl)
    setFrameData('logoImgId', result.id)
  }
  logoUploading.value = false
  e.target.value = ''
}

// Carousel background upload
const handleCarouselBgUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  const result = await store.uploadImage(file)
  if (result) { up('heroBgImgSrc', result.fileUrl); up('heroBgImgId', result.id) }
  uploading.value = false
  e.target.value = ''
}

// IMG upload
const handleImgUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  const result = await store.uploadImage(file)
  if (result) {
    up('src', result.fileUrl)
    up('id', result.id)
    console.log('[IMG upload] element.value after upload:', JSON.parse(JSON.stringify(el.value?.value || {})))
  }
  uploading.value = false
  e.target.value = ''
}

// Carousel
const updateCarouselImg = (i, key, value) => {
  const imgs = [...(v('imgs') || [])]
  imgs[i] = { ...imgs[i], [key]: value }
  up('imgs', imgs)
}
const addCarouselImg    = () => { const imgs = [...(v('imgs') || [])]; imgs.push({ src: '', alt: '', id: null }); up('imgs', imgs) }
const removeCarouselImg = (i) => { const imgs = [...(v('imgs') || [])]; imgs.splice(i, 1); up('imgs', imgs) }

// Accordion
const updateAccordionItem = (i, key, value) => {
  const items = [...(v('items') || [])]
  items[i] = { ...items[i], [key]: value }
  up('items', items)
}
const addAccordionItem    = () => { const items = [...(v('items') || [])]; items.push({ title: '', content: '' }); up('items', items) }
const removeAccordionItem = (i) => { const items = [...(v('items') || [])]; items.splice(i, 1); up('items', items) }
</script>

<style scoped lang="scss">
.props-panel {
  width: 268px;
  flex-shrink: 0;
  background: #fafafa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.22s ease;

  &.is-collapsed {
    width: 36px;
  }
}

// ── Collapse topbar (always visible) ──
.panel-topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 4px 5px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  height: 36px;

  .is-collapsed & {
    justify-content: center;
    padding: 0;
  }
}

.sidebar-toggle-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  border-radius: 5px;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
  svg { width: 14px; height: 14px; }
  &:hover { background: #e5e7eb; color: #374151; }

  .is-collapsed & {
    width: 36px;
    height: 36px;
    border-radius: 0;
  }
}

// ── Panel main (collapsible content) ──
.panel-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── No selection state ──
.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  background: #fafafa;
  text-align: center;
  svg { width: 32px; height: 32px; color: #d1d5db; }
  p { font-size: 12px; line-height: 1.6; color: #9ca3af; }
}

// ── Panel header ──
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  height: 42px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.panel-title {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.close-btn {
  width: 22px;
  height: 22px;
  border: none;
  background: #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  &:hover { background: #d1d5db; color: #374151; }
}

// ── Panel body ──
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fafafa;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
}

// ── Section collapse ──
.prop-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.prop-section-title {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
  padding: 2px 0;
  letter-spacing: 0.02em;
}

// ── Prop groups ──
.prop-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.prop-label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.01em;
}

.prop-hint {
  font-size: 10px;
  color: #9ca3af;
  line-height: 1.4;
  margin: 1px 0 0;
}

.prop-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 2px 0;
}

// ── Logo ──
.logo-preview-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 4px;
}

.logo-preview {
  max-width: 160px;
  max-height: 48px;
  object-fit: contain;
}

.logo-remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: #6b7280;
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: #dc2626; }
}

.upload-btn-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  border: 1px dashed #d1d5db;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
  box-sizing: border-box;
  background: #fff;

  &:hover { border-color: #0891B2; color: #0891B2; background: #f0f9ff; }
  &.loading { opacity: 0.6; cursor: not-allowed; }
}

.hidden-input { display: none; }

// ── Inputs ──
.prop-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #111827;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.12); }
}

.prop-textarea {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  resize: vertical;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  background: #fff;
  line-height: 1.5;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.12); }
}

.prop-select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s;
  &:focus { border-color: #0891B2; }
}

// ── Color row ──
.color-row {
  display: flex;
  align-items: center;
  gap: 6px;
  .prop-input { flex: 1; }
}

.color-input {
  width: 34px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 2px;
  cursor: pointer;
  flex-shrink: 0;
  background: #fff;
}

// ── Toggle button group ──
.btn-group { display: flex; gap: 3px; }

.toggle-btn {
  flex: 1;
  padding: 5px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 11px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  &:hover { border-color: #d1d5db; background: #f9fafb; color: #374151; }
  &.active { border-color: #0891B2; background: #f0f9ff; color: #0891B2; font-weight: 600; }
}

// ── Checkbox ──
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #374151;
    cursor: pointer;
    input[type="checkbox"] { accent-color: #0891B2; cursor: pointer; }
  }
}

// ── Padding grid ──
.padding-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 3px;
  align-items: center;
  justify-items: center;
}

.pad-input {
  width: 100%;
  padding: 4px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  font-size: 11px;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  font-family: inherit;
  &:focus { border-color: #0891B2; }
}

.pad-center {
  font-size: 9px;
  color: #d1d5db;
  text-align: center;
  letter-spacing: 0.03em;
}

// ── Image preview ──
.img-preview {
  width: 100%;
  max-height: 110px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  font-size: 11px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
  svg { width: 14px; height: 14px; flex-shrink: 0; }
  &:hover { border-color: #0891B2; color: #0891B2; background: #f0f9ff; }
}

// ── List editor ──
.list-editor { display: flex; flex-direction: column; gap: 5px; }
.list-item { display: flex; align-items: center; gap: 5px; }
.list-input { flex: 1; }

.list-num {
  font-size: 10px;
  color: #d1d5db;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.list-del {
  width: 22px;
  height: 22px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: #fecaca; }
}

.list-add {
  padding: 6px;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
  background: transparent;
  font-size: 11px;
  color: #9ca3af;
  cursor: pointer;
  width: 100%;
  font-family: inherit;
  transition: all 0.15s;
  &:hover { border-color: #0891B2; color: #0891B2; background: #f0f9ff; }
}

.accordion-editor { gap: 8px; }

.accordion-item-editor {
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #fff;
}

.accordion-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// ── Range ──
.prop-range {
  width: 100%;
  accent-color: #0891B2;
  cursor: pointer;
  height: 4px;
}

.range-val {
  font-size: 11px;
  color: #9ca3af;
  text-align: right;
  display: block;
  margin-top: -2px;
}
</style>
