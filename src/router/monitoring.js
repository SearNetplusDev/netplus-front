const monitoring = [
  {
    path: '/monitoreo',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'internet',
        name: 'monitoreo.internet',
        component: () => import('pages/monitoring/internet/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Monitoreo de Internet', permission: [59] },
      },
    ],
  },
]
export default monitoring
