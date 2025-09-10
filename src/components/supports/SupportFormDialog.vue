<script setup>
import { reactive, onMounted, computed, watch } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import LocaleEs from 'src/utils/composables/localeEs.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showNotification } = useNotifications()
const locale = LocaleEs
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
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

const validationRules = {
  text_required: (val) => (val && val.length > 0) || 'Campo requerido',
  select_required: (val) => (val !== null && val !== '') || 'Campo requerido',
}

const createField = (label, type, rules = []) => ({
  data: null,
  error: false,
  label,
  type,
  rules,
})

// Definición completa de todos los campos disponibles
const allFieldDefinitions = {
  type: () => createField('Tipo de soporte', 'select', [validationRules.select_required]),
  client: () => createField('Cliente', 'select-filter', [validationRules.select_required]),
  service: () => createField('Servicio', 'select', [validationRules.select_required]),
  profile: () => createField('Perfil de navegación', 'select', [validationRules.select_required]),
  initial_date: () =>
    createField('Fecha de inicio del contrato', 'date', [validationRules.text_required]),
  final_date: () =>
    createField('Fecha caducidad del contrato', 'date', [validationRules.text_required]),
  node: () => createField('Nodo', 'select', [validationRules.select_required]),
  equipment: () => createField('Equipo', 'select', [validationRules.select_required]),
  description: () =>
    createField('Descripción del soporte', 'textarea-md', [validationRules.text_required]),
  branch: () => createField('Sucursal', 'select', [validationRules.select_required]),
  technician: () => createField('Técnico', 'select'),
  state: () => createField('Departamento', 'select', [validationRules.select_required]),
  municipality: () => createField('Municipio', 'select', [validationRules.select_required]),
  district: () => createField('Distrito', 'select', [validationRules.select_required]),
  status: () => createField('Estado', 'select', [validationRules.select_required]),
  address: () => createField('Dirección', 'textarea-md', [validationRules.text_required]),
  solution: () => createField('Solución', 'textarea-md'),
  comments: () => createField('Observaciones', 'textarea-md'),
}

const FIELDS_BY_TYPE = {
  [SUPPORT_TYPES.INTERNET_INSTALLATION]: [
    'type',
    'client',
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
    'description',
    'address',
    'solution',
    'comments',
  ],
  [SUPPORT_TYPES.IPTV_INSTALLATION]: [
    'type',
    'client',
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
    'description',
    'address',
    'solution',
    'comments',
  ],
  [SUPPORT_TYPES.INTERNET_SUPPORT]: [
    'type',
    'client',
    'service',
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
  [SUPPORT_TYPES.IPTV_SUPPORT]: [
    'type',
    'client',
    'service',
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
  [SUPPORT_TYPES.INTERNET_RENEWAL]: [
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
    'description',
    'address',
    'solution',
    'comments',
  ],
  [SUPPORT_TYPES.IPTV_RENEWAL]: [
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
    'description',
    'address',
    'solution',
    'comments',
  ],
  [SUPPORT_TYPES.CHANGE_ADDRESS]: [
    'type',
    'client',
    'service',
    'node',
    'equipment',
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
  [SUPPORT_TYPES.EQUIPMENT_SALE]: [
    'type',
    'client',
    'service',
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
  [SUPPORT_TYPES.UNINSTALLATION]: [
    'type',
    'client',
    'service',
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
}

// Función para crear campos dinámicamente según el tipo
const createFieldsForType = (supportType) => {
  const fieldsToCreate = supportType ? FIELDS_BY_TYPE[supportType] || ['type'] : ['type']
  const newFields = {}

  fieldsToCreate.forEach((fieldName) => {
    if (allFieldDefinitions[fieldName]) {
      newFields[fieldName] = allFieldDefinitions[fieldName]()
    }
  })

  return newFields
}

// Inicializar con solo el campo type
const fields = reactive(createFieldsForType(null))

// Watcher para recrear fields cuando cambie el tipo de soporte
watch(
  () => fields.type?.data,
  (newType, oldType) => {
    if (newType !== oldType) {
      // Guardar el valor actual del tipo
      const currentTypeValue = fields.type?.data
      const currentTypeField = fields.type

      // Crear nuevos campos para el tipo seleccionado
      const newFields = createFieldsForType(newType)

      // Limpiar fields actual
      Object.keys(fields).forEach((key) => {
        delete fields[key]
      })

      // Agregar los nuevos campos
      Object.keys(newFields).forEach((key) => {
        fields[key] = newFields[key]
      })

      // Restaurar el valor del tipo si existe
      if (fields.type && currentTypeValue) {
        fields.type.data = currentTypeValue
        // Mantener las propiedades del campo type original
        Object.keys(currentTypeField).forEach((prop) => {
          if (prop !== 'data') {
            fields.type[prop] = currentTypeField[prop]
          }
        })
      }
    }
  },
  { immediate: false },
)

const regularFields = computed(() => {
  return Object.entries(fields).filter(([, field]) => {
    return !['textarea', 'textarea-md'].includes(field.type)
  })
})

const textAreaFields = computed(() => {
  return Object.entries(fields).filter(([, field]) => {
    return ['textarea', 'textarea-md'].includes(field.type)
  })
})

const external = reactive({
  branches: [],
  statuses: [],
  technicians: [],
  types: [],
  filtered_client: [],
  profiles: [],
  nodes: [],
  equipments: [],
  states: [],
  municipalities: [],
  districts: [],
  services: [],
})
const loadProfiles = async (supportType) => {
  try {
    let profileType = ''
    if (
      [SUPPORT_TYPES.INTERNET_INSTALLATION, SUPPORT_TYPES.INTERNET_RENEWAL].includes(supportType)
    ) {
      profileType = 'internet'
    } else if (
      [SUPPORT_TYPES.IPTV_INSTALLATION, SUPPORT_TYPES.IPTV_RENEWAL].includes(supportType)
    ) {
      profileType = 'iptv'
    }

    if (profileType) {
      external.profiles = await getSupportData(`/api/v1/general/profiles/select/${profileType}`)
    }
  } catch (err) {
    console.error('Error loading profiles: ', err)
    showNotification('Error', 'Error al cargar los perfiles correspondientes.', 'red-10')
  }
}
const loadNodes = async () => {
  try {
    external.nodes = await getSupportData(`/api/v1/general/infrastructure/nodes`)
  } catch (err) {
    console.error('Error loading nodes : ', err)
    showNotification('Error', 'Error al cargar los Nodos.', 'red-10')
  }
}
const loadEquipments = async (nodeId) => {
  if (!nodeId) {
    external.equipments = []
    return
  }
  try {
    external.equipments = await getSupportData(
      `/api/v1/general/infrastructure/node/${nodeId}/equipment`,
    )
  } catch (err) {
    console.error('Error loading equipments:', err)
    showNotification('Error', 'Error al cargar equipos', 'red-10')
  }
}
const loadClientServices = async (clientId) => {
  if (!clientId) {
    external.services = []
    return
  }
  try {
    external.services = await getSupportData(`/api/v1/general/services/client/${clientId}`)
  } catch (err) {
    console.error('Error loading services: ', err)
    showNotification('Error', 'Error al cargar los servicios del cliente.', 'red-10')
  }
}
const clearDependentData = () => {
  external.profiles = []
  external.nodes = []
  external.equipments = []
  external.services = []
}
//  Watcher para cargar datos cuando cambie el tipo de soporte
watch(
  () => fields.type?.data,
  async (newType, oldType) => {
    if (newType !== oldType && newType) {
      clearDependentData()
      await loadProfiles(newType)
      const typesRequiringNodes = [
        SUPPORT_TYPES.INTERNET_INSTALLATION,
        SUPPORT_TYPES.IPTV_INSTALLATION,
        SUPPORT_TYPES.INTERNET_RENEWAL,
        SUPPORT_TYPES.IPTV_RENEWAL,
        SUPPORT_TYPES.CHANGE_ADDRESS,
      ]

      if (typesRequiringNodes.includes(newType)) {
        await loadNodes()
      }
    }
  },
  { immediate: false },
)
//  Watcher para cargar equipos cuando cambie el nodo
watch(
  () => fields.node?.data,
  async (newNode, oldNode) => {
    if (newNode !== oldNode && newNode) {
      await loadEquipments(newNode)
    }

    if (fields.equipment) {
      fields.equipment.data = null
    }
  },
  { immediate: false },
)
//  Watcher para cargar servicios cuando cambie el cliente
watch(
  () => fields.client?.data,
  async (newClient, oldClient) => {
    if (newClient !== oldClient && newClient) {
      const typesRequiringServices = [
        SUPPORT_TYPES.INTERNET_SUPPORT,
        SUPPORT_TYPES.IPTV_SUPPORT,
        SUPPORT_TYPES.INTERNET_RENEWAL,
        SUPPORT_TYPES.IPTV_RENEWAL,
        SUPPORT_TYPES.CHANGE_ADDRESS,
        SUPPORT_TYPES.EQUIPMENT_SALE,
        SUPPORT_TYPES.UNINSTALLATION,
      ]
      const currentType = fields.type?.data

      if (currentType && typesRequiringServices.includes(currentType)) {
        await loadClientServices(newClient)
      }
    }

    if (fields.service) {
      fields.service.data = null
    }
  },
  { immediate: false },
)
const selectOptions = (key) => {
  return (
    {
      type: external.types,
      branch: external.branches,
      status: external.statuses,
      profile: external.profiles,
      node: external.nodes,
      equipment: external.equipments,
      technician: external.technicians,
      state: external.states,
      municipality: external.municipalities,
      district: external.districts,
    }[key] || []
  )
}

const selectClient = (val, update) => {
  const uri = '/api/v1/clients/search/'

  if (!val || val.length < 4) {
    update(() => {
      external.filtered_client = external.client
    })
    return
  }

  update(async () => {
    try {
      const { data } = await api.post(uri, { client: val })
      external.filtered_client = data.clients ?? []
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.message || err.message || 'Error inesperado'
      showNotification('Error', message, 'red-10')
    }
  })
}

const clearFilter = () => {}
const getData = () => {}
const sendData = async () => {
  // Aquí tendrás solo los campos correspondientes al tipo de soporte seleccionado
  console.log('Campos actuales:', fields)
}

onMounted(async () => {
  if (props.id > 0) getData()

  try {
    const [branches, statuses, technicians, types] = await Promise.all([
      getSupportData('/api/v1/general/branches'),
      getSupportData('/api/v1/general/supports/status'),
      getSupportData('/api/v1/general/management/users/technicians'),
      getSupportData('/api/v1/general/supports/types'),
    ])
    external.branches = branches
    external.statuses = statuses
    external.technicians = technicians
    external.types = types
  } catch (err) {
    console.error(err)
    showNotification('Error', err, 'red-10')
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
            <!--    Breadcrumbs   -->
            <q-card-section>
              <div class="fit row">
                <div class="col-12">
                  <q-breadcrumbs class="text-white" active-color="white" gutter="md">
                    <template v-slot:separator>
                      <q-icon size="1.5em" name="chevron_right" color="white" />
                    </template>
                    <q-breadcrumbs-el label="Soportes" icon="mdi-face-agent" />
                  </q-breadcrumbs>
                </div>
              </div>
            </q-card-section>
            <!--    End breadcrumbs   -->

            <q-separator dark class="q-my-sm" />

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
                      @filter-abort="clearFilter"
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

<style scoped></style>
