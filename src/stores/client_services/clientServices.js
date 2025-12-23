import { defineStore } from 'pinia'
// import { api } from 'src/utils/api.js'
import { api } from 'src/utils/api.js'

export const useClientServicesStore = defineStore('clientServices', {
  state: () => ({
    client: null,
    services: [],
  }),
  getters: {
    serviceCount: (state) => state.services.length,
  },
  actions: {
    async fetchServices(clientId) {
      if (!clientId) return
      const params = new FormData()
      params.append('client', clientId)
      const { data } = await api.post(`/api/v1/services/client/`, params)
      this.client = data.client
      this.services = data.client?.services || []
    },
    reset() {
      this.client = null
      this.services = null
    },
  },
})
