<template>
  <div class="el-image" :class="{ 'el-image--empty': !val.src }">
    <!-- 有超連結時（僅前台）包一層 a；編輯器內維持可點選編輯 -->
    <component
      :is="hasLink ? 'a' : 'div'"
      class="el-image-inner"
      v-bind="hasLink ? { href: val.link, target: val.linkTarget || '_self', rel: val.linkTarget === '_blank' ? 'noopener noreferrer' : undefined } : {}"
    >
      <img
        v-if="val.src"
        :src="val.src"
        :alt="val.alt || ''"
        :style="{
          objectFit:    val.objectFit    || 'cover',
          width:        ensureUnit(val.width, undefined),
          height:       ensureUnit(val.height, undefined),
          borderRadius: ensureUnit(val.borderRadius, undefined),
        }"
        class="el-image-img"
      />
    </component>
    <!-- 僅編輯器顯示上傳提示：預設圖 + 半透明黑遮罩 -->
    <div v-if="!val.src && editorHint" class="img-upload-overlay">
      <img :src="defaultImg" class="img-upload-bg" alt="" />
      <div class="img-upload-mask">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>請上傳圖片</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ensureUnit } from '../../utils/ensureUnit.js'

const props = defineProps<{
  val:        Record<string, any>
  meta?:      Record<string, any>
  editorHint?: boolean
}>()

// 編輯器上傳提示底圖：用變數綁定（而非靜態 src），避免打包器把 public 路徑當 import 解析
const defaultImg = '/images/default.png'

// 前台且有設定連結時，才包超連結（編輯器內不導頁，方便選取編輯）
const hasLink = computed(() => !props.editorHint && !!props.val.src && !!props.val.link)
</script>

<style scoped>
.el-image { width: 100%; max-width: 100%; display: block; position: relative; line-height: 0; }
.el-image--empty { min-height: 180px; }
.el-image-inner { display: block; width: 100%; }
a.el-image-inner { cursor: pointer; }
.el-image-img   { display: block; width: 100%; max-width: 100%; height: auto; border-radius: 4px; }

.img-upload-overlay {
  position: absolute;
  inset: 0;
  border-radius: 4px;
  overflow: hidden;
}
.img-upload-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-upload-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0,0,0,0.52);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.03em;
}
.img-upload-mask svg { width: 28px; height: 28px; opacity: 0.9; }
</style>
