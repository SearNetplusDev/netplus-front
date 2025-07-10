const billing = [
  {
    path: '/facturacion',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'opciones/tipos/documentos',
        name: 'facturacion.opciones.tipos.documentos',
        component: () => import('pages/billing/options/documents/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de documentos' },
      },
      {
        path: 'opciones/tipos/actividades',
        name: 'facturacion.opciones.tipos.actividades',
        component: () => import('pages/billing/options/activities/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de actividades' },
      },
    ],
  },
]

export default billing
