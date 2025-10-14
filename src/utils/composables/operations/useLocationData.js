// import { useNotifications } from 'src/utils/notification.js'
import { useNotify } from 'src/utils/composables/outsideNotification.js'
import { getSupportData } from 'src/utils/composables/getData.js'

export const useLocationData = (fields, options) => {
  // const { showNotification } = useNotifications()
  const { showNotification } = useNotify()

  const onNodeChange = async (reload = true) => {
    if (!fields.node.data) return

    if (reload) {
      fields.equipment.data = null
      options.equipment = []
    }

    try {
      options.equipment = await getSupportData(
        `api/v1/general/infrastructure/node/${fields.node.data}/equipment`,
      )
    } catch (err) {
      showNotification('Error', err.response?.data?.message || 'Error cargando equipos', 'red-10')
    }
  }

  const onStateChange = async (reload = true) => {
    if (!fields.state.data) return

    if (reload) {
      fields.municipality.data = null
      fields.district.data = null
      options.municipality = []
      options.district = []
    }

    try {
      options.municipality = await getSupportData(
        `api/v1/general/state/${fields.state.data}/municipalities`,
      )
    } catch (error) {
      showNotification(
        'Error',
        error.response?.data?.message || 'Error cargando municipios',
        'red-10',
      )
    }
  }

  const onMunicipalityChange = async (reload = true) => {
    if (!fields.municipality.data) return

    if (reload) {
      fields.district.data = null
      options.district = []
    }

    try {
      options.district = await getSupportData(
        `api/v1/general/municipality/${fields.municipality.data}/districts`,
      )
    } catch (error) {
      showNotification(
        'Error',
        error.response?.data?.message || 'Error cargando distritos',
        'red-10',
      )
    }
  }

  const loadAllLocationData = async () => {
    await Promise.all([onNodeChange(false), onStateChange(false), onMunicipalityChange(false)])
  }

  return { onNodeChange, onStateChange, onMunicipalityChange, loadAllLocationData }
}
