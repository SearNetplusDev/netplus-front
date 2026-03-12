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
    ],
  },
]
export default accounting
