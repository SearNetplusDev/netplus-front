const services = [
  {
    path: '/servicios',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'servicios',
        component: () => import('pages/services/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Servicios', permission: [42] },
      },
    ],
  },
]
export default services
