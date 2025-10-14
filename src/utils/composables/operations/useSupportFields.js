import { reactive } from 'vue'
import { useFields } from 'src/utils/composables/useFields.js'

export const useSupportFields = () => {
  const { validationRules, createField } = useFields()

  const fields = reactive({
    type: createField('Tipo de soporte', 'select', [validationRules.select_required], true),
    client: createField('Cliente', 'select', [validationRules.select_required], true),
    service: createField('Servicio', 'select', [validationRules.select_required], true),
    profile: createField('Perfil de navegación', 'select', [validationRules.select_required]),
    node: createField('Nodo', 'select', [validationRules.select_required]),
    equipment: createField('Equipo', 'select', [validationRules.select_required]),
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
    latitude: createField('Latitud', 'text', [
      validationRules.text_required,
      validationRules.latitude,
    ]),
    longitude: createField('Longitud', 'text', [
      validationRules.text_required,
      validationRules.longitude,
    ]),
    status: createField('Estado', 'select', [validationRules.select_required]),
  })

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

  return { fields, mapSupportToFields, resetFields }
}
