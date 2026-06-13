const accounting = [
  {
    path: '/contabilidad',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dte',
        name: 'contabilidad.dte',
        component: () => import('pages/accounting/dte/IndexPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Documentos Tributarios Electrónicos',
          permissions: [55],
        },
      },
      {
        path: 'opciones/eventos',
        name: 'contabilidad.opciones.eventos',
        component: () => import('pages/accounting/options/events/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Eventos tributarios', permissions: [56, 57] },
      },
    ],
  },
]
export default accounting
