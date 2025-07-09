<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import localeEs from 'src/utils/composables/localeEs.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'

const loading = ref(false)
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const props = defineProps({
  client: Number,
})
const url = 'api/v1/clients/'
const fields = reactive({
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombres',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  surname: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Apellidos',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  gender: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Género',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  birthdate: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Fecha de Nacimiento',
    type: 'date',
    rules: [],
  },
  marital: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Estado Civil',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  branch: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Sucursal',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  type: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Tipo de Cliente',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  profession: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Profesión u Oficio',
    type: 'text',
    rules: [],
  },
  country: {
    data: null,
    error: false,
    'error-message': '',
    label: 'País',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  document: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Documento a emitir',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  entity: {
    data: false,
    error: false,
    'error-message': '',
    label: 'Persona jurídica',
    type: 'toggle',
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    label: 'Estado',
    type: 'toggle',
  },
  comments: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Observaciones',
    type: 'area',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
})
const external = reactive({
  gender: [],
  marital: [],
  branch: [],
  type: [],
  country: [],
  document: [],
})
const locale = localeEs
const getOptions = (key) => {
  return (
    {
      gender: external.gender,
      marital: external.marital,
      branch: external.branch,
      type: external.type,
      country: external.country,
      document: external.document,
    }[key] || []
  )
}
const emit = defineEmits(['loadDrawer', 'updateTitle'])
const getData = () => {
  showLoading()
  loading.value = true
  let data = new FormData()
  data.append('id', props.client)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.client
      fields.name.data = itm.name
      fields.surname.data = itm.surname
      fields.gender.data = itm.gender_id
      fields.birthdate.data = itm.birthdate
      fields.marital.data = itm.marital_status_id
      fields.branch.data = itm.branch_id
      fields.type.data = itm.client_type_id
      fields.profession.data = itm.profession
      fields.country.data = itm.country_id
      fields.document.data = itm.document_type_id
      fields.entity.data = itm.legal_entity
      fields.comments.data = itm.comments
      fields.status.data = itm.status_id
      sendTitle(`${itm.name} ${itm.surname}`)
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 500)
    })
}
const sendTitle = (name) => {
  emit('updateTitle', name)
}
const sendData = () => {
  let request = ''
  let status = fields.status.data ? 1 : 0
  let entity = fields.entity.data ? 1 : 0
  let params = new FormData()
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  params.append('name', fields.name.data)
  params.append('surname', fields.surname.data)
  params.append('gender', fields.gender.data)
  params.append('birthdate', fields.birthdate.data)
  params.append('marital', fields.marital.data)
  params.append('branch', fields.branch.data)
  params.append('type', fields.type.data)
  params.append('profession', fields.profession.data)
  params.append('country', fields.country.data)
  params.append('document', fields.document.data)
  params.append('entity', entity)
  params.append('status', status)
  params.append('comment', fields.comments.data)
  props.client > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  props.client > 0 ? (request = `${url}${props.client}`) : (request = url)

  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        let itm = res.data.client
        emit('loadDrawer', itm.id)
        sendTitle(`${itm.name} ${itm.surname}`)
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
  if (props.client > 0) getData()
  external.gender = await getSupportData('/api/v1/general/genders')
  external.marital = await getSupportData('/api/v1/general/marital')
  external.branch = await getSupportData('/api/v1/general/branches')
  external.type = await getSupportData('/api/v1/general/client/types')
  external.country = await getSupportData('/api/v1/general/countries')
  external.document = await getSupportData('/api/v1/general/billing/documents')
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
        <q-breadcrumbs-el label="Datos Personales" icon="contacts" />
      </q-breadcrumbs>

      <q-separator dark class="q-my-md" />

      <q-form greedy @submit="sendData">
        <div class="col-12 fit row">
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
                :options="getOptions(index)"
                :option-value="(opt) => opt.id"
                :option-label="(opt) => opt.name"
              />
            </div>

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

            <q-skeleton v-if="loading" class="q-my-xs" dark animation="fade" type="QInput" />
          </div>

          <div class="col-12">
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

        <div class="full-width row wrap justify-end">
          <q-btn
            icon="save"
            :loading="loading"
            :label="props.client === 0 ? 'almacenar' : 'Actualizar datos'"
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
