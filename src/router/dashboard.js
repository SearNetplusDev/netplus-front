import MainLayout from 'layouts/MainLayout.vue'

const dashboard = [
  {
    path: '/dashboard',
    component: MainLayout,
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
