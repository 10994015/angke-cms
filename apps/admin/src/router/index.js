import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      redirect: '/websites',
    },
    {
      path: '/init-password/:token',
      name: 'init-password',
      component: () => import('../views/InitPasswordView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile/change-password',
      name: 'profile.change-password',
      component: () => import('../views/ChangePasswordView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users/create',
      name: 'users.create',
      component: () => import('../views/UserCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users/:id',
      name: 'users.detail',
      component: () => import('../views/UserDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/websites',
      name: 'websites',
      component: () => import('../views/WebSiteListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/websites/:siteId/pages',
      name: 'websites.pages',
      component: () => import('../views/PageManagementView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mail',
      name: 'mail',
      component: () => import('../views/MailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mail/create',
      name: 'mail.create',
      component: () => import('../views/MailCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mail/:id/edit',
      name: 'mail.edit',
      component: () => import('../views/MailEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('../views/SystemLogView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/roles/create',
      name: 'roles.create',
      component: () => import('../views/RoleCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/roles/:id/edit',
      name: 'roles.edit',
      component: () => import('../views/RoleEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/roles/:id/members',
      name: 'roles.members',
      component: () => import('../views/RoleMembersView.vue'),
      meta: { requiresAuth: true },
    },
    // ── CMS 頁面編輯器（全頁，無 AdminLayout 側邊欄）──
    {
      path: '/editor',
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
      redirect: '/websites',
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const isAuth = await authStore.checkAuth()

  if (to.meta.requiresAuth && !isAuth) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresGuest && isAuth) {
    return '/websites'
  }
})

export default router
