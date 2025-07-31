const infrastructure = [
  {
    path: '/infraestructura',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, permission: [5] },
    children: [
      {
        path: 'redes/servidores',
        name: 'infraestructura.redes.servidores',
        component: () => import('pages/infrastructure/network/auth-server/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Servidores de autenticación', permission: [8] },
      },
      {
        path: 'redes/nodos',
        name: 'infraestructura.redes.nodos',
        component: () => import('pages/infrastructure/network/nodes/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Nodos', permission: [7] },
      },
      {
        path: 'redes/equipos',
        name: 'infraestructura.redes.equipos',
        component: () => import('pages/infrastructure/equipment/equipment/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Equipos', permission: [23] },
      },
      {
        path: 'equipos/tipos',
        name: 'infraestructura.equipos.tipos',
        component: () => import('pages/infrastructure/equipment/types/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de equipos', permission: [14] },
      },
      {
        path: 'equipos/marcas',
        name: 'infraestructura.equipos.marcas',
        component: () => import('pages/infrastructure/equipment/brands/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Marcas', permission: [15] },
      },
      {
        path: 'equipos/modelos',
        name: 'infraestructura.equipos.modelos',
        component: () => import('pages/infrastructure/equipment/models/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Modelos', permission: [16] },
      },
    ],
  },
]

export default infrastructure
