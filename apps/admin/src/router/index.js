import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PERMISSIONS } from '@/utils/permissions'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/backend/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/backend/dashboard',
      redirect: '/backend/websites',
    },
    {
      path: '/backend/init-password/:token',
      name: 'init-password',
      component: () => import('../views/InitPasswordView.vue'),
    },
    {
      path: '/backend/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/backend/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/backend/profile/change-password',
      name: 'profile.change-password',
      component: () => import('../views/ChangePasswordView.vue'),
      meta: { requiresAuth: true },
    },

    // ── 帳號管理 ──
    {
      path: '/backend/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.ACCOUNT_MANAGEMENT, permissionMode: 'Readonly' },
    },
    {
      path: '/backend/users/create',
      name: 'users.create',
      component: () => import('../views/UserCreateView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.ACCOUNT_MANAGEMENT, permissionMode: 'FULL' },
    },
    {
      path: '/backend/users/:id',
      name: 'users.detail',
      component: () => import('../views/UserDetailView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.ACCOUNT_MANAGEMENT, permissionMode: 'Readonly' },
    },

    // ── 網站管理 ──
    {
      path: '/backend/websites',
      name: 'websites',
      component: () => import('../views/WebSiteListView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.WEBSITE_MANAGEMENT, permissionMode: 'Readonly' },
    },
    {
      path: '/backend/websites/:siteId/pages',
      name: 'websites.pages',
      component: () => import('../views/PageManagementView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.WEBSITE_MANAGEMENT, permissionMode: 'Readonly' },
    },

    // ── 信件管理 ──
    {
      path: '/backend/mail',
      name: 'mail',
      component: () => import('../views/MailView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.MAIL_MANAGEMENT, permissionMode: 'Readonly' },
    },
    {
      path: '/backend/mail/create',
      name: 'mail.create',
      component: () => import('../views/MailCreateView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.MAIL_MANAGEMENT, permissionMode: 'FULL' },
    },
    {
      path: '/backend/mail/:id/edit',
      name: 'mail.edit',
      component: () => import('../views/MailEditView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.MAIL_MANAGEMENT, permissionMode: 'FULL' },
    },

    // ── 系統日誌 ──
    {
      path: '/backend/logs',
      name: 'logs',
      component: () => import('../views/SystemLogView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.LOG_MANAGEMENT, permissionMode: 'Readonly' },
    },

    // ── 權限角色管理 ──
    {
      path: '/backend/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.ROLE_MANAGEMENT, permissionMode: 'Readonly' },
    },
    {
      path: '/backend/roles/create',
      name: 'roles.create',
      component: () => import('../views/RoleCreateView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.ROLE_MANAGEMENT, permissionMode: 'FULL' },
    },
    {
      path: '/backend/roles/:id/edit',
      name: 'roles.edit',
      component: () => import('../views/RoleEditView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.ROLE_MANAGEMENT, permissionMode: 'Readonly' },
    },
    {
      path: '/backend/roles/:id/members',
      name: 'roles.members',
      component: () => import('../views/RoleMembersView.vue'),
      meta: { requiresAuth: true, permission: PERMISSIONS.ROLE_MEMBER_MANAGEMENT, permissionMode: 'FULL' },
    },

    // ── CMS 頁面編輯器（全頁，無 AdminLayout 側邊欄）──
    {
      path: '/backend/editor',
      component: () => import('../layouts/EditorLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: ':templeId/page-editor',
          name: 'editor.page-editor',
          component: () => import('../views/Editor/PageEditor.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: ':templeId/preview',
          name: 'app.temple.preview',
          component: () => import('../views/Editor/PreviewPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'demo',
          name: 'editor.demo',
          component: () => import('../views/Editor/PageEditor.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/backend/websites',
    },
  ],
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  const isAuth = await authStore.checkAuth()

  if (to.meta.requiresAuth && !isAuth) {
    return { path: '/backend/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresGuest && isAuth) {
    return '/backend/websites'
  }

  if (to.meta.permission) {
    const permissionName = to.meta.permission
    const requiredMode   = to.meta.permissionMode || 'Readonly'
    const hasPermission  = authStore.hasPermission(permissionName, requiredMode)

    if (!hasPermission) {
      // Has readonly but page requires FULL — warn and stay
      if (requiredMode === 'FULL' && authStore.hasPermission(permissionName, 'Readonly')) {
        alert('您沒有執行此操作的權限')
        return from.path || '/backend/websites'
      }
      // No permission at all — redirect to home
      return '/backend/websites'
    }
  }
})

export default router
