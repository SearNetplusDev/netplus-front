const infrastructure = [
  {
    path: '/infraestructura',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'redes/servidores',
        name: 'infraestructura.redes.servidores',
        component: () => import('pages/infrastructure/network/auth-server/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Servidores de autenticación' },
      },
      {
        path: 'redes/nodos',
        name: 'infraestructura.redes.nodos',
        component: () => import('pages/infrastructure/network/nodes/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Nodos' },
      },
    ],
  },
]

export default infrastructure
