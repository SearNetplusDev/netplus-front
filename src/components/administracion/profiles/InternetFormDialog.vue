<script setup>
import { onMounted, ref, reactive, watch } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'
import LocaleEs from 'src/utils/composables/localeEs.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showLoading, hideLoading } = useLoading()
const title = ref('')
const loading = ref(false)
const { showNotification } = useNotifications()
const props = defineProps({
  id: Number,
})
const url = 'api/v1/management/profiles/internet/'
const fields = reactive({
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  alias: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Alias',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  mk_profile: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Perfil Principal',
    // type: 'select',
    // rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  debt_profile: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Perfil Deuda',
    // type: 'select',
    type: 'text',
    rules: [],
  },
  net_value: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Valor Neto',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
    disabled: true,
  },
  iva: {
    data: null,
    error: false,
    'error-message': '',
    label: 'IVA',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
    disabled: true,
  },
  price: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Precio',
    type: 'text',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) =>
        /^\d{1,4}(\.\d{8})?$/.test(val) ||
        'Formato inválido (debe contener de 1 a 4 cifras y 8 decimales)',
    ],
  },
  expiration: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Fecha de vencimiento',
    type: 'date',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    type: 'toggle',
    label: 'Estado',
  },
  description: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Descripción',
    type: 'text-area',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
})
const locale = LocaleEs
const getData = () => {
  showLoading()
  loading.value = true
  title.value = 'Obteniedo datos, espera un momento...'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.profile
      fields.name.data = itm.name
      fields.alias.data = itm.alias
      fields.description.data = itm.description
      fields.mk_profile.data = itm.mk_profile
      fields.debt_profile.data = itm.debt_profile
      fields.net_value.data = itm.net_value
      fields.iva.data = itm.iva
      fields.price.data = itm.price
      fields.expiration.data = itm.expiration_date
      fields.status.data = itm.status_id
      title.value = `Editar datos del perfil ${itm.name}`
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
  params.append('alias', fields.alias.data)
  params.append('description', fields.description.data)
  params.append('main_profile', fields.mk_profile.data)
  params.append('debt_profile', fields.debt_profile.data)
  params.append('net_value', fields.net_value.data)
  params.append('iva', fields.iva.data)
  params.append('price', fields.price.data)
  params.append('expires', fields.expiration.data)
  params.append('status', status)
  props.id > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  props.id > 0 ? (request = `${url}${props.id}`) : (request = url)

  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        title.value = `Editar datos del perfil ${res.data.profile.name}`
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
watch(
  () => fields.price.data,
  (newPrice) => {
    const price = parseFloat(newPrice)
    if (!isNaN(price)) {
      fields.net_value.data = (price / 1.13).toFixed(8)
      fields.iva.data = ((price / 1.13) * 0.13).toFixed(8)
    } else {
      fields.iva.data = 0.0
      fields.net_value.data = 0.0
    }
  },
)
onMounted(() => {
  if (props.id > 0) {
    getData()
  } else {
    title.value = 'Registrar nuevo perfil'
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
                    <q-breadcrumbs-el label="Administración" icon="mdi-account-tie" />
                    <q-breadcrumbs-el label="Perfiles" icon="mdi-account-details-outline" />
                    <q-breadcrumbs-el label="Internet" icon="mdi-web" />
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
                      :options="documents"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      @update:model-value="index === 'type' ? onTypeChange() : null"
                    />
                  </div>

                  <div v-if="field.type === 'date'">
                    <q-input
                      dark
                      dense
                      outlined
                      clearable
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
                  <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
                </div>

                <div class="col-12 q-pa-md">
                  <q-input
                    v-model="fields.description.data"
                    outlined
                    dark
                    dense
                    type="textarea"
                    label="Descripción"
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
