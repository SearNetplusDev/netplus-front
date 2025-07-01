const billing = [
  {
    path: '/facturacion',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'opciones/tipos-documentos',
        name: 'facturacion.opciones.tipos',
        component: () => import('pages/billing/options/documents/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de documentos' },
      },
    ],
  },
]

export default billing
