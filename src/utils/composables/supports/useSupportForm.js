import { watch, nextTick } from 'vue'
import { api } from 'boot/axios.js'
import {
  handleSubmissionError,
  resetFieldErrors,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import { useNotify } from 'src/utils/composables/outsideNotification.js'
import { useLoading } from 'src/utils/loader.js'
import { external, loaders, loadDataForEdit } from './useSupportLoaders.js'
import { createFieldsForType, SUPPORT_TYPES } from './useSupportFields.js'

const { showNotification } = useNotify()
const { showLoading, hideLoading } = useLoading()

export const useSupportForm = (fields, uiStates, props) => {
  let isLoadingExistingData = false
  let isLoadingServiceAddress = false

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

  // Nueva función para cargar la dirección del servicio
  const loadServiceAddress = async (serviceId) => {
    try {
      isLoadingServiceAddress = true
      const { data } = await api.get(`/api/v1/services/${serviceId}/address`)

      if (data.address) {
        // Primero cargar las dependencias de ubicación
        if (data.address.state_id && fields.state) {
          // Cargar municipios para el estado
          await loaders.loadMunicipalities(data.address.state_id)

          if (data.address.municipality_id) {
            // Cargar distritos para el municipio
            await loaders.loadDistricts(data.address.municipality_id)
          }
        }

        // Esperar a que Vue actualice el DOM antes de asignar valores
        await nextTick()

        // Asignar todos los valores
        if (fields.state && data.address.state_id) {
          fields.state.data = data.address.state_id
        }
        if (fields.municipality && data.address.municipality_id) {
          fields.municipality.data = data.address.municipality_id
        }
        if (fields.district && data.address.district_id) {
          fields.district.data = data.address.district_id
        }
        if (fields.address && data.address.address) {
          fields.address.data = data.address.address
        }

        // Esperar otro tick para asegurar que todos los valores estén asignados
        await nextTick()
      }
    } catch (err) {
      console.error('Error loading service address:', err)
      showNotification('Error', 'Error al cargar la dirección del servicio', 'red-10')
    } finally {
      // Pequeño delay antes de restaurar la bandera para evitar race conditions
      setTimeout(() => {
        isLoadingServiceAddress = false
      }, 100)
    }
  }

  //  Función para cargar la sucursal del cliente
  const loadClientBranch = async (clientId) => {
    try {
      const { data } = await api.get(`/api/v1/clients/${clientId}/branch`)

      if (data.branch && fields.branch) {
        fields.branch.data = data.branch.id
      }
    } catch (err) {
      console.error('Error cargando la sucursal: ', err)
    }
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
          if (newVal === oldVal || isLoadingExistingData || isLoadingServiceAddress) return
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
        if (newClient === oldClient || isLoadingExistingData || isLoadingServiceAddress) return

        if (newClient) {
          // Cargar sucursal del cliente
          await loadClientBranch(newClient)

          // Cargar servicios si el tipo de soporte lo requiere
          if ([3, 4, 5, 6, 7, 8, 9].includes(fields.type?.data)) {
            await loaders.loadClientServices(newClient)
          }
        }
        if (fields.service) fields.service.data = null
      },
      { immediate: false },
    )

    // Watcher para servicio - cargar dirección automáticamente
    watch(
      () => fields.service?.data,
      async (newService, oldService) => {
        if (newService === oldService || isLoadingExistingData || isLoadingServiceAddress) return

        // Solo cargar dirección para tipos de soporte que requieren servicio
        const serviceRequiredTypes = [
          SUPPORT_TYPES.INTERNET_SUPPORT, // 3
          SUPPORT_TYPES.IPTV_SUPPORT, // 4
          SUPPORT_TYPES.CHANGE_ADDRESS, // 5
          SUPPORT_TYPES.INTERNET_RENEWAL, // 6
          SUPPORT_TYPES.IPTV_RENEWAL, // 7
          SUPPORT_TYPES.UNINSTALLATION, // 8
          SUPPORT_TYPES.EQUIPMENT_SALE, // 9
        ]

        if (newService && serviceRequiredTypes.includes(fields.type?.data)) {
          await loadServiceAddress(newService)
        }
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
    loadServiceAddress,
    loadClientBranch,
  }
}
