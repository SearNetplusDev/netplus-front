import MainLayout from 'layouts/MainLayout.vue'
import DashboardPage from 'pages/dashboard/DashboardPage.vue'

const dashboard = [
  {
    path: '/dashboard',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
        meta: { requiresAuth: true, title: 'Dashboard', permission: [27] },
      },
    ],
  },
]
export default dashboard
