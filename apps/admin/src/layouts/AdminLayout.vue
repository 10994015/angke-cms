<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  title: { type: String, default: '' },
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)

onMounted(() => {
  console.log(
    '[AdminLayout] systemPermissions:',
    JSON.parse(JSON.stringify(authStore.systemPermissions))
  )
})

const PERMISSION_MAP = {
  '網站管理':    { path: '/websites', icon: 'globe',  group: '內容管理' },
  '帳號管理':    { path: '/users',    icon: 'users',  group: '會員管理' },
  '權限角色管理': { path: '/roles',    icon: 'shield', group: '會員管理' },
  '信件管理':    { path: '/mail',     icon: 'mail',   group: '通訊'   },
  '系統日誌查詢': { path: '/logs',     icon: 'log',    group: '系統'   },
}

const GROUP_ORDER = ['內容管理', '會員管理', '通訊', '系統']

const navGroups = computed(() => {
  const permissions = authStore.systemPermissions || []
  const grouped = {}
  for (const perm of permissions) {
    const mapping = PERMISSION_MAP[perm.permissionName]
    if (!mapping) continue
    if (!grouped[mapping.group]) grouped[mapping.group] = []
    grouped[mapping.group].push({ label: perm.permissionName, path: mapping.path, icon: mapping.icon })
  }
  return GROUP_ORDER
    .filter(g => grouped[g]?.length)
    .map(g => ({ title: g, items: grouped[g] }))
})

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'is-collapsed': collapsed }">
      <div class="sidebar-header">
        <img src="/images/logo.png" alt="Logo" class="sidebar-logo" />
        <span v-show="!collapsed" class="sidebar-brand">Angke On Prem</span>

        <!-- 收合按鈕 -->
        <button class="sidebar-collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? '展開側欄' : '收合側欄'">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" v-if="!collapsed"/>
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" v-else/>
          </svg>
        </button>
      </div>

      <div v-show="!collapsed" class="sidebar-account" @click="router.push('/profile')">
        <div class="account-info">
          <span class="account-name">{{ authStore.user?.name }}</span>
          <span class="account-badge">管理員</span>
        </div>
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="color:#9ca3af;flex-shrink:0">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>

      <nav class="sidebar-nav">
        <div v-for="(group, gi) in navGroups" :key="gi" class="nav-group">
          <p v-if="group.title && !collapsed" class="nav-group-title">{{ group.title }}</p>
          <div v-else-if="group.title && collapsed" class="nav-group-divider" />
          <template v-for="item in group.items" :key="item.path">
            <a
              class="nav-item"
              :class="{ active: isActive(item.path) }"
              :title="collapsed ? item.label : ''"
              @click="router.push(item.path)"
            >
              <!-- Globe -->
              <svg v-if="item.icon === 'globe'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/>
              </svg>
              <!-- Home -->
              <svg v-else-if="item.icon === 'home'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <!-- Clock -->
              <svg v-else-if="item.icon === 'clock'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <!-- Users -->
              <svg v-else-if="item.icon === 'users'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <!-- Shield -->
              <svg v-else-if="item.icon === 'shield'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <!-- Mail -->
              <svg v-else-if="item.icon === 'mail'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <!-- Log -->
              <svg v-else-if="item.icon === 'log'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
              <!-- Settings -->
              <svg v-else-if="item.icon === 'settings'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
              </svg>

              <span v-show="!collapsed">{{ item.label }}</span>
              <svg v-show="!collapsed" class="nav-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
            </a>
          </template>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="btn-logout" :title="collapsed ? '登出' : ''" @click="handleLogout">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
          </svg>
          <span v-show="!collapsed">登出</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-wrapper">
      <header class="main-header">
        <h1 class="page-title"><slot name="title">{{ title }}</slot></h1>
      </header>
      <main class="main-body">
        <div v-if="$slots['header-actions']" class="body-toolbar">
          <slot name="header-actions" />
        </div>
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: 'Noto Sans TC', system-ui, sans-serif;
  background: #f6f6f7;
}

/* ===== SIDEBAR ===== */
.sidebar {
  flex-shrink: 0;
  width: 240px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.22s ease;

  &.is-collapsed {
    width: 56px;

    .sidebar-header { justify-content: center; padding: 12px 8px; }
    .sidebar-logo   { height: 24px; }
    .nav-item       { justify-content: center; padding: 10px 0; }
    .sidebar-footer { padding: 10px 8px; }
    .btn-logout     { justify-content: center; padding: 8px; }
    .nav-group-divider { display: block; }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  min-height: 56px;
}

.sidebar-logo {
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-brand {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  flex: 1;
  overflow: hidden;
}

.sidebar-collapse-btn {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0;
  transition: background 0.1s, color 0.1s;

  &:hover { background: #f3f4f6; color: #374151; }
}

.sidebar-account {
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s;

  &:hover { background: #f9fafb; }
}

.account-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-name {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.account-badge {
  font-size: 11px;
  background: #f0f9ff;
  color: #0891B2;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 500;
}


.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
}

.nav-group { margin-bottom: 4px; }

.nav-group-title {
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
  white-space: nowrap;
}

.nav-group-divider {
  display: none;
  height: 1px;
  background: #f3f4f6;
  margin: 4px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 13.5px;
  color: #374151;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.1s, color 0.1s;
  border-right: 2px solid transparent;
  white-space: nowrap;

  &:hover { background: #f3f4f6; color: #111827; }
  &.active {
    background: #f0f9ff;
    color: #0891B2;
    border-right-color: #0891B2;
    font-weight: 500;
  }
}

.nav-icon { width: 16px; height: 16px; flex-shrink: 0; }

.nav-arrow {
  width: 14px;
  height: 14px;
  margin-left: auto;
  opacity: 0.4;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  font-family: inherit;
  transition: background 0.1s, color 0.1s;
  width: 100%;
  white-space: nowrap;

  &:hover { background: #f3f4f6; color: #374151; }
}

/* ===== MAIN ===== */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 28px;
  height: 52px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.main-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

.body-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
</style>
