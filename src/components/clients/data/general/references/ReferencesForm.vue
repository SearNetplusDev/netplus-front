<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useFields } from 'src/utils/composables/useFields.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { createField, createToggle, validationRules } = useFields()
const props = defineProps({
  client: Number,
  visible: Boolean,
  referenceID: Number,
})
const isVisible = ref(props.visible)
const loading = ref(false)
const title = ref('')
const url = '/api/v1/clients/references/'
const fields = reactive({
  name: createField('Nombre completo', 'text', [
    validationRules.text_required,
    validationRules.only_letters,
  ]),
  dui: createField(
    'DUI',
    'text',
    [validationRules.text_required, validationRules.dui],
    false,
    '########-#',
  ),
  mobile: createField(
    'Número de teléfono',
    'text',
    [validationRules.text_required, validationRules.national_phone],
    false,
    '####-####',
  ),
  kinship: createField('Parentesco', 'select', [validationRules.select_required]),
  status: createToggle('Estado'),
})
const relationships = ref([])
const getData = () => {
  showLoading()
  loading.value = true
  let data = new FormData()
  data.append('id', props.referenceID)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.reference
      fields.name.data = itm.name
      fields.dui.data = itm.dui
      fields.mobile.data = itm.mobile
      fields.kinship.data = itm.kinship_id
      fields.status.data = itm.status_id
      title.value = `Editar datos de referencia: ${itm?.name}`
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
const sendData = async () => {
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let request = props.referenceID > 0 ? `${url}${props.referenceID}` : url
  let method = props.referenceID > 0 ? 'PUT' : 'POST'
  let params = buildFormData(fields, { _method: method })
  params.append('client', props.client)

  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
      isVisible.value = false
    } else {
      showNotification('Error', 'Verifica la información ingresada', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification('Error', err.response?.data?.message || 'Error al guardar', 'red-10')
  } finally {
    setTimeout(() => {
      loading.value = false
      hideLoading()
    }, 150)
  }
}
onMounted(async () => {
  if (props.referenceID > 0) getData()
  title.value = 'Registrar referencia'
  relationships.value = await getSupportData('/api/v1/general/client/references')
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
              <!--    Inputs    -->
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
                  :options="relationships"
                  :option-value="(opt) => opt.id"
                  :option-label="(opt) => opt.name"
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
<style lang="sass" scoped></style>
