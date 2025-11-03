<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useDocumentFields } from 'src/utils/composables/useDocumentFields.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import LocaleEs from 'src/utils/composables/localeEs.js'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { createField, createToggle, validationRules } = useFields()
const { getDocumentMask, getDocumentPlaceholder, getDocumentValidation } = useDocumentFields()
const props = defineProps({
  client: Number,
  visible: Boolean,
  documentID: Number,
})
const isVisible = ref(props.visible)
const loading = ref(false)
const title = ref('')
const url = '/api/v1/clients/documents/'
const documents = ref([])
const locale = LocaleEs
const isLoadingData = ref(false)

const numberRules = computed(() => {
  const baseRules = [validationRules.text_required()]
  const selectedType = fields.type.data

  if (selectedType) {
    const dynamicRules = getDocumentValidation(selectedType)
    return [...baseRules, ...dynamicRules]
  }
  return baseRules
})
const numberPlaceHolder = computed(() => {
  return getDocumentPlaceholder(fields.type.data)
})
const numberMask = computed(() => {
  return getDocumentMask(fields.type.data)
})
const fields = reactive({
  type: createField('Tipo de documento', 'select', [validationRules.select_required()]),
  number: createField('Número de documento', 'text', numberRules),
  expiration: createField('Fecha de vencimiento', 'date', [validationRules.text_required()]),
  status: createToggle('Estado'),
})
watch(
  () => fields.type.data,
  (newType) => {
    if (newType) fields.number.mask = getDocumentMask(newType)

    if (!isLoadingData.value) {
      fields.number.data = null
      fields.number.error = false
      fields.number['error-message'] = ''
    }
  },
)
const getDocumentData = () => {
  showLoading()
  loading.value = true
  isLoadingData.value = true

  let data = new FormData()
  data.append('clientID', props.client)
  data.append('documentID', props.documentID)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.document
      fields.type.data = itm.document_type_id
      fields.number.data = itm.number
      fields.expiration.data = itm.expiration_date
      fields.status.data = itm.status_id
      title.value = `Editar datos del ${itm?.document_type?.name} ${itm.number}`
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        hideLoading()
        loading.value = false
        isLoadingData.value = false
      }, 500)
    })
}
const sendData = async () => {
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let request = props.documentID > 0 ? `${url}${props.documentID}` : url
  let method = props.documentID > 0 ? 'PUT' : 'POST'
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
  if (props.documentID > 0) getDocumentData()
  title.value = 'Registrar documento'
  documents.value = await getSupportData('/api/v1/general/client/documents')
})
</script>

<template>
  <q-dialog
    v-model="isVisible"
    persistent
    transition-show="scale"
    transition-hide="fade-out"
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
                  :rules="field.rules"
                  :label="field.label"
                  :error="field.error"
                  :error-message="field['error-message']"
                  :placeholder="index === 'number' ? numberPlaceHolder : undefined"
                  :mask="index === 'number' ? numberMask : field.mask"
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
