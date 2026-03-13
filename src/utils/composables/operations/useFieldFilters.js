import { computed } from 'vue'

export const useFieldFilters = (fields) => {
  const NORMAL_FIELD_TYPES = [
    'select',
    'select-filter',
    'multi-select',
    'text',
    'toggle',
    'date',
    'password',
  ]
  const TEXTAREA_FIELD_TYPE = 'textarea'
  const DYNAMIC_FIELD = 'dynamic-list'

  const normalFields = computed(() => {
    return Object.fromEntries(
      Object.entries(fields).filter(([, field]) => NORMAL_FIELD_TYPES.includes(field.type)),
    )
  })

  const textAreaFields = computed(() => {
    return Object.fromEntries(
      Object.entries(fields).filter(([, field]) => field.type === TEXTAREA_FIELD_TYPE),
    )
  })

  const dynamicFields = computed(() => {
    return Object.fromEntries(
      Object.entries(fields).filter(([, field]) => field.type === DYNAMIC_FIELD),
    )
  })

  const getFieldsByType = (type) => {
    return Object.fromEntries(Object.entries(fields).filter(([, field]) => field.type === type))
  }

  return { normalFields, textAreaFields, dynamicFields, getFieldsByType }
}
