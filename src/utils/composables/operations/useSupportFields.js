import { reactive } from 'vue'
import { useFields } from 'src/utils/composables/useFields.js'

export const useSupportFields = () => {
  const { validationRules, createField } = useFields()

  const fields = reactive({
    type: createField('Tipo de soporte', 'select', [validationRules.select_required], true),
    client: createField('Cliente', 'select', [validationRules.select_required], true),
    service: createField('Servicio', 'select', [validationRules.select_required], true),
    profile: createField('Perfil de navegación', 'select', [validationRules.select_required]),
    node: createField('Nodo', 'select', []),
    equipment: createField('Equipo', 'select', []),
    description: createField(
      'Descripción del soporte',
      'textarea',
      [validationRules.text_required],
      true,
    ),
    branch: createField('Sucursal', 'select', [validationRules.select_required], true),
    state: createField('Departamento', 'select', [validationRules.select_required]),
    municipality: createField('Municipio', 'select', [validationRules.select_required]),
    district: createField('Distrito', 'select', [validationRules.select_required]),
    address: createField('Dirección', 'textarea', [validationRules.text_required]),
    solution: createField('Solución', 'textarea', []),
    comments: createField('Observaciones', 'textarea', []),
    latitude: createField('Latitud', 'text', []),
    longitude: createField('Longitud', 'text', []),
    status: createField('Estado', 'select', [validationRules.select_required]),
    technician: createField('Técnico asignado', 'select', [validationRules.select_required], true),
  })

  const updateConditionalRules = (statusId, statusOptions = []) => {
    const selectedStatus = statusOptions.find((s) => s.id === statusId)
    const statusName = selectedStatus?.name?.toLowerCase || ''
    const isRequired = statusName === 'finalizado'

    if (isRequired) {
      fields.node.rules = [validationRules.select_required]
      fields.equipment.rules = [validationRules.select_required]
      fields.latitude.rules = [validationRules.text_required, validationRules.latitude]
      fields.longitude.rules = [validationRules.text_required, validationRules.longitude]
    } else {
      fields.node.rules = []
      fields.equipment.rules = []
      fields.latitude.rules = [(val) => !val || validationRules.latitude(val)]
      fields.longitude.rules = [(val) => !val || validationRules.longitude(val)]
    }
  }

  const mapSupportToFields = (support) => {
    fields.type.data = support.type_id
    fields.client.data = support.client_id
    fields.service.data = support.service_id
    fields.node.data = support.service?.node_id
    fields.equipment.data = support.service?.equipment_id
    fields.description.data = support.description
    fields.branch.data = support.branch_id
    fields.state.data = support.state_id
    fields.municipality.data = support.municipality_id
    fields.district.data = support.district_id
    fields.address.data = support.address
    fields.solution.data = support.solution
    fields.comments.data = support.comments
    fields.latitude.data = support.service?.latitude
    fields.longitude.data = support.service?.longitude
    fields.status.data = support.status_id
    fields.technician.data = support.technician_id

    const supportWithDetails = [1, 2, 6, 7]
    fields.profile.data = supportWithDetails.includes(support.type_id)
      ? support.details?.internet_profile_id
      : support.service?.internet?.internet_profile_id
  }

  const resetFields = () => {
    Object.keys(fields).forEach((key) => {
      fields[key].data = null
      fields[key].error = false
      fields[key]['error-message'] = ''
    })
  }

  return { fields, mapSupportToFields, resetFields, updateConditionalRules }
}
