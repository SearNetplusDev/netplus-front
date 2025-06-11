import MainLayout from 'layouts/MainLayout.vue'
import UsersIndex from 'pages/management/users/UsersIndex.vue'

const management = [
  {
    path: '/administracion',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'usuarios',
        name: 'administracion.usuarios',
        component: UsersIndex,
        meta: { requiresAuth: true, title: 'Administración > Usuarios' },
      },
    ],
  },
]

export default management
