import { computed } from 'vue'
import { fieldOrder, textOrder } from './useOperationFields.js'
import { external } from './useOperationLoaders.js'

export const useOperationUtils = (fields) => {
  //  Campos regulares
  const regularFields = computed(() =>
    fieldOrder
      .map((name) => [name, fields[name]])
      .filter(([, field]) => field && !field.type.includes('textarea')),
  )

  //  Campos textarea
  const textAreaFields = computed(() =>
    textOrder
      .map((name) => [name, fields[name]])
      .filter(([, field]) => field && field.type.includes('textarea')),
  )

  //  Función para obtener las options de cada select
  const selectOptions = (key) =>
    external[
      {
        type: 'types',
        branch: 'branches',
        status: 'statuses',
        profile: 'profiles',
        node: 'nodes',
        equipment: 'equipments',
        state: 'states',
        municipality: 'municipalities',
        district: 'districts',
        service: 'services',
        client: 'filtered_client',
      }[key]
    ] || []

  //    Función para formatear las opciones de dispositivos (mostrar MACs)
  const getDeviceOptionLabel = (device) => {
    if (!device) return ''
    return `${device.mac_address} - ${device.brand?.name || ''} ${device.model?.name || ''}`
  }

  return {
    regularFields,
    textAreaFields,
    selectOptions,
    getDeviceOptionLabel,
  }
}
