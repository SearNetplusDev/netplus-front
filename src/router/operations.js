const operations = [
  {
    path: '/operaciones',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'tecnicos',
        name: 'operaciones.tecnicos',
        component: () => import('pages/operations/technical/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Solución de soportes', permission: [48, 49] },
      },
    ],
  },
]

export default operations
