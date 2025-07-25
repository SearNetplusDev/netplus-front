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
const url = 'api/v1/infrastructure/equipment/'
const fields = reactive({
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  type: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Tipo',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  brand: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Marca',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  model: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Modelo',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  mac: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Dirección MAC',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  ip: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Dirección IP',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  username: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Usuario',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  secret: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Contraseña',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  node: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nodo',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  status: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Estado',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  comments: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Observaciones',
    type: 'textarea',
  },
})
const external = reactive({
  types: [],
  brands: [],
  models: [],
  nodes: [],
  status: [],
})
const options = (key) => {
  return (
    {
      type: external.types,
      brand: external.brands,
      model: external.models,
      node: external.nodes,
      status: external.status,
    }[key] || []
  )
}
const getData = () => {
  showLoading()
  loading.value = true
  title.value = 'Obteniedo datos, espera un momento...'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.equipment
      fields.name.data = itm.name
      fields.type.data = itm.type_id
      fields.brand.data = itm.brand_id
      fields.model.data = itm.model_id
      fields.mac.data = itm.mac_address
      fields.ip.data = itm.ip_address
      fields.username.data = itm.username
      fields.secret.data = itm.secret
      fields.node.data = itm.node_id
      fields.comments.data = itm.comments ?? null
      fields.status.data = itm.status_id
      title.value = `Editar datos del equipo: ${itm.name}`
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
  let params = new FormData()
  title.value = 'Procesando datos, espera un momento...'
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  params.append('name', fields.name.data)
  params.append('type', fields.type.data)
  params.append('brand', fields.brand.data)
  params.append('model', fields.model.data)
  params.append('mac', fields.mac.data)
  params.append('ip', fields.ip.data)
  params.append('username', fields.username.data)
  params.append('secret', fields.secret.data)
  params.append('node', fields.node.data)
  params.append('comments', fields.comments.data)
  params.append('status', fields.status.data)
  props.id > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  let request = props.id > 0 ? `${url}${props.id}` : url

  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        title.value = `Editar datos del equipo: ${res.data.equipment?.name}`
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
  if (props.id > 0) getData()
  title.value = 'Registrar equipo'
  external.types = await getSupportData('/api/v1/general/infrastructure/types')
  external.brands = await getSupportData('/api/v1/general/infrastructure/brands')
  external.nodes = await getSupportData('/api/v1/general/infrastructure/nodes')
  external.status = await getSupportData('api/v1/general/infrastructure/status')
  external.models = await getSupportData('api/v1/general/infrastructure/models')
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
                    <q-breadcrumbs-el
                      label="Infraestructura"
                      icon="mdi-office-building-cog-outline"
                    />
                    <q-breadcrumbs-el label="Equipos" icon="mdi-access-point" />
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
                  v-for="(field, index) in fields"
                  :key="index"
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
                      :options="options(index)"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                    />
                  </div>
                  <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
                </div>

                <div class="col-12 q-pa-md">
                  <q-input
                    v-model="fields.comments.data"
                    outlined
                    dark
                    dense
                    type="textarea"
                    :label="fields.comments.label"
                    v-if="!loading"
                    :error="fields.comments.error"
                    :error-message="fields.comments['error-message']"
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
