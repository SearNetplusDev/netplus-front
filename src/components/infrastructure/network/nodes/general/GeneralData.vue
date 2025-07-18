<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'

const loading = ref(false)
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const props = defineProps({
  node: Number,
})
const url = 'api/v1/infrastructure/network/nodes/'
const fields = reactive({
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  server: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Servidor de autenticación',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  latitude: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Latitud',
    type: 'text',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) => /^([-+]?([1-8]?[0-9](\.[0-9]+)?)|90(\.0+)?)$/.test(val) || 'Formato incorrecto',
    ],
  },
  longitude: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Longitud',
    type: 'text',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) =>
        /^([-+]?((1[0-7][0-9])|(0?[0-9]{1,2})(\.[0-9]+)?)|180(\.0+)?)$/.test(val) ||
        'Formato incorrecto',
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
  nc: {
    data: null,
    error: false,
    'error-message': '',
    label: 'NC',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
    mask: '############',
  },
  owner: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Propietario NC',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    type: 'toggle',
    label: 'Estado',
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
    label: 'Nombres',
    type: 'textarea',
    rules: [],
  },
})
const external = reactive({
  servers: [],
  states: [],
  municipalities: [],
  districts: [],
})
const getData = () => {
  showLoading()
  loading.value = true
  let data = new FormData()
  data.append('id', props.node)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let item = res.data.node
      fields.name.data = item.name
      fields.server.data = item.server_id
      fields.latitude.data = item.latitude
      fields.longitude.data = item.longitude
      fields.state.data = item.state_id
      fields.municipality.data = item.municipality_id
      fields.district.data = item.district_id
      fields.address.data = item.address
      fields.nc.data = item.nc
      fields.owner.data = item.nc_owner
      fields.comments.data = item.comments === null ? '' : item.comments
      fields.status.data = item.status_id
      if (item) {
        onStateChange(false)
        onMunicipalityChange(false)
      }
      emit('updateTitle', item.name)
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
  let params = new FormData()
  params.append('name', fields.name.data)
  params.append('server', fields.server.data)
  params.append('lat', fields.latitude.data)
  params.append('lng', fields.longitude.data)
  params.append('state', fields.state.data)
  params.append('municipality', fields.municipality.data)
  params.append('district', fields.district.data)
  params.append('address', fields.address.data)
  params.append('nc', fields.nc.data)
  params.append('owner', fields.owner.data)
  params.append('comments', fields.comments.data)
  params.append('status', status)
  props.node > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  let request = props.node > 0 ? `${url}${props.node}` : url
  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        emit('loadDrawer', res.data.node?.id)
        emit('updateTitle', res.data.node?.name)
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
const getOptions = (key) => {
  return (
    {
      server: external.servers,
      state: external.states,
      municipality: external.municipalities,
      district: external.districts,
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
    case 'server':
      handleServerChange(value)
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
const handleServerChange = (val) => {
  console.log(`Servidor seleccionado: ${val}`)
  // fields.server.data = val
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
const emit = defineEmits(['loadDrawer', 'updateTitle'])
onMounted(async () => {
  if (props.node > 0) getData()
  external.servers = await getSupportData('/api/v1/general/infrastructure/servers')
  external.states = await getSupportData('/api/v1/general/states')
})
</script>

<template>
  <div class="fit row">
    <div class="col-12">
      <q-breadcrumbs class="text-white" gutter="md" active-color="white">
        <template v-slot:separator>
          <q-icon size="1.5em" name="chevron_right" color="white" />
        </template>
        <q-breadcrumbs-el label="Infraestructura" icon="mdi-office-building-cog-outline" />
        <q-breadcrumbs-el label="Redes" icon="mdi-lan-pending" />
        <q-breadcrumbs-el label="Nodos" icon="cell_tower" />
        <q-breadcrumbs-el label="Información General" icon="mdi-book-account-outline" />
      </q-breadcrumbs>

      <q-separator dark class="q-my-md" />

      <q-form greedy @submit="sendData">
        <div class="col-12 fit row">
          <div
            class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
            v-for="(field, name) in fields"
            :key="name"
          >
            <!--    Input Text    -->
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

            <!--    Input Select    -->
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

            <!--    Toggle    -->
            <div v-if="field.type === 'toggle'">
              <q-toggle
                v-model="field.data"
                :label="field.label"
                checked-icon="check"
                unchecked-icon="clear"
                size="lg"
                color="primary"
                v-if="!loading"
                :error="field.error"
                :error-message="field['error-message']"
              />
            </div>
            <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
          </div>

          <div class="col-12 q-pa-sm">
            <q-input
              v-model="fields.address.data"
              outlined
              dark
              dense
              type="textarea"
              label="Dirección"
              :rules="fields.address.rules"
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
              :rules="fields.comments.rules"
              :error="fields.comments.error"
              :error-message="fields.comments['error-message']"
            />
            <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
          </div>
        </div>

        <div class="full-width row wrap justify-end">
          <q-btn
            icon="save"
            :loading="loading"
            :label="props.node === 0 ? 'almacenar' : 'Actualizar datos'"
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
  </div>
</template>

<style scoped></style>
