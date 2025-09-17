import { computed } from 'vue'
import { fieldOrder, textOrder } from './useSupportFields.js'
import { external } from './useSupportLoaders.js'

export const useSupportUtils = (fields) => {
  // Computed para campos regulares
  const regularFields = computed(() =>
    fieldOrder
      .map((name) => [name, fields[name]])
      .filter(([, field]) => field && !field.type.includes('textarea')),
  )

  // Computed para campos de texto
  const textAreaFields = computed(() =>
    textOrder
      .map((name) => [name, fields[name]])
      .filter(([, field]) => field && field.type.includes('textarea')),
  )

  // Función para obtener opciones de select
  const selectOptions = (key) =>
    external[
      {
        type: 'types',
        branch: 'branches',
        status: 'statuses',
        profile: 'profiles',
        node: 'nodes',
        equipment: 'equipments',
        technician: 'technicians',
        state: 'states',
        municipality: 'municipalities',
        district: 'districts',
        service: 'services',
        client: 'filtered_client',
      }[key]
    ] || []

  return {
    regularFields,
    textAreaFields,
    selectOptions,
  }
}
