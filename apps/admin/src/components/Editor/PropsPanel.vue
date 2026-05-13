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
        <span class="panel-title">{{ isNavbarFrame ? '導覽列設定' : isFooterFrame ? '頁尾設定' : isFirstPictureFrame ? '首圖設定' : isCarouselWallFrame ? '輪播牆設定' : '版面配置設定' }}</span>
        <button class="close-btn" @click="store.clearSelection()">✕</button>
      </div>
      <div class="panel-body">

        <!-- Navbar / Footer Logo 上傳 -->
        <template v-if="isNavbarFrame || isFooterFrame">
          <div class="prop-group">
            <label class="prop-label">Logo</label>
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

        <!-- FIRST_PICTURE 設定 -->
        <template v-else-if="isFirstPictureFrame">
          <div class="prop-group">
            <label class="prop-label">背景圖片</label>
            <div v-if="frameData.heroBgImgSrc" class="logo-preview-wrap">
              <img :src="frameData.heroBgImgSrc" class="logo-preview" alt="背景圖預覽" />
              <button class="logo-remove-btn" @click="setFrameData('heroBgImgSrc', null)">✕</button>
            </div>
            <label class="upload-btn-label" :class="{ loading: heroImgUploading }">
              <input type="file" accept="image/*" class="hidden-input" :disabled="heroImgUploading" @change="handleHeroImgUpload" />
              {{ heroImgUploading ? '上傳中...' : (frameData.heroBgImgSrc ? '更換背景圖' : '上傳背景圖') }}
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">主標題</label>
            <input type="text" class="prop-input" :value="frameData.heroTitle || ''" @input="setFrameData('heroTitle', $event.target.value)" placeholder="主標題文字" />
          </div>
          <div class="prop-group">
            <label class="prop-label">副標題</label>
            <textarea class="prop-textarea" :value="frameData.heroSubtitle || ''" @input="setFrameData('heroSubtitle', $event.target.value)" rows="3" placeholder="副標題文字"></textarea>
          </div>
          <div class="prop-group">
            <label class="prop-label">高度</label>
            <div class="unit-row">
              <input type="number" class="prop-input unit-num" min="0"
                :value="parseVal(frameData.heroHeight, 'px').num"
                @input="setFrameData('heroHeight', $event.target.value + parseVal(frameData.heroHeight, 'px').unit)"
                placeholder="600"
              />
              <select class="unit-select"
                :value="parseVal(frameData.heroHeight, 'px').unit"
                @change="setFrameData('heroHeight', (parseVal(frameData.heroHeight, 'px').num || '600') + $event.target.value)"
              >
                <option value="px">px</option>
                <option value="vh">vh</option>
              </select>
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">遮罩透明度 ({{ frameData.overlayOpacity ?? 40 }}%)</label>
            <input type="range" min="0" max="100" :value="frameData.overlayOpacity ?? 40" @input="setFrameData('overlayOpacity', +$event.target.value)" class="prop-range" />
          </div>
          <div class="prop-group">
            <label class="prop-label">遮罩顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="frameData.overlayColor || '#000000'" @input="setFrameData('overlayColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="frameData.overlayColor || ''" @input="setFrameData('overlayColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">標題顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="frameData.titleColor || '#ffffff'" @input="setFrameData('titleColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="frameData.titleColor || ''" @input="setFrameData('titleColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">標題大小</label>
            <input type="number" class="prop-input" min="0"
              :value="parseVal(frameData.titleFontSize, 'px').num"
              @input="setFrameData('titleFontSize', $event.target.value ? $event.target.value + 'px' : '')"
              placeholder="48"
            />
          </div>
          <div class="prop-group">
            <label class="prop-label">副標題顏色</label>
            <div class="color-row">
              <input type="color" class="color-input" :value="frameData.subtitleColor || '#eeeeee'" @input="setFrameData('subtitleColor', $event.target.value)" />
              <input type="text" class="prop-input" :value="frameData.subtitleColor || ''" @input="setFrameData('subtitleColor', $event.target.value)" />
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">副標題大小</label>
            <input type="number" class="prop-input" min="0"
              :value="parseVal(frameData.subtitleFontSize, 'px').num"
              @input="setFrameData('subtitleFontSize', $event.target.value ? $event.target.value + 'px' : '')"
              placeholder="20"
            />
          </div>
        </template>

        <!-- CAROUSEL_WALL 設定 -->
        <template v-else-if="isCarouselWallFrame">
          <div class="prop-group">
            <label class="prop-label">輪播高度</label>
            <input type="number" class="prop-input" min="200" step="50"
              :value="frameData.carouselWallHeight ?? 600"
              @input="setFrameData('carouselWallHeight', +$event.target.value)"
              placeholder="600"
            />
          </div>
          <div class="prop-group">
            <div class="checkbox-list">
              <label>
                <input type="checkbox" :checked="frameData.carouselWallAutoPlay ?? true" @change="setFrameData('carouselWallAutoPlay', $event.target.checked)" />
                自動播放
              </label>
            </div>
          </div>
          <div v-if="frameData.carouselWallAutoPlay ?? true" class="prop-group">
            <label class="prop-label">播放間隔 (ms)</label>
            <input type="number" class="prop-input" min="500" step="500"
              :value="frameData.carouselWallInterval ?? 5000"
              @input="setFrameData('carouselWallInterval', +$event.target.value)"
            />
          </div>
          <div class="prop-group">
            <label class="prop-label">輪播圖片（{{ (frameData.caroiselWallImgs || []).length }} 張）</label>

            <div class="cw-card-list">
              <div v-for="(img, i) in (frameData.caroiselWallImgs || [])" :key="i" class="cw-img-card">

                <!-- Card header -->
                <div class="cw-card-header">
                  <img v-if="img.desktopSrc" :src="img.desktopSrc" class="cw-card-thumb" :alt="`圖片 ${i + 1}`" />
                  <div v-else class="cw-card-thumb cw-card-thumb--empty" />
                  <span class="cw-card-num">第 {{ i + 1 }} 張</span>
                  <button class="list-del" @click="removeCarouselWallImg(i)" title="刪除此張">✕</button>
                </div>

                <!-- Device rows -->
                <div v-for="slot in CW_DEVICE_SLOTS" :key="slot.srcKey" class="cw-device-row">
                  <span class="cw-device-label">{{ slot.label }}</span>
                  <div class="cw-device-content">
                    <template v-if="img[slot.srcKey]">
                      <img :src="img[slot.srcKey]" class="cw-device-thumb" alt="" />
                      <button class="cw-device-remove" @click="removeCwDeviceImg(i, slot.srcKey, slot.idKey)" title="移除">✕</button>
                    </template>
                    <label v-else class="cw-upload-btn-sm" :class="{ loading: isCwDeviceUploading(i, slot.srcKey) }">
                      <input type="file" accept="image/*" class="hidden-input"
                        :disabled="isCwDeviceUploading(i, slot.srcKey)"
                        @change="uploadCwDeviceImg($event, i, slot.srcKey, slot.idKey)"
                      />
                      {{ isCwDeviceUploading(i, slot.srcKey) ? '上傳中...' : '上傳圖片' }}
                    </label>
                  </div>
                </div>

                <!-- Title -->
                <div class="cw-card-field">
                  <label class="prop-label">標題</label>
                  <input type="text" class="prop-input"
                    :value="img.title || ''"
                    @input="updateCwImgField(i, 'title', $event.target.value)"
                    placeholder="此張圖片的標題（選填）"
                  />
                </div>

                <!-- Subtitle -->
                <div class="cw-card-field">
                  <label class="prop-label">副標題</label>
                  <textarea class="prop-textarea"
                    :value="img.subtitle || ''"
                    @input="updateCwImgField(i, 'subtitle', $event.target.value)"
                    rows="2"
                    placeholder="副標題（選填）"
                  />
                </div>

                <!-- Collapsible style section -->
                <div class="cw-style-toggle" @click="toggleCwStyle(i)">
                  <span>樣式設定</span>
                  <svg class="section-chevron" :class="{ 'is-open': cwExpandedStyles.includes(i) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div v-show="cwExpandedStyles.includes(i)" class="cw-style-body">
                  <div class="cw-card-field">
                    <label class="prop-label">遮罩透明度（{{ img.overlayOpacity ?? 40 }}%）</label>
                    <input type="range" min="0" max="100" :value="img.overlayOpacity ?? 40"
                      @input="updateCwImgField(i, 'overlayOpacity', +$event.target.value)"
                      class="prop-range"
                    />
                  </div>
                  <div class="cw-card-field">
                    <label class="prop-label">遮罩顏色</label>
                    <div class="color-row">
                      <input type="color" class="color-input" :value="img.overlayColor || '#000000'"
                        @input="updateCwImgField(i, 'overlayColor', $event.target.value)" />
                      <input type="text" class="prop-input" :value="img.overlayColor || ''"
                        @input="updateCwImgField(i, 'overlayColor', $event.target.value)" />
                    </div>
                  </div>
                  <div class="cw-card-field">
                    <label class="prop-label">標題顏色</label>
                    <div class="color-row">
                      <input type="color" class="color-input" :value="img.titleColor || '#ffffff'"
                        @input="updateCwImgField(i, 'titleColor', $event.target.value)" />
                      <input type="text" class="prop-input" :value="img.titleColor || ''"
                        @input="updateCwImgField(i, 'titleColor', $event.target.value)" />
                    </div>
                  </div>
                  <div class="cw-card-field">
                    <label class="prop-label">標題大小</label>
                    <input type="number" class="prop-input" min="0"
                      :value="img.titleFontSize ?? ''"
                      @input="updateCwImgField(i, 'titleFontSize', $event.target.value ? +$event.target.value : '')"
                      placeholder="48"
                    />
                  </div>
                  <div class="cw-card-field">
                    <label class="prop-label">副標題顏色</label>
                    <div class="color-row">
                      <input type="color" class="color-input" :value="img.subtitleColor || '#eeeeee'"
                        @input="updateCwImgField(i, 'subtitleColor', $event.target.value)" />
                      <input type="text" class="prop-input" :value="img.subtitleColor || ''"
                        @input="updateCwImgField(i, 'subtitleColor', $event.target.value)" />
                    </div>
                  </div>
                  <div class="cw-card-field">
                    <label class="prop-label">副標題大小</label>
                    <input type="number" class="prop-input" min="0"
                      :value="img.subtitleFontSize ?? ''"
                      @input="updateCwImgField(i, 'subtitleFontSize', $event.target.value ? +$event.target.value : '')"
                      placeholder="20"
                    />
                  </div>
                </div>

              </div>
            </div>

            <label class="upload-btn-label" :class="{ loading: carouselWallUploading }">
              <input type="file" accept="image/*" class="hidden-input" :disabled="carouselWallUploading" @change="handleCarouselWallUpload" />
              {{ carouselWallUploading ? '上傳中...' : '＋ 新增圖片' }}
            </label>
          </div>
        </template>

        <!-- 一般 frame：背景色 + 內距 -->
        <template v-if="!isFirstPictureFrame && !isCarouselWallFrame">
        <div class="prop-group">
          <label class="prop-label">背景色</label>
          <div class="color-row">
            <input type="color" class="color-input" :value="colorOrWhite(frameData.background)" @input="setFrameData('background', $event.target.value)" />
            <input type="text" class="prop-input" :value="frameData.background || ''" @input="setFrameData('background', $event.target.value)" placeholder="transparent / #ffffff" />
          </div>
        </div>
        <div class="prop-section">
          <div class="prop-section-title prop-section-title--btn" @click="framePadCollapsed = !framePadCollapsed">
            <span>內距設定</span>
            <svg class="section-chevron" :class="{ 'is-open': !framePadCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div v-show="!framePadCollapsed" class="padding-grid">
            <div />
            <div class="pad-field">
              <span class="pad-dir">上</span>
              <input type="number" class="pad-input" :value="frameData.padding?.pc?.top ?? 0" @input="setFramePad('top', +$event.target.value)" />
            </div>
            <div />
            <div class="pad-field">
              <span class="pad-dir">左</span>
              <input type="number" class="pad-input" :value="frameData.padding?.pc?.left ?? 0" @input="setFramePad('left', +$event.target.value)" />
            </div>
            <div class="pad-center"><div class="pad-center-box"></div></div>
            <div class="pad-field">
              <span class="pad-dir">右</span>
              <input type="number" class="pad-input" :value="frameData.padding?.pc?.right ?? 0" @input="setFramePad('right', +$event.target.value)" />
            </div>
            <div />
            <div class="pad-field">
              <span class="pad-dir">下</span>
              <input type="number" class="pad-input" :value="frameData.padding?.pc?.bottom ?? 0" @input="setFramePad('bottom', +$event.target.value)" />
            </div>
            <div />
          </div>
        </div>
        </template>

      </div>
    </template>

    <!-- 元件屬性 -->
    <template v-else-if="el">
      <div class="panel-header">
        <span class="panel-title">{{ ELEMENT_LABELS[el.type] || el.type }} 屬性</span>
        <button class="close-btn" @click="store.clearSelection()">✕</button>
      </div>
      <div class="panel-body">

        <!-- TEXT -->
        <template v-if="el.type === 'TEXT'">
          <div class="prop-group">
            <label class="prop-label">文字內容</label>
            <RichEditor :model-value="v('text') || ''" @update:model-value="up('text', $event)" />
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
            <label class="prop-label">超連結</label>
            <div class="btn-group" style="margin-bottom:5px">
              <button class="toggle-btn" :class="{ active: !v('linkType') || v('linkType') === 'url' }" @click="up('linkType', 'url')">外部網址</button>
              <button class="toggle-btn" :class="{ active: v('linkType') === 'page' }" @click="up('linkType', 'page')">站內頁面</button>
            </div>
            <input
              v-if="!v('linkType') || v('linkType') === 'url'"
              type="text" class="prop-input"
              :value="v('link') || ''"
              @input="up('link', $event.target.value)"
              placeholder="https://..."
            />
            <select
              v-else
              class="prop-select"
              :value="v('linkPage') || ''"
              @change="onImgSelectPage($event.target.value)"
            >
              <option value="">-- 請選擇頁面 --</option>
              <option v-for="page in navPages" :key="page.slug" :value="page.slug">
                {{ '　'.repeat(page.depth) }}{{ page.label }}
              </option>
            </select>
          </div>
          <div class="prop-group">
            <label class="prop-label">開啟方式</label>
            <div class="btn-group">
              <button class="toggle-btn" :class="{ active: !v('linkTarget') || v('linkTarget') === '_self' }" @click="up('linkTarget', '_self')">同頁</button>
              <button class="toggle-btn" :class="{ active: v('linkTarget') === '_blank' }" @click="up('linkTarget', '_blank')">新分頁</button>
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">替代文字</label>
            <input type="text" class="prop-input" :value="v('alt') || ''" @input="up('alt', $event.target.value)" placeholder="圖片描述" />
          </div>
          <div class="prop-group">
            <label class="prop-label">寬度</label>
            <div class="unit-row">
              <input type="number" class="prop-input unit-num" min="0"
                :value="parseVal(v('width'), '%').num"
                @input="upUnit('width', $event.target.value, parseVal(v('width'), '%').unit)"
                placeholder="100"
              />
              <select class="unit-select"
                :value="parseVal(v('width'), '%').unit"
                @change="upUnit('width', parseVal(v('width'), '%').num, $event.target.value)"
              >
                <option value="%">%</option>
                <option value="px">px</option>
              </select>
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">高度</label>
            <div class="unit-row">
              <input type="number" class="prop-input unit-num" min="0"
                :value="parseVal(v('height'), 'px').num"
                @input="upUnit('height', $event.target.value, parseVal(v('height'), 'px').unit)"
                placeholder="自動"
              />
              <select class="unit-select"
                :value="parseVal(v('height'), 'px').unit"
                @change="upUnit('height', parseVal(v('height'), 'px').num, $event.target.value)"
              >
                <option value="px">px</option>
                <option value="%">%</option>
              </select>
            </div>
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
            <input type="number" class="prop-input" min="0"
              :value="parseVal(v('borderRadius'), 'px').num"
              @input="upPx('borderRadius', $event.target.value)"
              placeholder="0"
            />
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
            <input type="number" class="prop-input" min="0"
              :value="parseVal(v('fontSize'), 'px').num"
              @input="upPx('fontSize', $event.target.value)"
              placeholder="16"
            />
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
            <input type="number" class="prop-input" min="0"
              :value="parseVal(v('borderRadius'), 'px').num"
              @input="upPx('borderRadius', $event.target.value)"
              placeholder="6"
            />
          </div>
          <div class="prop-group">
            <label class="prop-label">內距</label>
            <input type="text" class="prop-input" :value="v('padding') || ''" @input="up('padding', $event.target.value)" placeholder="12px 32px" />
          </div>
        </template>

        <!-- CAROUSEL_IMG -->
        <template v-else-if="el.type === 'CAROUSEL_IMG'">
          <div class="prop-group">
            <label class="prop-label">輪播高度</label>
            <div class="unit-row">
              <input type="number" class="prop-input unit-num" min="100"
                :value="v('height') ?? 400"
                @input="up('height', +$event.target.value)"
              />
              <span class="unit-suffix">px</span>
            </div>
            <div class="btn-group" style="margin-top:5px">
              <button class="toggle-btn" :class="{ active: (v('height') ?? 400) === 200 }" @click="up('height', 200)">小</button>
              <button class="toggle-btn" :class="{ active: (v('height') ?? 400) === 400 }" @click="up('height', 400)">中</button>
              <button class="toggle-btn" :class="{ active: (v('height') ?? 400) === 600 }" @click="up('height', 600)">大</button>
              <button class="toggle-btn" :class="{ active: (v('height') ?? 400) === 800 }" @click="up('height', 800)">特大</button>
            </div>
          </div>
          <div class="prop-group">
            <label class="prop-label">輪播圖片（{{ (v('imgs') || []).length }}）</label>
            <div class="carousel-img-list">
              <div v-for="(img, i) in (v('imgs') || [])" :key="i" class="carousel-img-item">
                <img :src="img.src || img" class="carousel-img-thumb" :alt="`圖片 ${i + 1}`" />
                <button class="list-del" @click="removeCarouselImg(i)" title="刪除">✕</button>
              </div>
            </div>
            <label class="upload-btn-label" :class="{ loading: carouselImgUploading }">
              <input type="file" accept="image/*" class="hidden-input" :disabled="carouselImgUploading" @change="handleCarouselImgUpload" />
              {{ carouselImgUploading ? '上傳中...' : '＋ 新增圖片' }}
            </label>
          </div>
          <div class="prop-group">
            <div class="checkbox-list">
              <label>
                <input type="checkbox" :checked="v('autoPlay') !== false" @change="up('autoPlay', $event.target.checked)" />
                自動播放
              </label>
            </div>
          </div>
          <div v-if="v('autoPlay') !== false" class="prop-group">
            <label class="prop-label">播放間隔（毫秒）</label>
            <input type="number" class="prop-input" min="500" step="500"
              :value="v('interval') ?? 3000"
              @input="up('interval', +$event.target.value)"
            />
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
            <input type="number" class="prop-input" min="0"
              :value="parseVal(v('titleFontSize'), 'px').num"
              @input="upPx('titleFontSize', $event.target.value)"
              placeholder="16"
            />
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
            <input type="number" class="prop-input" min="0"
              :value="parseVal(v('contentFontSize'), 'px').num"
              @input="upPx('contentFontSize', $event.target.value)"
              placeholder="15"
            />
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
            <input type="number" class="prop-input" min="0"
              :value="parseVal(v('height'), 'px').num"
              @input="upPx('height', $event.target.value)"
              placeholder="400"
            />
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
            <input type="number" class="prop-input" min="0"
              :value="parseVal(v('thickness'), 'px').num"
              @input="upPx('thickness', $event.target.value)"
              placeholder="2"
            />
          </div>
          <div class="prop-group">
            <label class="prop-label">線條寬度</label>
            <div class="unit-row">
              <input type="number" class="prop-input unit-num" min="0"
                :value="parseVal(v('width'), '%').num"
                @input="upUnit('width', $event.target.value, parseVal(v('width'), '%').unit)"
                placeholder="100"
              />
              <select class="unit-select"
                :value="parseVal(v('width'), '%').unit"
                @change="upUnit('width', parseVal(v('width'), '%').num, $event.target.value)"
              >
                <option value="%">%</option>
                <option value="px">px</option>
              </select>
            </div>
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

        <!-- 欄位寬度（多欄版面） -->
        <template v-if="isElementInMultiColFrame">
          <div class="prop-group">
            <div class="col-width-header">
              <label class="prop-label">欄位寬度</label>
              <button class="col-reset-btn" @click="resetElementColWidths">重置</button>
            </div>
            <div class="col-width-preview">
              <div v-for="(w, i) in elementColWidths" :key="i" class="col-preview-seg" :style="{ flex: w }">{{ w }}%</div>
            </div>
            <div class="col-width-rows">
              <div v-for="(w, i) in elementColWidths" :key="i" class="col-width-row">
                <span class="col-width-label">{{ elementColLabels[i] }}</span>
                <input type="range" class="col-width-slider"
                  :min="10" :max="100 - (elementColCount - 1) * 10"
                  :value="w" @input="updateElementColWidth(i, +$event.target.value)" />
                <input type="number" class="col-width-num"
                  :min="10" :max="100 - (elementColCount - 1) * 10"
                  :value="w" @change="updateElementColWidth(i, +$event.target.value)" />
                <span class="col-unit">%</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 元件內距 -->
        <div class="prop-section">
          <div class="prop-section-title prop-section-title--btn" @click="elPadCollapsed = !elPadCollapsed">
            <span>內距設定</span>
            <div class="section-title-right">
              <span class="pad-device-badge">{{ { desktop: '桌面', tablet: '平板', mobile: '手機' }[store.currentDevice] || '桌面' }}</span>
              <svg class="section-chevron" :class="{ 'is-open': !elPadCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div v-show="!elPadCollapsed" class="padding-grid">
            <div />
            <div class="pad-field">
              <span class="pad-dir">上</span>
              <input type="number" class="pad-input" :value="elPad('top')" @input="setElPad('top', +$event.target.value)" />
            </div>
            <div />
            <div class="pad-field">
              <span class="pad-dir">左</span>
              <input type="number" class="pad-input" :value="elPad('left')" @input="setElPad('left', +$event.target.value)" />
            </div>
            <div class="pad-center"><div class="pad-center-box"></div></div>
            <div class="pad-field">
              <span class="pad-dir">右</span>
              <input type="number" class="pad-input" :value="elPad('right')" @input="setElPad('right', +$event.target.value)" />
            </div>
            <div />
            <div class="pad-field">
              <span class="pad-dir">下</span>
              <input type="number" class="pad-input" :value="elPad('bottom')" @input="setElPad('bottom', +$event.target.value)" />
            </div>
            <div />
          </div>
        </div>

      </div>
    </template>
    </div><!-- /panel-main -->
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { usePageEditorStore, parseFrameLayout } from '@/stores/pageEditor'
import RichEditor from '@/components/Editor/RichEditor.vue'

const store = usePageEditorStore()
const collapsed        = ref(false)
const framePadCollapsed = ref(true)
const elPadCollapsed    = ref(true)

watch(() => store.selected, (sel) => {
  if ((sel.basemap || sel.frame || sel.element || sel.cell) && collapsed.value) {
    collapsed.value = false
  }
}, { deep: true })
const uploading            = ref(false)
const logoUploading        = ref(false)
const heroImgUploading     = ref(false)
const carouselWallUploading = ref(false)

const handleHeroImgUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const frame = store.selected.frame
  if (!frame) return
  heroImgUploading.value = true
  const result = await store.uploadImage(file)
  if (result && frame.data) {
    frame.data.heroBgImgSrc = result.fileUrl
    frame.data.heroBgImgId  = result.id
  }
  heroImgUploading.value = false
  e.target.value = ''
}

const handleCarouselWallUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const frame = store.selected.frame
  if (!frame) return
  carouselWallUploading.value = true
  const result = await store.uploadImage(file)
  if (result) {
    if (!frame.data) frame.data = {}
    if (!Array.isArray(frame.data.caroiselWallImgs)) frame.data.caroiselWallImgs = []
    frame.data.caroiselWallImgs.push({ desktopSrc: result.fileUrl, desktopImgId: result.id, title: '', subtitle: '' })
  }
  carouselWallUploading.value = false
  e.target.value = ''
}

const removeCarouselWallImg = (index) => {
  const frame = store.selected.frame
  if (!frame?.data?.caroiselWallImgs) return
  frame.data.caroiselWallImgs.splice(index, 1)
}

const CW_DEVICE_SLOTS = [
  { label: '電腦', srcKey: 'desktopSrc', idKey: 'desktopImgId' },
  { label: '平板', srcKey: 'tabletSrc',  idKey: 'tabletImgId'  },
  { label: '手機', srcKey: 'mobileSrc',  idKey: 'mobileImgId'  },
]

const cwExpandedStyles  = ref([])
const cwDeviceUploading = ref(null)

const toggleCwStyle = (i) => {
  const idx = cwExpandedStyles.value.indexOf(i)
  if (idx >= 0) cwExpandedStyles.value.splice(idx, 1)
  else cwExpandedStyles.value.push(i)
}

const isCwDeviceUploading = (imgIndex, srcKey) =>
  cwDeviceUploading.value?.imgIndex === imgIndex && cwDeviceUploading.value?.srcKey === srcKey

const updateCwImgField = (imgIndex, field, value) => {
  const frame = store.selected.frame
  if (!frame?.data?.caroiselWallImgs?.[imgIndex]) return
  frame.data.caroiselWallImgs[imgIndex][field] = value
}

const uploadCwDeviceImg = async (e, imgIndex, srcKey, idKey) => {
  const file = e.target.files?.[0]
  if (!file) return
  const frame = store.selected.frame
  if (!frame?.data?.caroiselWallImgs?.[imgIndex]) return
  const imgEntry = frame.data.caroiselWallImgs[imgIndex]
  cwDeviceUploading.value = { imgIndex, srcKey }
  const result = await store.uploadImage(file)
  if (result) {
    imgEntry[srcKey] = result.fileUrl
    imgEntry[idKey]  = result.id
  }
  cwDeviceUploading.value = null
  e.target.value = ''
}

const removeCwDeviceImg = (imgIndex, srcKey, idKey) => {
  const frame = store.selected.frame
  if (!frame?.data?.caroiselWallImgs?.[imgIndex]) return
  frame.data.caroiselWallImgs[imgIndex][srcKey] = null
  frame.data.caroiselWallImgs[imgIndex][idKey]  = null
}

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
const isFooterFrame = computed(() => {
  const t = store.selected.frame?.type
  return t === 'PV_FOOTER' || t === 'FOOTER'
})
const isFirstPictureFrame  = computed(() => store.selected.frame?.type === 'FIRST_PICTURE')
const isCarouselWallFrame  = computed(() => store.selected.frame?.type === 'CAROUSEL_WALL')
const isSpecialFrame       = computed(() => isFirstPictureFrame.value || isCarouselWallFrame.value)

const v  = (key) => el.value?.value?.[key]
const up = (key, value) => store.updateSelectedElementValue(key, value)

// ── Unit helpers ──
const parseVal = (raw, defaultUnit = 'px') => {
  if (raw === null || raw === undefined || raw === '') return { num: '', unit: defaultUnit }
  const s = String(raw).trim()
  const m = s.match(/^([\d.]*)(%|px|vh|vw|em|rem)?$/)
  return { num: m?.[1] ?? '', unit: m?.[2] || defaultUnit }
}
const upPx   = (key, num) => up(key, num !== '' && num != null ? `${num}px` : '')
const upUnit = (key, num, unit) => up(key, num !== '' && num != null ? `${num}${unit}` : '')

const setFrameData = (key, value) => {
  const frame = store.selected.frame
  if (!frame) return
  if (!frame.data) frame.data = {}
  frame.data[key] = value
}

const DEVICE_PAD_KEY = computed(() => ({ desktop: 'pc', tablet: 'tablet', mobile: 'phone' }[store.currentDevice] || 'pc'))

const elPad = (side) => el.value?.padding?.[DEVICE_PAD_KEY.value]?.[side] ?? 0
const setElPad = (side, value) => {
  if (!el.value) return
  if (!el.value.padding) el.value.padding = { pc: {}, tablet: {}, phone: {} }
  const key = DEVICE_PAD_KEY.value
  if (!el.value.padding[key]) el.value.padding[key] = {}
  el.value.padding[key][side] = value
}

const setFramePad = (side, value) => {
  const frame = store.selected.frame
  if (!frame) return
  if (!frame.data.padding)     frame.data.padding     = { pc: {}, tablet: {}, phone: {} }
  if (!frame.data.padding.pc)  frame.data.padding.pc  = {}
  frame.data.padding.pc[side] = value
}

const frameBgDefault = computed(() => isFooterFrame.value ? '#0a1628' : '#ffffff')
const colorOrWhite   = (val) => (!val || val === 'transparent') ? frameBgDefault.value : val

// ── Multi-column width control (from element panel) ──
const MULTI_COL_COUNTS = { '1_2': 2, '1_3': 3, '1_4': 4, 'A': 2, 'B': 2, 'C': 2, 'D': 2 }
const COMPOSITE_DEFAULTS = { A: [67, 33], B: [33, 67], C: [67, 33], D: [25, 75] }

const elementFrame = computed(() => {
  const element = el.value
  if (!element) return null
  for (const basemap of store.currentPageBasemaps) {
    for (const frame of (basemap.frames || [])) {
      if (Array.isArray(frame.elements) && frame.elements.includes(element)) return frame
    }
  }
  return null
})

const elementFrameLayout     = computed(() => parseFrameLayout(elementFrame.value?.type))
const isElementInMultiColFrame = computed(() => elementFrameLayout.value in MULTI_COL_COUNTS)
const elementColCount         = computed(() => MULTI_COL_COUNTS[elementFrameLayout.value] || 0)

const elementColWidths = computed(() => {
  if (!isElementInMultiColFrame.value || !elementFrame.value) return []
  const stored = elementFrame.value.data?.columnWidths
  const n = elementColCount.value
  if (Array.isArray(stored) && stored.length === n) return stored
  const layout = elementFrameLayout.value
  if (layout in COMPOSITE_DEFAULTS) return COMPOSITE_DEFAULTS[layout]
  if (n === 2) return [50, 50]
  if (n === 3) return [34, 33, 33]
  if (n === 4) return [25, 25, 25, 25]
  return []
})

const elementColLabels = computed(() => {
  if (['A', 'B', 'C', 'D'].includes(elementFrameLayout.value)) return ['左欄', '右欄']
  return elementColWidths.value.map((_, i) => `欄 ${i + 1}`)
})

const _applyColWidths = (frame, n, current, index, rawVal) => {
  const min = 10
  const max = 100 - (n - 1) * min
  const newVal = Math.min(Math.max(min, Math.round(rawVal)), max)
  if (!frame.data) frame.data = {}
  if (n === 2) {
    const w = [0, 0]; w[index] = newVal; w[1 - index] = 100 - newVal
    frame.data.columnWidths = w; return
  }
  const others = Array.from({ length: n }, (_, i) => i).filter(i => i !== index)
  const otherSum = others.reduce((s, i) => s + current[i], 0)
  const newOtherSum = 100 - newVal
  const newWidths = [...current]; newWidths[index] = newVal
  let allocated = 0
  for (let k = 0; k < others.length - 1; k++) {
    const i = others[k]
    const ratio = otherSum > 0 ? current[i] / otherSum : 1 / others.length
    newWidths[i] = Math.max(min, Math.round(ratio * newOtherSum))
    allocated += newWidths[i]
  }
  newWidths[others[others.length - 1]] = Math.max(min, newOtherSum - allocated)
  frame.data.columnWidths = newWidths
}

const updateElementColWidth = (index, rawVal) => {
  const frame = elementFrame.value
  if (!frame) return
  _applyColWidths(frame, elementColCount.value, [...elementColWidths.value], index, rawVal)
}

const resetElementColWidths = () => {
  const frame = elementFrame.value
  if (!frame) return
  if (!frame.data) frame.data = {}
  const layout = elementFrameLayout.value
  if (layout in COMPOSITE_DEFAULTS) { frame.data.columnWidths = [...COMPOSITE_DEFAULTS[layout]]; return }
  const n = elementColCount.value
  if (n === 2) frame.data.columnWidths = [50, 50]
  else if (n === 3) frame.data.columnWidths = [34, 33, 33]
  else if (n === 4) frame.data.columnWidths = [25, 25, 25, 25]
}

const flattenPageTree = (nodes, depth = 0) => {
  const result = []
  for (const n of nodes || []) {
    result.push({ slug: n.slug, label: n.tab || n.seoTitle || n.slug, depth })
    if (n.children?.length) result.push(...flattenPageTree(n.children, depth + 1))
  }
  return result
}
const navPages = computed(() => flattenPageTree(store.pageTree))

const onImgSelectPage = (slug) => {
  up('linkPage', slug)
  up('link', slug ? `/${slug}` : '')
}

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

// IMG upload
const handleImgUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const targetEl = el.value
  if (!targetEl) return
  uploading.value = true
  const result = await store.uploadImage(file)
  if (result && targetEl.value) {
    targetEl.value.src = result.fileUrl
    targetEl.value.id  = result.id
  }
  uploading.value = false
  e.target.value = ''
}

// Carousel image upload / manage
const carouselImgUploading = ref(false)

const handleCarouselImgUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const targetEl = el.value
  if (!targetEl) return
  carouselImgUploading.value = true
  const result = await store.uploadImage(file)
  if (result && targetEl.value) {
    const imgs = [...(targetEl.value.imgs || [])]
    imgs.push({ id: result.id, src: result.fileUrl })
    targetEl.value.imgs = imgs
  }
  carouselImgUploading.value = false
  e.target.value = ''
}

const removeCarouselImg = (i) => {
  const imgs = [...(v('imgs') || [])]
  imgs.splice(i, 1)
  up('imgs', imgs)
}

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
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
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
  position: sticky;
  top: 0;
  z-index: 1;
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
  padding: 14px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fafafa;
}

// ── Padding section ──
.prop-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.prop-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.02em;
  border-bottom: 1px solid #f3f4f6;

  &--btn {
    cursor: pointer;
    user-select: none;
    &:hover { background: #f9fafb; }
  }
}

.section-title-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-chevron {
  width: 13px;
  height: 13px;
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  transform: rotate(0deg);

  &.is-open { transform: rotate(180deg); }
}

.pad-device-badge {
  font-size: 10px;
  font-weight: 500;
  color: #0891B2;
  background: #e0f2fe;
  padding: 1px 7px;
  border-radius: 10px;
  letter-spacing: 0.01em;
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

// ── Unit row (number + unit select) ──
.unit-row {
  display: flex;
  gap: 4px;
}

.unit-num { flex: 1; min-width: 0; }

.unit-suffix {
  font-size: 12px;
  color: #9ca3af;
  padding: 0 8px;
  align-self: center;
  flex-shrink: 0;
}

.unit-select {
  width: 54px;
  flex-shrink: 0;
  padding: 6px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
  background: #fff;
  font-family: inherit;
  text-align: center;
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
  gap: 4px;
  align-items: center;
  justify-items: center;
  padding: 10px 12px 12px;
}

.pad-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: 100%;
}

.pad-dir {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.pad-input {
  width: 100%;
  padding: 5px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  font-size: 12px;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.1); }
}

.pad-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 4px 0;
}

.pad-center-box {
  width: 30px;
  height: 30px;
  border: 2px solid #e5e7eb;
  border-radius: 5px;
  background: #f9fafb;
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

// ── Carousel image thumbnail list ──
.carousel-img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.carousel-img-item {
  position: relative;
  flex-shrink: 0;

  &:hover .list-del { display: flex; }
  .list-del {
    display: none;
    position: absolute;
    top: -5px;
    right: -5px;
    width: 16px;
    height: 16px;
    font-size: 9px;
    border-radius: 50%;
  }
}

.carousel-img-thumb {
  width: 64px;
  height: 44px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
}

// ── Carousel wall card UI ──
.cw-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
}

.cw-img-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cw-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.cw-card-thumb {
  width: 56px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  background: #f3f4f6;

  &--empty {
    background: #e5e7eb;
    border: 1px dashed #d1d5db;
  }
}

.cw-card-num {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.cw-device-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-bottom: 1px solid #f3f4f6;
}

.cw-device-label {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  min-width: 28px;
  flex-shrink: 0;
}

.cw-device-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.cw-device-thumb {
  width: 60px;
  height: 38px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  background: #f3f4f6;
}

.cw-device-remove {
  width: 20px;
  height: 20px;
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

.cw-upload-btn-sm {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 8px;
  border: 1px dashed #d1d5db;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
  min-width: 0;

  &:hover { border-color: #0891B2; color: #0891B2; background: #f0f9ff; }
  &.loading { opacity: 0.6; cursor: not-allowed; }
}

.cw-card-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 7px 10px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child { border-bottom: none; }
}

.cw-style-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;

  &:hover { background: #f9fafb; }
}

.cw-style-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fafafa;
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

// ── Column width editor ──
.col-width-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.col-reset-btn {
  font-size: 10px;
  color: #9ca3af;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 1px 7px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover { border-color: #0891B2; color: #0891B2; }
}

.col-width-preview {
  display: flex;
  height: 26px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  gap: 1px;
  margin-bottom: 8px;
}

.col-preview-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #0891B2;
  background: #e0f2fe;
  min-width: 0;
  overflow: hidden;
  transition: flex 0.15s;
}

.col-width-rows {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.col-width-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.col-width-label {
  font-size: 11px;
  color: #6b7280;
  min-width: 30px;
  flex-shrink: 0;
}

.col-width-slider {
  flex: 1;
  accent-color: #0891B2;
  cursor: pointer;
  height: 4px;
  min-width: 0;
}

.col-width-num {
  width: 42px;
  padding: 3px 5px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  font-size: 11px;
  text-align: right;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  font-family: inherit;
  flex-shrink: 0;
  &:focus { border-color: #0891B2; }
}

.col-unit {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
}
</style>
