import { defineStore } from 'pinia'
import { api } from 'boot/axios.js'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchMenu() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/api/v1/configuration/menu')
        this.items = response.data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
})
