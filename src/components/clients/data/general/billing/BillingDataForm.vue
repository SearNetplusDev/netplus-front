<script setup>
import { reactive, ref, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { handleSubmissionError, resetFieldErrors } from 'src/utils/composables/useFormHandler.js'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const props = defineProps({
  client: Number,
})
const loading = ref(false)
const url = '/api/v1/clients/financial/information/'
const currentID = ref(0)
const fields = reactive({
  nrc: {
    data: null,
    error: false,
    'error-message': '',
    label: 'NRC',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) => /^\d{6}-\d$/.test(val) || 'Formato incorrecto',
    ],
    type: 'text',
    mask: '######-#',
  },
  activity: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Actividad económica',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
    type: 'select-filter',
  },
  representative: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Representante Legal',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
    type: 'text',
  },
  dui: {
    data: null,
    error: false,
    'error-message': '',
    label: 'DUI',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) => /^\d{8}-\d$/.test(val) || 'Formato incorrecto',
    ],
    type: 'text',
    mask: '########-#',
  },
  nit: {
    data: null,
    error: false,
    'error-message': '',
    label: 'NIT',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) => /^\d{8}-\d$|^\d{4}-\d{6}-\d{3}-\d$/.test(val) || 'Formato incorrecto',
    ],
    type: 'text',
  },
  phone: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Número de teléfono',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) => /^[267]\d{3}-\d{4}$/.test(val) || 'Formato incorrecto',
    ],
    type: 'text',
    mask: '####-####',
  },
  alias: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Alias Factura',
    rules: [],
    type: 'text',
  },
  retained: {
    data: false,
    error: false,
    'error-message': '',
    label: 'I.V.A. Retenido',
    type: 'toggle',
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
    type: 'area',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
})
const filteredActivities = ref([])
const external = reactive({
  activities: [],
  states: [],
  municipalities: [],
  districts: [],
})
const getOptions = (key) => {
  return (
    {
      state: external.states,
      municipality: external.municipalities,
      district: external.districts,
    }[key] || []
  )
}
const filterActivities = (val, update) => {
  if (val === '') {
    update(() => {
      filteredActivities.value = external.activities
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredActivities.value = external.activities.filter(
      (activity) => activity.name.toLowerCase().indexOf(needle) > -1,
    )
  })
}
const clearActivityFilter = () => {
  filteredActivities.value = external.activities
}
const onSelectChange = (name, value) => {
  switch (name) {
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
const getData = () => {
  showLoading()
  loading.value = true
  let data = new FormData()
  data.append('clientID', props.client)
  api
    .post(`${url}data`, data)
    .then((res) => {
      let itm = res.data.response
      if (itm !== null) {
        currentID.value = itm.id
        fields.nrc.data = itm.nrc
        fields.activity.data = itm.activity_id
        fields.retained.data = itm.retained_iva
        fields.representative.data = itm.legal_representative
        fields.dui.data = itm.dui
        fields.nit.data = itm.nit
        fields.phone.data = itm.phone_number
        fields.alias.data = itm.invoice_alias
        fields.state.data = itm.state_id
        fields.municipality.data = itm.municipality_id
        fields.district.data = itm.district_id
        fields.address.data = itm.address
        fields.status.data = itm.status_id

        if (itm) {
          onStateChange(false)
          onMunicipalityChange(false)
        }
      }
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        hideLoading()
        loading.value = false
      }, 500)
    })
}
const sendData = () => {
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let status = fields.status.data ? 1 : 0
  let retained = fields.retained.data ? 1 : 0
  let params = new FormData()
  params.append('client', props.client)
  params.append('nrc', fields.nrc.data)
  params.append('activity', fields.activity.data)
  params.append('retained', retained)
  params.append('representative', fields.representative.data)
  params.append('dui', fields.dui.data)
  params.append('nit', fields.nit.data)
  params.append('phone', fields.phone.data)
  params.append('alias', fields.alias.data)
  params.append('state', fields.state.data)
  params.append('municipality', fields.municipality.data)
  params.append('district', fields.district.data)
  params.append('address', fields.address.data)
  params.append('status', status)
  currentID.value > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  let request = currentID.value > 0 ? `${url}${currentID.value}` : url
  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        currentID.value = res.data.info.id
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
      }, 500)
    })
}
onMounted(async () => {
  getData()
  external.activities = await getSupportData('/api/v1/general/billing/activities')
  external.states = await getSupportData('/api/v1/general/states')
  filteredActivities.value = external.activities
})
</script>

<template>
  <div class="fit row">
    <div class="col-12">
      <q-breadcrumbs class="text-white" gutter="md" active-color="white">
        <template v-slot:separator>
          <q-icon size="1.5em" name="chevron_right" color="white" />
        </template>
        <q-breadcrumbs-el label="Clientes" icon="mdi-account" />
        <q-breadcrumbs-el label="Datos de Facturación" icon="mdi-account-cash" />
      </q-breadcrumbs>

      <q-separator dark class="q-my-md" />

      <q-form greedy @submit="sendData">
        <div class="col-12 fit row">
          <div
            class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-md"
            v-for="(field, name) in fields"
            :key="name"
          >
            <div v-if="field.type === 'text'">
              <q-input
                dense
                dark
                outlined
                clearable
                lazy-rules
                v-model="field.data"
                v-if="!loading"
                :mask="field.mask"
                :rules="field.rules"
                :label="field.label"
                :error="field.error"
                :error-message="field['error-message']"
              />
            </div>

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
                :options="getOptions(name)"
                :option-value="(opt) => opt.id"
                :option-label="(opt) => opt.name"
                @update:model-value="onSelectChange(name, $event)"
              />
            </div>

            <div v-if="field.type === 'select-filter'">
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
                use-input
                input-debounce="0"
                v-if="!loading"
                :label="field.label"
                :rules="field.rules"
                :error="field.error"
                :error-message="field['error-message']"
                :options="filteredActivities"
                :option-value="(opt) => opt.id"
                :option-label="(opt) => opt.name"
                @filter="filterActivities"
                @filter-abort="clearActivityFilter"
              />
            </div>

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
            <q-skeleton v-if="loading" class="q-my-xs" dark animation="fade" type="QInput" />
          </div>

          <div class="col-12">
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

          <div class="full-width row wrap justify-end">
            <q-btn
              icon="save"
              :loading="loading"
              :label="currentID === 0 ? 'almacenar' : 'Actualizar datos'"
              type="submit"
              color="primary"
            >
              <template v-slot:loading>
                <q-spinner-gears class="on-left" />
                Loading...
              </template>
            </q-btn>
          </div>
        </div>
      </q-form>
    </div>
  </div>
</template>

<style scoped></style>
