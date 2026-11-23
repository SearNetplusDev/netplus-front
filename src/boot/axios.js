import { boot } from 'quasar/wrappers'
import { api, axios } from 'src/utils/api.js'
import { useAuthStore } from 'stores/auth.js'

export default boot(({ app, router }) => {
  let isRedirecting = false

  api.interceptors.response.use(
    (response) => response,
    async (err) => {
      const status = err.response?.status
      const url = err.config?.url || ''

      /**
       * /api/user se excluye porque el guard del router ya maneja su fallo
       */
      const excludedRoutes = [
        '/api/v1/auth/login',
        '/api/v1/auth/logout',
        '/sanctum-csrf-cookie',
        '/api/user',
      ]

      const isExcluded = excludedRoutes.some((route) => url.includes(route))

      if ((status === 401 || status === 419) && !isExcluded && !isRedirecting) {
        isRedirecting = true

        try {
          //  Clave: limpiar el estado antes de la redirección
          const auth = useAuthStore()
          auth.clearSession()

          if (router.currentRoute.value.name !== 'login') {
            await router.replace({ name: 'login' })
          }
        } finally {
          isRedirecting = false
        }
      }
      return Promise.reject(err)
    },
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
