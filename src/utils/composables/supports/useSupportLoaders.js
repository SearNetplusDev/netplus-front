import { reactive } from 'vue'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useNotify } from 'src/utils/composables/outsideNotification.js'
import { SUPPORT_TYPES } from './useSupportFields.js'

const { showNotification } = useNotify()
export const external = reactive({
  branches: [],
  districts: [],
  equipments: [],
  filtered_client: [],
  municipalities: [],
  nodes: [],
  profiles: [],
  services: [],
  states: [],
  statuses: [],
  technicians: [],
  types: [],
})

// Función genérica para cargar datos con dependencias
const loadData = async (endpoint, target, param = '') => {
  try {
    external[target] = await getSupportData(`/api/v1/general/${endpoint}${param}`)
  } catch (err) {
    console.error(`Error loading ${target}:`, err)
    showNotification('Error', `Error al cargar ${target}.`, 'red-10')
  }
}

export const loaders = {
  loadStates: () => loadData('states', 'states'),
  loadMunicipalities: (state) =>
    state
      ? loadData(`state/${state}/municipalities`, 'municipalities')
      : (external.municipalities = []),
  loadDistricts: (municipality) =>
    municipality
      ? loadData(`municipality/${municipality}/districts`, 'districts')
      : (external.districts = []),
  loadNodes: () => loadData('infrastructure/nodes', 'nodes'),
  loadEquipments: (nodeId) =>
    nodeId
      ? loadData(`infrastructure/node/${nodeId}/equipment`, 'equipments')
      : (external.equipments = []),
  loadClientServices: (clientId) =>
    clientId ? loadData(`../services/client/${clientId}`, 'services') : (external.services = []),
  loadProfiles: async (supportType) => {
    const profileType = [
      SUPPORT_TYPES.INTERNET_INSTALLATION,
      SUPPORT_TYPES.INTERNET_RENEWAL,
    ].includes(supportType)
      ? 'internet'
      : [SUPPORT_TYPES.IPTV_INSTALLATION, SUPPORT_TYPES.IPTV_RENEWAL].includes(supportType)
        ? 'iptv'
        : ''

    if (profileType) await loadData(`profiles/select/${profileType}`, 'profiles')
  },
}

export const loadInitialData = async () => {
  const [branches, statuses, technicians, types] = await Promise.all([
    getSupportData('/api/v1/general/branches'),
    getSupportData('/api/v1/general/supports/status'),
    getSupportData('/api/v1/general/management/users/technicians'),
    getSupportData('/api/v1/general/supports/types'),
    loaders.loadStates(),
  ])

  Object.assign(external, { branches, statuses, technicians, types })
}

export const loadDataForEdit = async (data) => {
  const promises = []

  if (data.type_id) {
    promises.push(loaders.loadProfiles(data.type_id))
    if ([1, 2, 5, 6, 7].includes(data.type_id)) {
      promises.push(loaders.loadNodes())
      if (data.node_id) promises.push(loaders.loadEquipments(data.node_id))
    }
  }

  if (data.client_id && [3, 4, 5, 6, 7, 8, 9].includes(data.type_id)) {
    promises.push(loaders.loadClientServices(data.client_id))
  }

  if (data.state_id) {
    promises.push(loaders.loadMunicipalities(data.state_id))
    if (data.municipality_id) promises.push(loaders.loadDistricts(data.municipality_id))
  }

  await Promise.all(promises)
}
