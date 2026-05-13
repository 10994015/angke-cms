<template>
  <div :class="['ndm', isPortal ? 'ndm--portal' : (depth === 0 ? 'ndm--root' : 'ndm--sub')]">
    <div
      v-for="item in items"
      :key="item.slug"
      class="ndm-row"
      @mouseenter="onEnter(item.slug)"
      @mouseleave="onLeave"
    >
      <a
        href="#"
        :class="['ndm-link', { 'ndm-link--active': nav.isActive(item.slug), 'ndm-link--has-sub': nav.hasChildren(item.slug) }]"
        @click.prevent="nav.navigate(item.slug)"
      >
        <span class="ndm-label">{{ item.tab || item.name || item.slug }}</span>
        <svg v-if="nav.hasChildren(item.slug)" class="ndm-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </a>
      <transition name="ndm-sub">
        <NavDropdownMenu
          v-if="hoveredSlug === item.slug && nav.hasChildren(item.slug)"
          :items="nav.getChildren(item.slug)"
          :depth="depth + 1"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'NavDropdownMenu' })
import { ref, inject } from 'vue'

defineProps({
  items:    { type: Array,   default: () => [] },
  depth:    { type: Number,  default: 0 },
  isPortal: { type: Boolean, default: false },
})

const nav = inject('navDropdownState')
const hoveredSlug = ref(null)

const onEnter = async (slug) => {
  hoveredSlug.value = slug
  await nav.ensureChildren(slug)
}

const onLeave = () => { hoveredSlug.value = null }
</script>

<style scoped lang="scss">
.ndm {
  display: flex;
  flex-direction: column;
  padding: 4px;

  &--root {
    position: absolute;
    top: calc(100% - 4px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 164px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    z-index: 500;
  }

  &--sub {
    position: absolute;
    top: -4px;
    left: calc(100% + 6px);
    min-width: 164px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    z-index: 600;
  }

  &--portal {
    transform: translateX(-50%);
    min-width: 164px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.ndm-row { position: relative; }

.ndm-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  cursor: pointer;

  &:hover { background: #f0f9ff; color: #0891B2; }
  &--active { color: #0891B2; font-weight: 600; background: #e0f2fe; }
}

.ndm-arrow {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  transform: rotate(-90deg);
  opacity: 0.5;
}

.ndm-sub-enter-active { transition: opacity 0.15s, transform 0.15s; }
.ndm-sub-leave-active { transition: opacity 0.1s; }
.ndm-sub-enter-from { opacity: 0; transform: translateX(-4px); }
.ndm-sub-leave-to { opacity: 0; }
</style>
