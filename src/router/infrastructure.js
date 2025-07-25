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
        path: 'redes/equipos',
        name: 'infraestructura.redes.equipos',
        component: () => import('pages/infrastructure/equipment/equipment/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Equipos' },
      },
      {
        path: 'equipos/tipos',
        name: 'infraestructura.equipos.tipos',
        component: () => import('pages/infrastructure/equipment/types/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de equipos' },
      },
      {
        path: 'equipos/marcas',
        name: 'infraestructura.equipos.marcas',
        component: () => import('pages/infrastructure/equipment/brands/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Marcas' },
      },
      {
        path: 'equipos/modelos',
        name: 'infraestructura.equipos.modelos',
        component: () => import('pages/infrastructure/equipment/models/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Modelos' },
      },
    ],
  },
]

export default infrastructure
