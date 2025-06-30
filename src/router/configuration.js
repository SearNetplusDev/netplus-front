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
        path: 'sucursales',
        name: 'configuracion.sucursales',
        component: () => import('pages/configuration/branches/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Configuración > Sucursales' },
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
      {
        path: 'geografia/distritos',
        name: 'configuracion.geografia.distritos',
        component: () => import('pages/configuration/geography/districts/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Configuración > Geografía > Distritos' },
      },
      {
        path: 'clientes/documentos',
        name: 'configuracion.clientes.documentos',
        component: () => import('pages/configuration/clients/documents/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Configuración > Clientes > Documentos' },
      },
      {
        path: 'clientes/sexo',
        name: 'configuracion.clientes.sexo',
        component: () => import('pages/configuration/clients/sex/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Configuración > Clientes > Sexo' },
      },
    ],
  },
]
export default configuration
