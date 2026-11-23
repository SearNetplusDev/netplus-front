import { defineStore } from 'pinia'
import { api } from 'src/utils/api.js'
import { useMenuStore } from 'stores/menu-store.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    permissions: [],
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    clearSession() {
      this.user = null
      this.permissions = []
      const menuStore = useMenuStore()
      menuStore.items = []
    },

    async fetchUser() {
      try {
        const response = await api.get('/api/user')
        this.user = response.data
        this.permissions = response.data.permissions || []
        return true
      } catch (err) {
        console.log(`Error getting user info: ${err}`)
        this.clearSession()
        return false
      }
    },

    async login(credentials) {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/api/v1/auth/login', credentials)
      const menuStore = useMenuStore()
      await menuStore.fetchMenu()

      return await this.fetchUser()
    },

    async logout() {
      try {
        await api.post('/api/v1/auth/logout')
      } finally {
        this.clearSession()
      }
    },

    hasPermissions(permission) {
      return this.permissions.includes(permission)
    },

    //  Verifica si el usuario tiene al menos uno de los permisos
    hasAnyPermission(permissions) {
      if (!Array.isArray(permissions)) {
        return this.hasPermissions(permissions)
      }
      return permissions.some((perm) => this.permissions.includes(perm))
    },

    //  Verifica si tiene todos los permisos
    hasAllPermissions(permissions) {
      if (!Array.isArray(permissions)) {
        return this.hasPermissions(permissions)
      }
      return permissions.every((prem) => this.permissions.includes(prem))
    },
  },

  persist: {
    paths: ['user', 'permissions'],
    storage: localStorage,
  },
})
