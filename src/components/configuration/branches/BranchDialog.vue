<script setup>
import { onMounted, ref, reactive } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showLoading, hideLoading } = useLoading()
const title = ref('')
const loading = ref(false)
const { showNotification } = useNotifications()
const props = defineProps({
  id: Number,
})
const url = 'api/v1/configuration/branches/'
const fields = reactive({
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  code: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Código',
    type: 'text',
    rules: [],
  },
  landline: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Número de teléfono fijo',
    type: 'text',
    rules: [],
  },
  mobile: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Número de teléfono celular',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
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
  country: {
    data: null,
    error: false,
    'error-message': '',
    label: 'País',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  badge: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Color de badge',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    type: 'toggle',
  },
  address: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Dirección',
    type: 'text-area',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
})
const external = reactive({
  countries: [],
  states: [],
  municipalities: [],
  districts: [],
})
const getData = () => {
  showLoading()
  loading.value = true
  title.value = 'Obteniedo datos, espera un momento...'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.branch
      fields.name.data = itm.name
      fields.code.data = itm.code
      fields.landline.data = itm.landline
      fields.mobile.data = itm.mobile
      fields.state.data = itm.state_id
      fields.municipality.data = itm.municipality_id
      fields.district.data = itm.district_id
      fields.country.data = itm.country_id
      fields.badge.data = itm.badge_color
      fields.address.data = itm.address
      fields.status.data = itm.status_id
      title.value = `Editar datos de la sucursal: ${itm.name}`
      if (itm) {
        onStateChange(false)
        onMunicipalityChange(false)
      }
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 1000)
    })
}
const sendData = () => {
  let request = ''
  let status = fields.status.data ? 1 : 0
  let params = new FormData()
  title.value = 'Procesando datos, espera un momento...'
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  params.append('name', fields.name.data)
  params.append('code', fields.code.data)
  params.append('landline', fields.landline.data)
  params.append('mobile', fields.mobile.data)
  params.append('address', fields.address.data)
  params.append('state', fields.state.data)
  params.append('municipality', fields.municipality.data)
  params.append('district', fields.district.data)
  params.append('country', fields.country.data)
  params.append('badge', fields.badge.data)
  params.append('status', status)
  props.id > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  props.id > 0 ? (request = `${url}${props.id}`) : (request = url)

  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
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

const getOptions = (key) => {
  return (
    {
      state: external.states,
      municipality: external.municipalities,
      district: external.districts,
      country: external.countries,
    }[key] || []
  )
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
    case 'country':
      handleCountryChange(value)
      break
  }
}

// Función simplificada para manejar el cambio de estado
const handleStateChange = (val) => {
  console.log(`Departamento seleccionado: ${val}`)
  fields.state.data = val
  onStateChange(true)
}

// Función simplificada para manejar el cambio de municipio
const handleMunicipalityChange = (val) => {
  console.log(`Municipio seleccionado: ${val}`)
  fields.municipality.data = val
  onMunicipalityChange(true)
}

// Función simplificada para manejar el cambio de distrito
const handleDistrictChange = (val) => {
  console.log(`Distrito seleccionado: ${val}`)
  fields.district.data = val
}

// Función simplificada para manejar el cambio de país
const handleCountryChange = (val) => {
  console.log(`País seleccionado: ${val}`)
  fields.country.data = val
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

onMounted(async () => {
  external.countries = await getSupportData('/api/v1/general/countries')
  external.states = await getSupportData('/api/v1/general/states')

  if (props.id > 0) {
    getData()
  } else {
    title.value = 'Registrar nueva Sucursal'
  }
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="sendData">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="loading"
            :label="props.id === 0 ? 'Almacenar' : 'Actualizar'"
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

      <FooterComponent />

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
                    <q-breadcrumbs-el label="Configuración" icon="mdi-cog" />
                    <q-breadcrumbs-el label="Sucursales" icon="storefront" />
                  </q-breadcrumbs>
                </div>
              </div>
            </q-card-section>
            <!--    End breadcrumbs   -->

            <q-separator dark class="q-my-sm" />

            <!--    Input content   -->
            <q-card-section>
              <div class="row wrap full-width justify-start items-start content-start">
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
                      :label="field.label"
                      :rules="field.rules"
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

                  <div v-if="field.type === 'toggle'">
                    <q-toggle
                      v-model="fields.status.data"
                      label="Estado"
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

                <div class="col-12">
                  <q-input
                    v-model="fields.address.data"
                    outlined
                    dark
                    dense
                    type="textarea"
                    label="Dirección"
                    v-if="!loading"
                    :error="fields.status.error"
                    :error-message="fields.status['error-message']"
                  />
                  <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
                </div>
              </div>
            </q-card-section>
            <!--    End input content   -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
