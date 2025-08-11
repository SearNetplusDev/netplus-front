<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { api } from 'boot/axios.js'
import LocaleEs from 'src/utils/composables/localeEs.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { handleSubmissionError, resetFieldErrors } from 'src/utils/composables/useFormHandler.js'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
})
const url = '/api/v1/services/'
const loading = ref(false)
const fields = reactive({
  code: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Código',
    type: 'text',
    rules: [],
  },
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [],
  },
  node: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nodo',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  equipment: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Equipo',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  installation_date: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Fecha de instalación',
    type: 'date',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  technician: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Instalador',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  lat: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Latitud',
    type: 'text',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) =>
        /^([-+]?(90(\.0{6,})?|[0-8]?\d(\.\d{6,})?))$/.test(val) ||
        'Formato incorrecto para latitud',
    ],
  },
  long: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Longitud',
    type: 'text',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) =>
        /^([-+]?(180(\.0{6,})?|1[0-7]\d(\.\d{6,})?|[0-9]?\d(\.\d{6,})?))$/.test(val) ||
        'Formato incorrecto para longitud',
    ],
  },
  state: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Departamento',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  municipality: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Municipio',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  district: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Distrito',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  separation: {
    data: false,
    error: false,
    'error-message': '',
    label: 'Factura independiente',
    type: 'toggle',
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    label: 'Estado',
    type: 'toggle',
  },
  address: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Dirección',
    type: 'textarea',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  comments: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Observaciones',
    type: 'textarea',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
})
const locale = LocaleEs
const external = reactive({
  nodes: [],
  equipment: [],
  technicians: [],
  states: [],
  municipalities: [],
  districts: [],
})
const getOptions = (key) => {
  return (
    {
      node: external.nodes,
      equipment: external.equipment,
      technician: external.technicians,
      state: external.states,
      municipality: external.municipalities,
      district: external.districts,
    }[key] || []
  )
}
const onSelectChange = (name, value) => {
  switch (name) {
    case 'node':
      handleNodeChange(value)
      break
    case 'equipment':
      handleEquipmentChange(value)
      break
    case 'technician':
      handleTechnicianChange(value)
      break
    case 'state':
      handleStateChange(value)
      break
    case 'municipality':
      handleMunicipalityChange(value)
      break
    case 'district':
      handleDistrictChange(value)
      break
  }
}
const handleNodeChange = (val) => {
  console.log('Nodo seleccionado: ', val)
  fields.node.data = val
  onNodeChange(true)
}
const handleEquipmentChange = (val) => {
  console.log('Equipo seleccionado: ', val)
  fields.equipment.data = val
}
const handleTechnicianChange = (val) => {
  console.log('Técnico seleccionado: ', val)
  fields.technician.data = val
}
const handleStateChange = (val) => {
  console.log(`Departamento seleccionado: ${val}`)
  fields.state.data = val
  onStateChange(true)
}
const handleMunicipalityChange = (val) => {
  console.log(`Municipio seleccionado: ${val}`)
  fields.municipality.data = val
  onMunicipalityChange(true)
}
const handleDistrictChange = (val) => {
  console.log(`Distrito seleccionado: ${val}`)
  fields.district.data = val
}
const onNodeChange = async (reload) => {
  if (!fields.node.data) return

  if (reload) {
    fields.equipment.data = null
    external.equipment = []
  }

  try {
    external.equipment = await getSupportData(
      `api/v1/general/infrastructure/node/${fields.node.data}/equipment`,
    )
  } catch (err) {
    console.error('Error cargando equipos ', err)
    showNotification('Error', 'Error al cargar los equipos', 'red-10')
  }
}
const onStateChange = async (reload) => {
  if (!fields.state.data) return

  if (reload) {
    // Resetear a null en lugar de objetos
    fields.municipality.data = null
    fields.district.data = null
    external.municipalities = []
    external.districts = []
  }

  try {
    external.municipalities = await getSupportData(
      `api/v1/general/state/${fields.state.data}/municipalities`,
    )
  } catch (error) {
    console.error('Error cargando municipios:', error)
    showNotification('Error', 'Error al cargar municipios', 'red-10')
  }
}

const onMunicipalityChange = async (reload) => {
  // Condiciones simplificadas
  if (!fields.municipality.data) return

  if (reload) {
    // Resetear a null
    fields.district.data = null
    external.districts = []
  }

  try {
    external.districts = await getSupportData(
      `api/v1/general/municipality/${fields.municipality.data}/districts`,
    )
  } catch (error) {
    console.error('Error cargando distritos:', error)
    showNotification('Error', 'Error al cargar distritos', 'red-10')
  }
}
//  Mapeando valores de la prop a los campos
const mapServiceToFields = (service) => {
  if (!service?.id) {
    console.log('Nuevo Servicio - Campos en Blanco')
    return
  }
  console.log('Cargado datos del servicio: ', service.id)
  showLoading()
  fields.code.data = service.code || null
  fields.name.data = service.name || null
  fields.node.data = service.node_id || null
  fields.equipment.data = service.equipment_id || null
  fields.technician.data = service.technician_id || null
  fields.state.data = service.state_id || null
  fields.municipality.data = service.municipality_id || null
  fields.district.data = service.district_id || null
  fields.installation_date.data = service.installation_date || null
  fields.lat.data = service.latitude || null
  fields.long.data = service.longitude || null
  fields.separation.data = Boolean(service.separate_billing)
  fields.status.data = Boolean(service.status_id)
  fields.address.data = service.address || null
  fields.comments.data = service.comments || null
  onNodeChange(false)
  onStateChange(false)
  onMunicipalityChange(false)
  hideLoading()
}
const clearFields = () => {
  Object.keys(fields).forEach((key) => {
    if (fields[key].type === 'toggle') {
      fields[key].data = false
    } else {
      fields[key].data = null
    }
    // Limpiar errores
    fields[key].error = false
    fields[key]['error-message'] = ''
  })
}
watch(
  () => props.service,
  (newService) => {
    if (newService?.id) {
      // Si hay un servicio con ID, cargar sus datos
      mapServiceToFields(newService)
    } else {
      // Si no hay ID, limpiar campos para nuevo servicio
      clearFields()
    }
  },
  {
    immediate: true, // Ejecutar inmediatamente al montar
    deep: true, // Observar cambios profundos en el objeto
  },
)
const emit = defineEmits(['record-created'])
const sendData = () => {
  let status = fields.status.data ? 1 : 0
  let independent = fields.separation.data ? 1 : 0
  let params = new FormData()
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  params.append('client', props.service.client_id)
  if (fields.code.data) params.append('code', fields.code.data ?? null)
  if (fields.name.data) params.append('name', fields.name.data ?? null)
  params.append('node', fields.node.data)
  params.append('equipment', fields.equipment.data)
  params.append('installation_date', fields.installation_date.data)
  params.append('technician', fields.technician.data)
  params.append('lat', fields.lat.data)
  params.append('long', fields.long.data)
  params.append('state', fields.state.data)
  params.append('municipality', fields.municipality.data)
  params.append('district', fields.district.data)
  params.append('address', fields.address.data)
  params.append('separation', independent)
  params.append('status', status)
  if (fields.comments.data) params.append('comments', fields.comments.data)
  props.service.id > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  let request = props.service.id > 0 ? `${url}${props.service.id}` : url
  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        emit('record-created', {
          id: res.data.service?.id,
          client_id: res.data.service?.client_id,
        })
      } else {
        showNotification('Error', 'Verifica la información ingresada', 'teal-10')
      }
    })
    .catch((err) => {
      handleSubmissionError(err, fields)
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 1000)
    })
}

onMounted(async () => {
  console.log('Componente montado con servicio:', props.service?.id || 'nuevo')
  external.nodes = await getSupportData('/api/v1/general/infrastructure/nodes')
  external.states = await getSupportData('/api/v1/general/states')
  external.technicians = await getSupportData('/api/v1/general/management/users/technicians')
})
</script>

<template>
  <div class="full-width">
    <q-form greedy @submit="sendData">
      <div class="fit row">
        <div
          class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
          v-for="(field, index) in fields"
          :key="index"
        >
          <!--    Text    -->
          <div v-if="field.type === 'text'">
            <q-input
              dense
              dark
              outlined
              clearable
              lazy-rules
              v-model="field.data"
              v-if="!loading"
              :rules="field.rules"
              :label="field.label"
              :error="field.error"
              :error-message="field['error-message']"
            />
          </div>

          <!--    Selects   -->
          <div v-if="field.type === 'select'">
            <q-select
              v-model="field.data"
              dense
              dark
              outlined
              clearable
              color="white"
              emit-value
              map-options
              transition-show="flip-up"
              transition-hide="flip-down"
              lazy-rules
              v-if="!loading"
              :label="field.label"
              :rules="field.rules"
              :error="field.error"
              :error-message="field['error-message']"
              :options="getOptions(index)"
              :option-value="(opt) => opt.id"
              :option-label="(opt) => opt.name"
              @update:model-value="onSelectChange(index, $event)"
            />
          </div>

          <!-- Dates    -->
          <div v-if="field.type === 'date'">
            <q-input
              dark
              dense
              outlined
              v-model="field.data"
              v-if="!loading"
              :rules="field.rules"
              :label="field.label"
              :error="field.error"
              :error-message="field['error-message']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transiton-show="scale" transition-hide="scale">
                    <q-date v-model="field.data" mask="YYYY-MM-DD" :locale="locale" color="blue-10">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="white" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!--    Toggles   -->
          <div v-if="field.type === 'toggle'">
            <q-toggle
              v-model="field.data"
              :label="field.label"
              checked-icon="check"
              unchecked-icon="clear"
              size="lg"
              color="primary"
              v-if="!loading"
              :error="fields.status.error"
              :error-message="fields.status['error-message']"
            />
          </div>
          <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
        </div>

        <div class="row col-12">
          <div class="col-12 q-pa-sm">
            <q-input
              v-model="fields.address.data"
              outlined
              dark
              dense
              type="textarea"
              label="Dirección"
              v-if="!loading"
              :error="fields.address.error"
              :error-message="fields.address['error-message']"
            />
            <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
          </div>

          <div class="col-12 q-pa-sm">
            <q-input
              v-model="fields.comments.data"
              outlined
              dark
              dense
              type="textarea"
              label="Observaciones"
              v-if="!loading"
              :error="fields.comments.error"
              :error-message="fields.comments['error-message']"
            />
            <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
          </div>
        </div>
      </div>
      <div class="full-width row wrap justify-end">
        <q-btn
          icon="save"
          :loading="loading"
          :label="props.service?.id ? 'actualizar datos' : 'almacenar'"
          type="submit"
          color="primary"
        >
          <template v-slot:loading>
            <q-spinner-gears class="on-left" />
            Loading...
          </template>
        </q-btn>
      </div>
    </q-form>
  </div>
</template>

<style scoped></style>
