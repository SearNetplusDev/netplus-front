<script setup>
import { reactive, computed, watch, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useFields } from 'src/utils/composables/useFields.js'
import {
  handleSubmissionError,
  resetFieldErrors,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import LocaleEs from 'src/utils/composables/localeEs.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { validationRules, createField } = useFields()
const locale = LocaleEs
const props = defineProps({
  id: { type: Number, required: true },
})
const uiStates = reactive({
  title: 'Crear Soporte',
  loading: false,
})
const SUPPORT_TYPES = {
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
const FIELDS_BY_TYPE = {
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
const createFieldsForType = (supportType) => {
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
const fields = reactive(createFieldsForType(null))
const external = reactive({
  branches: [],
  districts: [],
  equipments: [],
  filtered_client: [],
  municipalities: [],
  nodes: [],
  profiles: [],
  services: [],
  states: [],
  statuses: [],
  technicians: [],
  types: [],
})

let isLoadingExistingData = false
// Función genérica para cargar datos con dependencias
const loadData = async (endpoint, target, param = '') => {
  try {
    external[target] = await getSupportData(`/api/v1/general/${endpoint}${param}`)
  } catch (err) {
    console.error(`Error loading ${target}:`, err)
    showNotification('Error', `Error al cargar ${target}.`, 'red-10')
  }
}
// Funciones de carga simplificadas
const loadStates = () => loadData('states', 'states')
const loadMunicipalities = (state) =>
  state
    ? loadData(`state/${state}/municipalities`, 'municipalities')
    : (external.municipalities = [])
const loadDistricts = (municipality) =>
  municipality
    ? loadData(`municipality/${municipality}/districts`, 'districts')
    : (external.districts = [])
const loadNodes = () => loadData('infrastructure/nodes', 'nodes')
const loadEquipments = (nodeId) =>
  nodeId
    ? loadData(`infrastructure/node/${nodeId}/equipment`, 'equipments')
    : (external.equipments = [])
const loadClientServices = (clientId) =>
  clientId ? loadData(`../services/client/${clientId}`, 'services') : (external.services = [])
const loadProfiles = async (supportType) => {
  const profileType = [
    SUPPORT_TYPES.INTERNET_INSTALLATION,
    SUPPORT_TYPES.INTERNET_RENEWAL,
  ].includes(supportType)
    ? 'internet'
    : [SUPPORT_TYPES.IPTV_INSTALLATION, SUPPORT_TYPES.IPTV_RENEWAL].includes(supportType)
      ? 'iptv'
      : ''

  if (profileType) await loadData(`profiles/select/${profileType}`, 'profiles')
}
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
    await loadProfiles(newType)

    const needsNodes = [1, 2, 5, 6, 7].includes(newType) // INSTALLATION, RENEWAL, CHANGE_ADDRESS
    if (needsNodes) await loadNodes()
  },
  { immediate: false },
)
// Watchers simplificados
const createWatcher = (fieldName, loadFn, clearFields = []) => {
  watch(
    () => fields[fieldName]?.data,
    async (newVal, oldVal) => {
      if (newVal === oldVal || isLoadingExistingData) return
      if (newVal) await loadFn(newVal)
      clearFields.forEach((field) => fields[field] && (fields[field].data = null))
    },
    { immediate: false },
  )
}
createWatcher('node', loadEquipments, ['equipment'])
createWatcher('state', loadMunicipalities, ['municipality', 'district'])
createWatcher('municipality', loadDistricts, ['district'])
// Watcher especial para cliente
watch(
  () => fields.client?.data,
  async (newClient, oldClient) => {
    if (newClient === oldClient || isLoadingExistingData) return

    if (newClient && [3, 4, 5, 6, 7, 8, 9].includes(fields.type?.data)) {
      await loadClientServices(newClient)
    }
    if (fields.service) fields.service.data = null
  },
  { immediate: false },
)
// Computed simplificados
const fieldOrder = [
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
const textOrder = ['description', 'address', 'solution', 'comments']
const regularFields = computed(() =>
  fieldOrder
    .map((name) => [name, fields[name]])
    .filter(([, field]) => field && !field.type.includes('textarea')),
)
const textAreaFields = computed(() =>
  textOrder
    .map((name) => [name, fields[name]])
    .filter(([, field]) => field && field.type.includes('textarea')),
)
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
    }[key]
  ] || []
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
const loadDataForEdit = async (data) => {
  const promises = []

  if (data.type_id) {
    promises.push(loadProfiles(data.type_id))
    if ([1, 2, 5, 6, 7].includes(data.type_id)) {
      promises.push(loadNodes())
      if (data.node_id) promises.push(loadEquipments(data.node_id))
    }
  }

  if (data.client_id && [3, 4, 5, 6, 7, 8, 9].includes(data.type_id)) {
    promises.push(loadClientServices(data.client_id))
  }

  if (data.state_id) {
    promises.push(loadMunicipalities(data.state_id))
    if (data.municipality_id) promises.push(loadDistricts(data.municipality_id))
  }

  await Promise.all(promises)
}
const toggleLoading = (loading, title) => {
  uiStates.loading = loading
  uiStates.title = title
  loading ? showLoading() : setTimeout(hideLoading, 250)
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
onMounted(async () => {
  toggleLoading(true, 'Cargando...')
  try {
    const [branches, statuses, technicians, types] = await Promise.all([
      getSupportData('/api/v1/general/branches'),
      getSupportData('/api/v1/general/supports/status'),
      getSupportData('/api/v1/general/management/users/technicians'),
      getSupportData('/api/v1/general/supports/types'),
      loadStates(),
    ])

    Object.assign(external, { branches, statuses, technicians, types })

    if (props.id > 0) await getData()
  } catch (err) {
    console.error(err)
    showNotification('Error', 'Error al cargar datos iniciales', 'red-10')
  } finally {
    toggleLoading(false)
  }
})
</script>
<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="sendData">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ uiStates.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="uiStates.loading"
            :label="props.id > 0 ? 'Actualizar' : 'Almacenar'"
            type="submit"
            color="white"
          >
            <template v-slot:loading>
              <q-spinner-gears class="on-left" />
            </template>
          </q-btn>

          <q-btn v-close-popup round dense icon="close" />
        </q-toolbar>
      </q-header>

      <footer-component />

      <q-page-container>
        <q-page class="q-pa-md bg-dark">
          <q-card flat class="custom-cards q-pa-sm">
            <!--    Input Content   -->
            <q-card-section>
              <div class="row wrap full-width justify-start items-center content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
                  v-for="[index, field] in regularFields"
                  :key="index"
                >
                  <!-- Render Select Inputs   -->
                  <template v-if="field.type === 'select'">
                    <q-select
                      v-model="field.data"
                      dense
                      dark
                      outlined
                      clearable
                      color="white"
                      emit-value
                      map-options
                      transition-show="jump-up"
                      transition-hide="jump-down"
                      lazy-rules
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="selectOptions(index)"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                    />
                  </template>

                  <!--    Render Select Filter   -->
                  <template v-if="field.type === 'select-filter'">
                    <q-select
                      v-model="field.data"
                      dense
                      dark
                      outlined
                      clearable
                      color="white"
                      emit-value
                      map-options
                      transition-show="jump-up"
                      transition-hide="jump-down"
                      lazy-rules
                      use-input
                      input-debounce="0"
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="external.filtered_client"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      @filter="selectClient"
                    />
                  </template>

                  <!--    Render Input Date   -->
                  <template v-if="field.type === 'date'">
                    <q-input
                      dark
                      dense
                      outlined
                      clearable
                      v-model="field.data"
                      v-if="!uiStates.loading"
                      :rules="field.rules"
                      :label="field.label"
                      :error="field.error"
                      :error-message="field['error-message']"
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy cover transiton-show="scale" transition-hide="scale">
                            <q-date
                              v-model="field.data"
                              mask="YYYY-MM-DD"
                              :locale="locale"
                              color="blue-10"
                            >
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Cerrar" color="white" flat />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </template>

                  <q-skeleton
                    class="q-my-xs"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="uiStates.loading"
                  />
                </div>
              </div>

              <!-- Render Text Areas -->
              <div class="row wrap full-width justify-start items-center content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-sm"
                  v-for="[index, field] in textAreaFields"
                  :key="`textarea-${index}`"
                >
                  <q-input
                    v-model="field.data"
                    dark
                    dense
                    outlined
                    clearable
                    type="textarea"
                    rows="4"
                    color="white"
                    v-if="!uiStates.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                  />
                </div>
              </div>
            </q-card-section>
            <!--    End Input Content -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>
<style lang="sass" scoped></style>
