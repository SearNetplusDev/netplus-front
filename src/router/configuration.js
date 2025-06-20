import MainLayout from 'layouts/MainLayout.vue'
import IndexPage from 'pages/configuration/menu/IndexPage.vue'

const configuration = [
  {
    path: '/configuracion',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'menu',
        name: 'configuracion.menu',
        component: IndexPage,
        meta: { requiresAuth: true, title: 'Configuración > Menú' },
      },
    ],
  },
]
export default configuration
