import { reactive } from 'vue'
import { useFields } from 'src/utils/composables/useFields.js'

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

// Configuración de campos por tipo
const FIELD_CONFIG = {
  base: [
    'type',
    'client',
    'branch',
    'technician',
    'state',
    'municipality',
    'district',
    'status',
    'description',
    'address',
    'solution',
    'comments',
  ],
  contract: ['profile', 'initial_date', 'final_date', 'node', 'equipment'],
  service: ['service'],
}

export const FIELDS_BY_TYPE = {
  [SUPPORT_TYPES.INTERNET_INSTALLATION]: [...FIELD_CONFIG.base, ...FIELD_CONFIG.contract],
  [SUPPORT_TYPES.IPTV_INSTALLATION]: [...FIELD_CONFIG.base, ...FIELD_CONFIG.contract],
  [SUPPORT_TYPES.INTERNET_SUPPORT]: [...FIELD_CONFIG.base, ...FIELD_CONFIG.service],
  [SUPPORT_TYPES.IPTV_SUPPORT]: [...FIELD_CONFIG.base, ...FIELD_CONFIG.service],
  [SUPPORT_TYPES.INTERNET_RENEWAL]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.service,
    ...FIELD_CONFIG.contract,
  ],
  [SUPPORT_TYPES.IPTV_RENEWAL]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.service,
    ...FIELD_CONFIG.contract,
  ],
  [SUPPORT_TYPES.CHANGE_ADDRESS]: [
    ...FIELD_CONFIG.base,
    ...FIELD_CONFIG.service,
    'node',
    'equipment',
  ],
  [SUPPORT_TYPES.EQUIPMENT_SALE]: [...FIELD_CONFIG.base, ...FIELD_CONFIG.service],
  [SUPPORT_TYPES.UNINSTALLATION]: [...FIELD_CONFIG.base, ...FIELD_CONFIG.service],
}

// Definición de campos usando un objeto más compacto
const fieldDefs = {
  type: ['Tipo de soporte', 'select', true],
  client: ['Cliente', 'select-filter', true],
  service: ['Servicio', 'select', true],
  profile: ['Perfil de navegación', 'select', true],
  initial_date: ['Fecha de inicio del contrato', 'date', true],
  final_date: ['Fecha caducidad del contrato', 'date', true],
  node: ['Nodo', 'select', true],
  equipment: ['Equipo', 'select', true],
  description: ['Descripción del soporte', 'textarea-md', true],
  branch: ['Sucursal', 'select', true],
  technician: ['Técnico', 'select', false],
  state: ['Departamento', 'select', true],
  municipality: ['Municipio', 'select', true],
  district: ['Distrito', 'select', true],
  status: ['Estado', 'select', true],
  address: ['Dirección', 'textarea-md', true],
  solution: ['Solución', 'textarea-md', false],
  comments: ['Observaciones', 'textarea-md', false],
}

export const createFieldsForType = (supportType) => {
  const fieldsToCreate = supportType ? FIELDS_BY_TYPE[supportType] || ['type'] : ['type']
  const newFields = {}

  fieldsToCreate.forEach((fieldName) => {
    const [label, type, required] = fieldDefs[fieldName] || ['', 'text', false]
    newFields[fieldName] = createField(
      label,
      type,
      required ? [validationRules.select_required] : [],
    )
  })

  return newFields
}

export const fieldOrder = [
  'type',
  'client',
  'service',
  'profile',
  'initial_date',
  'final_date',
  'node',
  'equipment',
  'branch',
  'technician',
  'state',
  'municipality',
  'district',
  'status',
]

export const textOrder = ['description', 'address', 'solution', 'comments']

export const useSupportFields = () => {
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
  technician: 'technicians',
  state: 'states',
  municipality: 'municipalities',
  district: 'districts',
  status: 'statuses',
}
