const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/auth/LoginPage.vue'),
  },
  {
    path: '/',
    // redirect: '/login',
    component: () => import('pages/auth/LoginPage.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
