<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'

const props = defineProps({
  client: Number,
  visible: Boolean,
  emailID: Number,
})
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const isVisible = ref(props.visible)
const loading = ref(false)
const title = ref('')
const url = '/api/v1/clients/emails/'
const fields = reactive({
  email: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Correo electrónico',
    type: 'text',
    rules: [
      (val) => (val !== null && val !== '') || 'Campo requerido',
      (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) || 'Formato incorrecto',
    ],
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
  data.append('id', props.emailID)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let item = res.data.email
      fields.email.data = item.email
      fields.status.data = item.status_id
      title.value = `Editar correo electrónico ${item.email}`
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
  params.append('client', props.client)
  params.append('email', fields.email.data)
  params.append('status', status)
  props.emailID > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  let request = props.emailID > 0 ? `${url}${props.emailID}` : url
  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
        isVisible.value = false
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
  if (props.emailID > 0) getData()
  title.value = 'Registrar correo'
})
</script>

<template>
  <q-dialog
    v-model="isVisible"
    persistent
    transition-show="flip-up"
    transition-hide="jump-down"
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
