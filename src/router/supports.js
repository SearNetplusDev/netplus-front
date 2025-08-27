const supports = [
  {
    path: '/soportes',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, permissions: [44] },
    children: [
      // {
      //   path: '',
      //   name: 'soportes.listado',
      //   component: () => import('pages/supports/status/IndexPage.vue'),
      //   meta: { requiresAuth: true, title: 'Soportes', permissions: [45] },
      // },
      {
        path: 'tipos',
        name: 'soportes.tipos',
        component: () => import('pages/supports/types/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Tipos de soportes', permissions: [46] },
      },
      {
        path: 'estados',
        name: 'soportes.estados',
        component: () => import('pages/supports/status/IndexPage.vue'),
        meta: { requiresAuth: true, title: 'Estados para los soportes', permissions: [47] },
      },
    ],
  },
]
export default supports
