<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import LocaleEs from 'src/utils/composables/localeEs.js'

const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
})
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

//  Mapeando valores de la prop a los campos
const mapServiceToFields = (service) => {
  if (!service?.id) {
    console.log('Nuevo Servicio - Campos en Blanco')
    return
  }
  console.log('Cargado datos del servicio: ', service.id)
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
const sendData = () => {}

onMounted(async () => {
  console.log('Componente montado con servicio:', props.service?.id || 'nuevo')
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
    </q-form>
  </div>
</template>

<style scoped></style>
