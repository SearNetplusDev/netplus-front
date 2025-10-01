import { useFields } from 'src/utils/composables/useFields.js'
import { reactive } from 'vue'

const { validationRules, createField } = useFields()

export const SUPPORT_TYPES = {
  INTERNET_INSTALLATION: 1,
  IPTV_INSTALLATION: 2,
  INTERNET_SUPPORT: 3,
  IPTV_SUPPORT: 4,
  CHANGE_ADDRESS: 5,
  INTERNET_RENEWAL: 6,
  IPTV_RENEWAL: 7,
  UNINSTALLATION: 8,
  EQUIPMENT_SALE: 9,
}

//  Campos por tipo
const FIELD_CONFIG = {
  base: [
    'type',
    'client',
    'branch',
    'technician',
    'state',
    'municipality',
    'district',
    'address',
    'status',
    'description',
    'solution',
    'comments',
  ],
  contract: ['profile', 'node', 'equipment'],
  geography: ['latitude', 'longitude'],
  service: ['service'],
}

export const FIELDS_BY_TYPE = {
  [SUPPORT_TYPES.INTERNET_INSTALLATION]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.contract,
    ...FIELD_CONFIG.geography,
  ],
  [SUPPORT_TYPES.IPTV_INSTALLATION]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.contract,
    ...FIELD_CONFIG.geography,
  ],
  [SUPPORT_TYPES.INTERNET_SUPPORT]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.contract,
    ...FIELD_CONFIG.service,
    ...FIELD_CONFIG.geography,
  ],
  [SUPPORT_TYPES.IPTV_SUPPORT]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.contract,
    ...FIELD_CONFIG.service,
    ...FIELD_CONFIG.geography,
  ],
  [SUPPORT_TYPES.INTERNET_RENEWAL]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.contract,
    ...FIELD_CONFIG.geography,
    ...FIELD_CONFIG.service,
  ],
  [SUPPORT_TYPES.IPTV_RENEWAL]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.contract,
    ...FIELD_CONFIG.geography,
    ...FIELD_CONFIG.service,
  ],
  [SUPPORT_TYPES.CHANGE_ADDRESS]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.service,
    ...FIELD_CONFIG.contract,
    ...FIELD_CONFIG.geography,
  ],
  [SUPPORT_TYPES.EQUIPMENT_SALE]: [...FIELD_CONFIG.base, ...FIELD_CONFIG.service, 'equipment'],
  [SUPPORT_TYPES.UNINSTALLATION]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.service,
    ...FIELD_CONFIG.geography,
  ],
}

//  Definición de campos usando un objeto más compacto
const fieldDefs = {
  type: ['Tipo de soporte', 'select', true, true],
  client: ['Cliente', 'select-filter', true, true],
  service: ['Servicio', 'select', true, true],
  profile: ['Perfil de navegación', 'select', true],
  node: ['Nodo', 'select', false],
  equipment: ['Equipo', 'select', false],
  description: ['Descripción del soporte', 'textarea-md', true, true],
  branch: ['Sucursal', 'select', true, true],
  state: ['Departamento', 'select', true],
  municipality: ['Municipio', 'select', true],
  district: ['Distrito', 'select', true],
  status: ['Estado', 'select', true],
  address: ['Dirección', 'textarea-md', true],
  solution: ['Solución', 'textarea-md', false],
  comments: ['Observaciones', 'textarea-md', false],
  latitude: ['Latitud', 'text', true],
  longitude: ['Longitud', 'text', true],
}

export const createFieldsForType = (supportType) => {
  const fieldsToCreate = supportType ? FIELDS_BY_TYPE[supportType] || ['type'] : ['type']
  const newFields = {}

  fieldsToCreate.forEach((fieldName) => {
    const [label, type, required, disabled] = fieldDefs[fieldName] || ['', 'text', false, false]
    newFields[fieldName] = createField(
      label,
      type,
      required ? [validationRules.select_required] : [],
      disabled,
    )
  })
  return newFields
}

export const fieldOrder = [
  'type',
  'client',
  'service',
  'profile',
  'branch',
  'node',
  'equipment',
  'state',
  'municipality',
  'district',
  'status',
]

export const textOrder = ['description', 'address', 'solution', 'comments']

export const useOperationFields = () => {
  const fields = reactive(createFieldsForType(null))
  return { fields }
}

export const fieldOptionsMap = {
  type: 'types',
  client: 'filtered_client',
  service: 'services',
  profile: 'profiles',
  node: 'nodes',
  equipment: 'equipments',
  branch: 'branches',
  state: 'states',
  municipality: 'municipalities',
  district: 'districts',
  status: 'statuses',
}
