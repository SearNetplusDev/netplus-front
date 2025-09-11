import { watch } from 'vue'
import { api } from 'boot/axios.js'
import {
  handleSubmissionError,
  resetFieldErrors,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import { useNotify } from 'src/utils/composables/outsideNotification.js'
import { useLoading } from 'src/utils/loader.js'
import { external, loaders, loadDataForEdit } from './useSupportLoaders.js'
import { createFieldsForType /*, SUPPORT_TYPES*/ } from './useSupportFields.js'

const { showNotification } = useNotify()
const { showLoading, hideLoading } = useLoading()

export const useSupportForm = (fields, uiStates, props) => {
  let isLoadingExistingData = false

  const toggleLoading = (loading, title) => {
    uiStates.loading = loading
    if (title) uiStates.title = title
    loading ? showLoading() : setTimeout(hideLoading, 250)
  }

  const populateFields = (data) => {
    isLoadingExistingData = true
    const newFields = createFieldsForType(data.type_id)
    Object.keys(fields).forEach((key) => (fields[key] = newFields[key]))

    const mapping = {
      type: 'type_id',
      client: 'client_id',
      service: 'service_id',
      profile: 'profile_id',
      initial_date: 'initial_date',
      final_date: 'final_date',
      node: 'node_id',
      equipment: 'equipment_id',
      branch: 'branch_id',
      technician: 'technician_id',
      state: 'state_id',
      municipality: 'municipality_id',
      district: 'district_id',
      status: 'status_id',
      address: 'address',
      description: 'description',
      solution: 'solution',
      comments: 'comments',
    }

    Object.entries(mapping).forEach(([fieldKey, dataKey]) => {
      if (fields[fieldKey] && data[dataKey] !== undefined) fields[fieldKey].data = data[dataKey]
    })

    isLoadingExistingData = false
  }

  const getData = async () => {
    if (props.id <= 0) return

    toggleLoading(true, 'Obteniendo datos, espera un momento...')
    try {
      const { data } = await api.post('/api/v1/supports/edit', { id: props.id })
      await loadDataForEdit(data.support)
      populateFields(data.support)

      if (data.support.client) external.filtered_client = [data.support.client]
      uiStates.title = 'Modificar Soporte'
    } catch (err) {
      showNotification('Error', err.response?.data?.message || 'Error al cargar datos', 'red-10')
    } finally {
      toggleLoading(false)
    }
  }

  const sendData = async () => {
    toggleLoading(true, 'Procesando datos, espera un momento...')
    try {
      resetFieldErrors(fields)
      const isUpdate = props.id > 0
      const params = buildFormData(fields, { _method: isUpdate ? 'PUT' : 'POST' })
      const { data } = await api.post(`/api/v1/supports/${isUpdate ? props.id : ''}`, params)

      if (data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        uiStates.title = 'Modificar Soporte'
      } else {
        showNotification('Error', 'Verifica la información ingresada', 'teal-10')
      }
    } catch (err) {
      handleSubmissionError(err, fields)
      showNotification('Error', err.response?.data?.message || 'Error al guardar', 'red-10')
    } finally {
      toggleLoading(false)
    }
  }

  const selectClient = (val, update) => {
    if (!val || val.length < 4) {
      update(() => (external.filtered_client = []))
      return
    }

    update(async () => {
      try {
        const { data } = await api.post('/api/v1/clients/search/', { client: val })
        external.filtered_client = data.clients || []
      } catch (err) {
        showNotification('Error', err.response?.data?.message || 'Error inesperado', 'red-10')
      }
    })
  }

  // Configurar watchers
  const setupWatchers = () => {
    // Watcher principal para tipo de soporte
    watch(
      () => fields.type?.data,
      async (newType, oldType) => {
        if (newType === oldType || isLoadingExistingData) return

        // Recrear campos
        const currentTypeValue = fields.type?.data
        const newFields = createFieldsForType(newType)
        Object.keys(fields).forEach((key) => delete fields[key])
        Object.assign(fields, newFields)
        if (fields.type) fields.type.data = currentTypeValue

        // Cargar datos dependientes
        external.profiles = external.nodes = external.equipments = external.services = []
        await loaders.loadProfiles(newType)

        const needsNodes = [1, 2, 5, 6, 7].includes(newType) // INSTALLATION, RENEWAL, CHANGE_ADDRESS
        if (needsNodes) await loaders.loadNodes()
      },
      { immediate: false },
    )

    // Helper para crear watchers
    const createWatcher = (fieldName, loadFn, clearFields = []) => {
      watch(
        () => fields[fieldName]?.data,
        async (newVal, oldVal) => {
          if (newVal === oldVal || isLoadingExistingData) return
          if (newVal) await loadFn(newVal)
          clearFields.forEach((field) => fields[field] && (fields[field].data = null))
        },
        { immediate: false },
      )
    }

    createWatcher('node', loaders.loadEquipments, ['equipment'])
    createWatcher('state', loaders.loadMunicipalities, ['municipality', 'district'])
    createWatcher('municipality', loaders.loadDistricts, ['district'])

    // Watcher especial para cliente
    watch(
      () => fields.client?.data,
      async (newClient, oldClient) => {
        if (newClient === oldClient || isLoadingExistingData) return

        if (newClient && [3, 4, 5, 6, 7, 8, 9].includes(fields.type?.data)) {
          await loaders.loadClientServices(newClient)
        }
        if (fields.service) fields.service.data = null
      },
      { immediate: false },
    )
  }

  return {
    getData,
    sendData,
    selectClient,
    setupWatchers,
    toggleLoading,
    populateFields,
  }
}
