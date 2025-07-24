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
      {
        path: 'equipos/tipos',
        name: 'infraestructura.equipos.tipos',
        component: () => import('pages/infrastructure/equipments/types/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de equipos' },
      },
      {
        path: 'equipos/marcas',
        name: 'infraestructura.equipos.marcas',
        component: () => import('pages/infrastructure/equipments/brands/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Marcas' },
      },
    ],
  },
]

export default infrastructure
