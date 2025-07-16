import MainLayout from 'layouts/MainLayout.vue'

const management = [
  {
    path: '/administracion',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'usuarios',
        name: 'administracion.usuarios',
        component: () => import('pages/management/users/UsersIndex.vue'),
        meta: { requiresAuth: true, title: 'Administración de Usuarios' },
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
