const clients = [
  {
    path: '/clientes',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/clients/IndexPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
]

export default clients
