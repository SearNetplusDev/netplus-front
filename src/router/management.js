const management = [
  {
    path: '/administracion',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'usuarios',
        name: 'administracion.usuarios',
        component: () => import('pages/management/users/UsersIndex.vue'),
        meta: { requiresAuth: true, title: 'Administración de Usuarios' },
      },
      {
        path: '/administracion/roles',
        name: 'administracion.roles',
        component: () => import('pages/management/roles/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Roles' },
      },
      {
        path: '/administracion/permisos',
        name: 'administracion.permisos',
        component: () => import('pages/management/permissions/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Permisos' },
      },
      {
        path: 'perfiles/internet',
        name: 'administracion.perfiles.internet',
        component: () => import('pages/management/profiles/internet/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Perfiles de internet disponibles' },
      },
    ],
  },
]

export default management
