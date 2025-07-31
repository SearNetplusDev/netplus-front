const management = [
  {
    path: '/administracion',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, permission: [28] },
    children: [
      {
        path: 'usuarios',
        name: 'administracion.usuarios',
        component: () => import('pages/management/users/UsersIndex.vue'),
        meta: { requiresAuth: true, title: 'Administración de Usuarios', permission: [20] },
      },
      {
        path: '/administracion/roles',
        name: 'administracion.roles',
        component: () => import('pages/management/roles/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Roles', permission: [25] },
      },
      {
        path: '/administracion/permisos',
        name: 'administracion.permisos',
        component: () => import('pages/management/permissions/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Permisos', permission: [26] },
      },
      {
        path: 'perfiles/internet',
        name: 'administracion.perfiles.internet',
        component: () => import('pages/management/profiles/internet/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Perfiles de internet disponibles', permission: [22] },
      },
    ],
  },
]

export default management
