<script setup>
import { onMounted, ref, reactive /*watch*/ } from 'vue'
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
const url = 'api/v1/configuration/menu/'
const fields = reactive({
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  uri: {
    data: null,
    error: false,
    'error-message': '',
    label: 'URL',
    type: 'text',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) => /^\/[a-zA-Z/-]+$|^#$/.test(val) || 'Formato incorrecto de url',
    ],
  },
  slug: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Slug',
    type: 'text',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) => /^\S+$/.test(val) || 'Formato incorrecto',
    ],
    // disabled: true,
  },
  icon: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Ícono',
    type: 'text',
    rules: [
      (val) => !!val || 'Campo requerido',
      (val) => /^[a-z_-]+$/.test(val) || 'Formato incorrecto',
    ],
  },
  parent: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Padre',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  order: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Orden',
    type: 'text',
    rules: [
      (val) => !!val || 'Campo requerido',
      (val) => /\d{1,2}/.test(val) || 'Solo se admiten números',
    ],
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    type: 'toggle',
  },
})
const external = reactive({
  parents: [],
})
/*watch(
  () => fields.name.data,
  (newVal) => {
    fields.slug.data = newVal
      .toLowerCase()
      .trim()
      .replace(/[\s]+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
  },
)*/
const getData = () => {
  showLoading()
  loading.value = true
  title.value = 'Obteniendo datos, espera un momento...'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.response
      fields.name.data = itm.name
      fields.uri.data = itm.url
      fields.icon.data = itm.icon
      fields.parent.data = itm.parent_id
      fields.order.data = itm.order
      fields.status.data = itm.status_id
      fields.slug.data = itm.slug
      title.value = `Editar elemento: ${itm.name}`
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
  let status = fields.status.data === true ? 1 : 0
  let params = new FormData()
  title.value = 'Procesando datos, espera un momento...'
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  params.append('name', fields.name.data)
  params.append('url', fields.uri.data)
  params.append('icon', fields.icon.data)
  params.append('parent', fields.parent.data)
  params.append('order', fields.order.data)
  params.append('status', status)
  params.append('slug', fields.slug.data)
  props.id > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  let request = props.id > 0 ? `${url}${props.id}` : url
  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        title.value = `Editar elemento: ${res.data.item?.name}`
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
  if (props.id > 0) {
    getData()
  } else {
    title.value = 'Registrar nuevo elemento para el menú'
  }
  external.parents = await getSupportData('/api/v1/configuration/menu/parents')
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
                    <q-breadcrumbs-el label="Configuración" icon="mdi-cog-outline" />
                    <q-breadcrumbs-el label="Menú" icon="mdi-menu-open" />
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
                      :disable="field.disabled"
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
                      :options="external.parents"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
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

                <div class="q-pa-md content-center">
                  <q-icon size="3em" :name="fields.icon.data" class="text-white" />
                  <span class="text-subtitle2 text-grey q-mx-sm">Icon Preview</span>
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
