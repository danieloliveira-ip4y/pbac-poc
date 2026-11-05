import { createRouter, createWebHistory } from 'vue-router'
import { permissionGuard } from '@/modules/permissions/guards/permission.guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/pages/Forbidden.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/Dashboard.vue'),
      meta: {
        requiresAuth: true,
        permissions: ['dashboard.view'],
        permissionMode: 'all',
      },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/pages/Users.vue'),
      meta: {
        requiresAuth: true,
        permissions: ['users.view'],
        permissionMode: 'all',
      },
    },
    {
      path: '/users/delete-example',
      name: 'users-delete-example',
      component: () => import('@/pages/UserDelete.vue'),
      meta: {
        requiresAuth: true,
        permissions: ['users.delete'],
        permissionMode: 'all',
      },
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('@/pages/Reports.vue'),
      meta: {
        requiresAuth: true,
        permissions: ['reports.view'],
        permissionMode: 'all',
      },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/Settings.vue'),
      meta: {
        requiresAuth: true,
        permissions: ['settings.view'],
        permissionMode: 'all',
      },
    },
  ],
})

router.beforeEach(permissionGuard)

export default router
