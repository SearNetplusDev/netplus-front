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
      {
        path: 'geografia/departamentos',
        name: 'configuracion.geografia.departamentos',
        component: () => import('pages/configuration/geography/states/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Configuración > Geografía > Departamentos' },
      },
      {
        path: 'geografia/municipios',
        name: 'configuracion.geografia.municipios',
        component: () => import('pages/configuration/geography/municipalities/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Configuración > Geografía > Municipios' },
      },
    ],
  },
]
export default configuration
