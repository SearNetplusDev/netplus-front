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
    async fetchUser() {
      try {
        const response = await api.get('/api/user')
        this.user = response.data
        this.permissions = response.data.permissions || []
        return true
      } catch (error) {
        console.log(`Error getting user info: ${error}`)
        this.user = null
        this.permissions = []
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
      await api.post('/api/v1/auth/logout')
      this.user = null
      this.permissions = []
    },

    hasPermissions(permission) {
      return this.permissions.includes(permission)
    },

    //  Método para verificar si el usuario tiene al menos uno de los permisos
    hasAnyPermission(permissions) {
      if (!Array.isArray(permissions)) {
        return this.hasPermissions(permissions)
      }
      return permissions.some((perm) => this.permissions.includes(perm))
    },

    //  Método para verificar si tiene todos los permisos
    hasAllPermissions(permissions) {
      if (!Array.isArray(permissions)) {
        return this.hasPermissions(permissions)
      }
      return permissions.every((perm) => this.permissions.includes(perm))
    },
  },

  persist: {
    paths: ['user', 'permissions'],
    storage: localStorage,
  },
})
