const dashboard = [
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard', permission: [27] },
      },
    ],
  },
]
export default dashboard
