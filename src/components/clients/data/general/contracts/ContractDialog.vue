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
import LocaleEs from 'src/utils/composables/localeEs.js'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { validationRules, createField, createToggle } = useFields()
const props = defineProps({
  client: Number,
  visible: Boolean,
  contractID: Number,
})
const isVisible = ref(props.visible)
const loading = ref(false)
const title = ref('')
const url = '/api/v1/clients/contracts/'
const locale = LocaleEs
const fields = reactive({
  start_contract: createField('Fecha de inicio de contrato', 'date', [
    validationRules.text_required,
  ]),
  end_contract: createField('Fecha de finalización de contrato', 'date', [
    validationRules.text_required,
  ]),
  installation_price: createField('Costo de instalación', 'text', [
    validationRules.text_required,
    validationRules.two_decimal,
  ]),
  contract_amount: createField('Total del contrato', 'text', [
    validationRules.text_required,
    validationRules.money_two_decimal,
  ]),
  contract_status: createField('Estado del contrato', 'select', [validationRules.select_required]),
  status: createToggle('Estado de registro'),
})
const contractStatus = ref([])
const getData = () => {
  showLoading()
  loading.value = true
  let data = new FormData()
  data.append('id', props.contractID)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let item = res.data.contract
      fields.start_contract.data = item.contract_date
      fields.end_contract.data = item.contract_end_date
      fields.installation_price.data = item.installation_price
      fields.contract_amount.data = item.contract_amount
      fields.contract_status.data = item.contract_status_id
      fields.status.data = item.status_id
      title.value = `Editar datos del contrato válido del ${item.contract_date} al ${item.contract_end_date}`
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
  let request = props.contractID > 0 ? `${url}${props.contractID}` : url
  let method = props.contractID > 0 ? 'PUT' : 'POST'
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
  if (props.contractID > 0) getData()
  title.value = 'Crear contrato'
  contractStatus.value = await getSupportData('/api/v1/general/contract/status')
})
</script>

<template>
  <q-dialog
    v-model="isVisible"
    persistent
    transition-show="jump-up"
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
                  :options="contractStatus"
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
