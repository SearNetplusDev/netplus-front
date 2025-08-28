import { defineStore } from 'pinia'
import { getSupportData } from 'src/utils/composables/getData.js'

export const useSupportDataStore = defineStore('supportData', {
  state: () => ({
    nodes: [],
    states: [],
    technicians: [],
    loaded: false,
  }),
  actions: {
    async load() {
      if (this.loaded) return
      const [nodes, states, technicians] = await Promise.all([
        getSupportData('/api/v1/general/infrastructure/nodes'),
        getSupportData('/api/v1/general/states'),
        getSupportData('/api/v1/general/management/users/technicians'),
      ])
      this.nodes = nodes
      this.states = states
      this.technicians = technicians
      this.loaded = true
    },
  },
})
