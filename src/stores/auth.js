import { defineStore } from 'pinia'
import { api } from 'boot/axios.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),
  getters: {
    // isAuthenticated: (state) => !!state.user,
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async fetchUser() {
      try {
        const response = await api.get('/api/user')
        this.user = response.data
        return true
      } catch (error) {
        console.log(`Error getting user info: ${error}`)
        this.user = null
        return false
      }
    },

    async login(credentials) {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/api/v1/auth/login', credentials)
      return await this.fetchUser()
    },

    async logout() {
      await api.post('/api/v1/auth/logout')
      this.user = null
    },
  },
})
