<template>
  <div class="renderer">
    <template v-if="!isEmpty">
      <component :is="currentComponent" v-if="currentComponent" :val="val" :meta="meta" />
      <div v-else class="placeholder">
        <span>{{ type }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TextElement      from '@angke/ui/components/elements/TextElement.vue'
import ImageElement     from '@angke/ui/components/elements/ImageElement.vue'
import ButtonElement    from '@angke/ui/components/elements/ButtonElement.vue'
import CarouselElement  from '@angke/ui/components/elements/CarouselElement.vue'
import MapElement       from '@angke/ui/components/elements/MapElement.vue'
import AccordionElement from '@angke/ui/components/elements/AccordionElement.vue'
import IframeElement    from '@angke/ui/components/elements/IframeElement.vue'
import HlineElement     from '@angke/ui/components/elements/HlineElement.vue'

const ELEMENT_MAP: Record<string, any> = {
  TEXT:         TextElement,
  IMG:          ImageElement,
  BUTTON:       ButtonElement,
  CAROUSEL_IMG: CarouselElement,
  GOOGLE_MAP:   MapElement,
  ACCORDION:    AccordionElement,
  IFRAME:       IframeElement,
  HORIZON_LINE: HlineElement,
}

const props = defineProps<{
  element:   Record<string, any> | null
  cellIndex: number
}>()

const route            = useRoute()
const locale           = computed(() => String(route.params.locale || '').toLowerCase())

const isEmpty          = computed(() => !props.element || !props.element.type)
const type             = computed(() => props.element?.type)
const val              = computed(() => {
  const raw = props.element?.value || {}
  // 站內頁面連結（存成 /slug）補上目前語系前綴 → /zh-tw/slug
  if (raw.linkType === 'page' && typeof raw.link === 'string' && raw.link.startsWith('/') && locale.value) {
    return { ...raw, link: `/${locale.value}${raw.link}` }
  }
  return raw
})
const meta             = computed(() => props.element?.metadata || {})
const currentComponent = computed(() => ELEMENT_MAP[type.value ?? ''] ?? null)
</script>

<style scoped>
.renderer { width: 100%; min-height: 20px; }
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 12px;
  background: #f9fafb;
  border-radius: 6px;
}
</style>
