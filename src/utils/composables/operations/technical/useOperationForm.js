import { watch, nextTick, computed } from 'vue'
import { api } from 'boot/axios.js'
import {
  handleSubmissionError,
  resetFieldErrors,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import { useNotify } from 'src/utils/composables/outsideNotification.js'
import { useLoading } from 'src/utils/loader.js'
import {
  external,
  loaders,
  loadDataForEdit,
} from 'src/utils/composables/operations/technical/useOperationLoaders.js'
import {
  createFieldsForType,
  SUPPORT_TYPES,
} from 'src/utils/composables/operations/technical/useOperationFields.js'

const { showNotification } = useNotify()
const { showLoading, hideLoading } = useLoading()
export const useOperationsForm = (fields, uiStates, props) => {
  let isLoadingExistingData = false
  let isLoadingServiceAddress = false

  // ================================================================
  // ===  VISIBILIDAD DE DISPOSITIVOS SEGÚN PROFILE =================
  // ================================================================
  const deviceVisibility = computed(() => {
    const profileId = fields.profile?.data
    if (!profileId) return { showOnu: false, showCpe: false, showRouter: false, showTvbox: false }

    const selectedProfile = external.profiles.find((p) => p.id === profileId)
    if (!selectedProfile)
      return { showOnu: false, showCpe: false, showRouter: false, showTvbox: false }

    return {
      showOnu: selectedProfile.ftth === true || selectedProfile.ftth === 1,
      showCpe: selectedProfile.ftth === false || selectedProfile.ftth === 0,
      showRouter: selectedProfile.ftth === false || selectedProfile.ftth === 0,
      showTvbox: selectedProfile.iptv === true || selectedProfile.iptv === 1,
    }
  })

  // ================================================================
  // ===  FUNCIONES GENERALES   =====================================
  // ================================================================
  const toggleLoading = (loading, title) => {
    uiStates.loading = loading
    if (title) uiStates.title = title
    loading ? showLoading() : setTimeout(hideLoading, 250)
  }

  const populateFields = (data) => {
    isLoadingExistingData = true

    const newFields = createFieldsForType(data.type_id)
    Object.keys(fields).forEach((key) => delete fields[key])
    Object.assign(fields, newFields)

    const simpleMappings = {
      type: data.type_id,
      client: data.client_id,
      service: data.service_id,
      branch: data.branch_id,
      state: data.state_id,
      municipality: data.municipality_id,
      district: data.district_id,
      status: data.status_id,
      address: data.address,
      description: data.description,
      solution: data.solution,
      comments: data.comments,
      latitude: data.service?.latitude,
      longitude: data.service?.longitude,
    }

    Object.entries(simpleMappings).forEach(([key, value]) => {
      if (fields[key] && value !== undefined && value !== null) {
        fields[key].data = value
      }
    })

    // =====  DETERMINAR EL PROFILE SEGÚN EL TIPO DE SOPORTE  ===
    if (fields.profile) {
      let profileId = null
      const isInstallationOrRenewal = [
        SUPPORT_TYPES.INTERNET_INSTALLATION,
        SUPPORT_TYPES.IPTV_INSTALLATION,
        SUPPORT_TYPES.INTERNET_RENEWAL,
        SUPPORT_TYPES.IPTV_RENEWAL,
      ].includes(data.type_id)

      const otherSupports = [
        SUPPORT_TYPES.INTERNET_SUPPORT,
        SUPPORT_TYPES.IPTV_SUPPORT,
        SUPPORT_TYPES.CHANGE_ADDRESS,
        SUPPORT_TYPES.UNINSTALLATION,
        SUPPORT_TYPES.EQUIPMENT_SALE,
      ].includes(data.type_id)

      if (isInstallationOrRenewal && data.details) {
        profileId = data.details?.internet_profile_id
      } else if (otherSupports && data.service?.internet?.profile?.id) {
        profileId = data.service?.internet?.profile?.id
      }

      if (profileId) fields.profile.data = profileId
    }

    //  === CARGAR NODO Y EQUIPO  =====
    if (data.service) {
      if (fields.node && data.service?.node_id) fields.node.data = data.service?.node_id
      if (fields.equipment && data.service?.equipment_id)
        fields.equipment.data = data.service?.equipment_id

      /****

       //  === INTERNET DEVICES  =======
       if (data.service?.internet_devices?.length) {
       data.service?.internet_devices.forEach((device) => {
       if (!device.equipment) return

       if (device.equipment.type_id === 4 && fields.onu_device) {
       fields.onu_device.data = device.equipment?.id
       external.filtered_onu_devices = [device.equipment]
       } else if (device.equipment.type_id === 5 && fields.cpe_device) {
       fields.cpe_device.data = device.equipment.id
       external.filtered_cpe_devices = [device.equipment]
       } else if (device.equipment.type_id === 7 && fields.router_device) {
       fields.router_device.data = device.equipment.id
       external.filtered_router_devices = [device.equipment]
       }
       })
       }

       // === IPTV DEVICES  ============
       if (data.service.iptv_devices?.length) {
       data.service.iptv_devices.forEach((device) => {
       if (device.equipment?.type_id === 6 && fields.tvbox_device) {
       fields.tvbox_device.data = device.equipment.id
       external.filtered_tvbox_devices = [device.equipment]
       }
       })
       }

       ****/
    }

    setTimeout(() => (isLoadingExistingData = false), 100)
  }

  // ================================================================
  // ===  CARGA DE DATOS   ==========================================
  // ================================================================
  const getData = async () => {
    if (props.id <= 0) return

    toggleLoading(true, 'Obteniendo datos, espera un momento...')
    try {
      const { data } = await api.post('/api/v1/operations/technical/edit', { id: props.id })
      await loadDataForEdit(data.support)
      populateFields(data.support)
      if (data.support.client) external.filtered_client = [data.support.client]
      uiStates.title = `Soporte de ${data.support.client.names}`
    } catch (err) {
      showNotification('Error', err.response?.data?.message || 'Error al cargar datos', 'red-10')
    } finally {
      toggleLoading(false)
    }
  }

  // ================================================================
  // ===  ENVÍO DE DATOS   ==========================================
  // ================================================================
  const sendData = async () => {
    toggleLoading(true, 'Procesando datos, espera un momento...')
    try {
      resetFieldErrors(fields)
      const isUpdate = props.id > 0
      const params = buildFormData(fields, { _method: isUpdate ? 'PUT' : 'POST' })
      const { data } = await api.post(
        `/api/v1/operations/technical/${isUpdate ? props.id : ''}`,
        params,
      )
      if (data.saved) {
        showNotification('Éxito', 'Registro almacenado correctamente', 'blue-grey-10')
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

  // ================================================================
  // ===  BÚSQUEDA DE CLIENTES ======================================
  // ================================================================
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

  // ================================================================
  // ===  CARGAR LISTADO DE SERVICIOS   =============================
  // ================================================================
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

  // ================================================================
  // ===  CARGAR SUCURSAL DEL CLIENTE   =============================
  // ================================================================

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

  // ================================================================
  // ===  WATCHERS   ================================================
  // ================================================================
  const setupWatchers = () => {
    // ===  Watcher principal para el tipo de soporte ===============
    watch(
      () => fields.type?.data,
      async (newType, oldType) => {
        if (newType === oldType || isLoadingExistingData) return

        const currentValues = {}
        Object.keys(fields).forEach((k) => (currentValues[k] = fields[k]?.data))

        const newFields = createFieldsForType(newType)
        Object.keys(fields).forEach((k) => delete fields[k])
        Object.assign(fields, newFields)
        Object.keys(currentValues).forEach((k) => {
          if (fields[k] && currentValues[k] !== undefined) fields[k].data = currentValues[k]
        })

        // ===  Cargar dependencias ==================================
        external.profiles = external.nodes = external.equipments = external.services = []
        await loaders.loadProfiles(newType)

        const needsNodes = [1, 2, 5, 6, 7].includes(newType)
        if (needsNodes) await loaders.loadNodes()
      },
      { immediate: false },
    )

    //  Dependencias geográficas y de red
    const createWatcher = (field, loadFn, clear = []) => {
      watch(
        () => fields[field]?.data,
        async (newVal, oldVal) => {
          if (newVal === oldVal || isLoadingExistingData || isLoadingServiceAddress) return
          if (newVal) await loadFn(newVal)
          clear.forEach((f) => fields[f] && (fields[f].data = null))
        },
        { immediate: false },
      )
    }

    createWatcher('node', loaders.loadEquipments, ['equipment'])
    createWatcher('state', loaders.loadMunicipalities, ['municipality', 'district'])
    createWatcher('municipality', loaders.loadDistricts, ['district'])

    //  Cliente -> Cargar sucursal y servicios
    watch(
      () => fields.client?.data,
      async (newClient, oldClient) => {
        if (newClient === oldClient || isLoadingExistingData || isLoadingServiceAddress) return
        if (newClient) {
          await loadClientBranch(newClient)
          if ([3, 4, 5, 6, 7, 8, 9].includes(fields.type?.data)) {
            await loaders.loadClientServices(newClient)
          }
        }
        if (fields.service) fields.service.data = null
      },
      { immediate: false },
    )

    //  Servicio -> Cargar dirección
    watch(
      () => fields.service?.data,
      async (newService, oldService) => {
        if (newService === oldService || isLoadingExistingData || isLoadingServiceAddress) return
        const serviceRequiredTypes = [
          SUPPORT_TYPES.INTERNET_SUPPORT,
          SUPPORT_TYPES.IPTV_SUPPORT,
          SUPPORT_TYPES.CHANGE_ADDRESS,
          SUPPORT_TYPES.INTERNET_RENEWAL,
          SUPPORT_TYPES.IPTV_RENEWAL,
          SUPPORT_TYPES.UNINSTALLATION,
          SUPPORT_TYPES.EQUIPMENT_SALE,
        ]
        if (newService && serviceRequiredTypes.includes(fields.type?.data)) {
          await loadServiceAddress(newService)
        }
      },
      { immediate: false },
    )
  }

  // ================================================================
  // ===  RETORNO   =================================================
  // ================================================================

  return {
    getData,
    sendData,
    selectClient,
    setupWatchers,
    toggleLoading,
    populateFields,
    deviceVisibility,
  }
}
