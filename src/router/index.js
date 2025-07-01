import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import dashboard from 'src/router/dashboard.js'
import configuration from 'src/router/configuration.js'
import clients from 'src/router/clients.js'
import management from 'src/router/management.js'
import billing from 'src/router/billing.js'
import { useAuthStore } from 'stores/auth.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: [...routes, ...dashboard, ...configuration, ...management, ...clients, ...billing],

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  /*
   * Validate auth middleware
   * */

  Router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()
    let isLoggedIn = auth.isAuthenticated
    if (!isLoggedIn) {
      isLoggedIn = await auth.fetchUser()
    }
    if (to.path === '/login' && isLoggedIn) return next('/dashboard')

    if (to.meta.requiresAuth && !isLoggedIn) return next('/login')
    next()
  })
  /*
   * End validate auth middleware
   * */

  return Router
})
