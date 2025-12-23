<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'
import LocaleEs from 'src/utils/composables/localeEs.js'

const props = defineProps({
  node: Number,
  visible: Boolean,
  contactID: Number,
})
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const isVisible = ref(props.visible)
const loading = ref(false)
const title = ref('')
const url = '/api/v1/infrastructure/network/nodes/contacts/'
const locale = LocaleEs
const fields = reactive({
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  phone: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Número de teléfono',
    type: 'text',
    rules: [
      (val) => (val !== null && val !== '') || 'Campo requerido',
      (val) => /^[267]\d{3}-\d{4}$/.test(val) || 'Formato incorrecto',
    ],
    mask: '####-####',
  },
  initialD: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Fecha de inicio del contrato',
    type: 'date',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  finalD: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Fecha de finalización del contrato',
    type: 'date',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    label: 'Estado',
    type: 'toggle',
  },
})
const getData = () => {
  showLoading()
  loading.value = true
  let data = new FormData()
  data.append('id', props.contactID)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let item = res.data.contact
      fields.name.data = item.name
      fields.phone.data = item.phone_number
      fields.initialD.data = item.initial_contract_date
      fields.finalD.data = item.final_contract_date
      fields.status.data = item.status_id
      title.value = `Editar datos del contacto: ${item.name}`
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
  params.append('node', props.node)
  params.append('name', fields.name.data)
  params.append('phone', fields.phone.data)
  params.append('initial_date', fields.initialD.data)
  params.append('final_date', fields.finalD.data)
  params.append('status', status)
  props.contactID > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  let request = props.contactID > 0 ? `${url}${props.contactID}` : url
  api
    .post(request, params)
    .then((res) => {
      isVisible.value = false
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        title.value = `Editar datos del contacto: ${res.data.contact?.name}`
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
onMounted(() => {
  if (props.contactID > 0) getData()
  title.value = 'Agregar Contacto'
})
</script>

<template>
  <q-dialog
    v-model="isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat style="width: 700px; max-width: 80vh" class="custom-cards">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form greedy @submit="sendData">
          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-md"
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
                  :mask="field.mask"
                  :rules="field.rules"
                  :label="field.label"
                  :error="field.error"
                  :error-message="field['error-message']"
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
          </div>

          <div class="row content-end justify-end">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn flat label="Almacenar" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
