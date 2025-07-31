const configuration = [
  {
    path: '/configuracion',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, permission: [1] },
    children: [
      {
        path: 'menu',
        name: 'configuracion.menu',
        component: () => import('pages/configuration/menu/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Menú', permission: [24] },
      },
      {
        path: 'sucursales',
        name: 'configuracion.sucursales',
        component: () => import('pages/configuration/branches/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Sucursales', permission: [29] },
      },
      {
        path: 'geografia/paises',
        name: 'configuracion.geografia.paises',
        component: () => import('pages/configuration/geography/countries/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Países', permission: [12] },
      },
      {
        path: 'geografia/departamentos',
        name: 'configuracion.geografia.departamentos',
        component: () => import('pages/configuration/geography/states/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Departamentos', permission: [13] },
      },
      {
        path: 'geografia/municipios',
        name: 'configuracion.geografia.municipios',
        component: () => import('pages/configuration/geography/municipalities/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Municipios', permission: [35] },
      },
      {
        path: 'geografia/distritos',
        name: 'configuracion.geografia.distritos',
        component: () => import('pages/configuration/geography/districts/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Distritos', permission: [36] },
      },
      {
        path: 'clientes/documentos',
        name: 'configuracion.clientes.documentos',
        component: () => import('pages/configuration/clients/documents/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Documentos de identidad', permission: [32] },
      },
      {
        path: 'clientes/genero',
        name: 'configuracion.clientes.genero',
        component: () => import('pages/configuration/clients/gender/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Géneros', permission: [33] },
      },
      {
        path: 'clientes/estado-civil',
        name: 'configuracion.clientes.estado-civil',
        component: () => import('pages/configuration/clients/marital_status/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Estado Civil', permission: [34] },
      },
      {
        path: 'clientes/tipos',
        name: 'configuracion.clientes.tipos',
        component: () => import('pages/configuration/clients/types/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de Clientes', permission: [2] },
      },
      {
        path: 'clientes/telefonos',
        name: 'configuracion.clientes.telefonos',
        component: () => import('pages/configuration/clients/phones/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de Teléfono', permission: [39] },
      },
      {
        path: 'clientes/parentescos',
        name: 'configuracion.clientes.parentescos',
        component: () => import('pages/configuration/clients/kinship/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Parentescos', permission: [40] },
      },
      {
        path: 'clientes/contratos',
        name: 'configuracion.clientes.contratos',
        component: () => import('pages/configuration/clients/contracts/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Estados para contratos', permission: [4] },
      },
      {
        path: 'infraestructura/equipos/estados',
        name: 'configuracion.infraestructura.equipos.estados',
        component: () =>
          import('pages/configuration/infrastructure/equipment/status/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Estados para equipos', permission: [9] },
      },
    ],
  },
]
export default configuration
