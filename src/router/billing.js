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
        meta: { requiresAuth: true, title: 'Tipos de documentos', permission: [38] },
      },
      {
        path: 'opciones/tipos/actividades',
        name: 'facturacion.opciones.tipos.actividades',
        component: () => import('pages/billing/options/activities/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de actividades', permission: [3] },
      },
      {
        path: 'opciones/estados',
        name: 'facturacion.opciones.estados',
        component: () => import('pages/billing/options/status/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Estados de factura', permission: [50] },
      },
      {
        path: 'opciones/descuentos',
        name: 'facturacion.opciones.descuentos',
        component: () => import('pages/billing/options/discounts/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Catálogo de descuentos', permission: [51] },
      },
      {
        path: 'opciones/formas/pago',
        name: 'facturacion.opciones.formas.pago',
        component: () => import('pages/billing/options/payment_methods/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Formas de pago', permission: [52] },
      },
      {
        path: 'facturas',
        name: 'facturacion.facturas',
        component: () => import('pages/billing/invoices/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Listado de facturas', permission: [53] },
      },
    ],
  },
]

export default billing
