const configuration = [
  {
    path: '/configuracion',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'menu',
        name: 'configuracion.menu',
        component: () => import('pages/configuration/menu/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Configuración > Menú' },
      },
      {
        path: 'geografia/paises',
        name: 'configuracion.geografia.paises',
        component: () => import('pages/configuration/geography/countries/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Configuración > Geografía > Países' },
      },
    ],
  },
]
export default configuration
