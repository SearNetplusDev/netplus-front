<script setup>
import { reactive, onMounted, watch } from 'vue'
import { api } from 'src/utils/api.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { validationRules, createField } = useFields()
const props = defineProps({
  visible: { type: Boolean, required: true },
  client: { type: Number, required: true },
})
const states = reactive({
  is_visible: props.visible,
  loading: false,
  title: 'Ingresar pago',
})
const fields = reactive({
  service: createField('Servicio', 'select', [validationRules.select_required]),
  invoice: createField('Factura', 'select', [validationRules.select_required]),
  amount: createField(
    'Cantidad',
    'text',
    [validationRules.text_required, validationRules.money_two_decimal],
    true,
    '##.##',
  ),
  payment_method: createField('Método de pago', 'select', [validationRules.select_required]),
  comments: createField('Observaciones', 'textarea'),
})
const external = reactive({
  services: [],
  invoices: [],
  methods: [],
})
const { normalFields, textAreaFields } = useFieldFilters(fields)
const optionsMap = {
  service: 'services',
  invoice: 'invoices',
  payment_method: 'methods',
}
const get_options = (key) => external[optionsMap[key]] || []
const onselect_change = (name, val) => {
  const actions = {
    service: () => {
      if (val) {
        fetchInvoices(val)
      } else {
        external.invoices = []
        fields.invoice.data = null
      }
      fields.amount.data = null
    },
    invoice: () => {
      const selected = external.invoices.find((inv) => inv.id === val)
      fields.amount.data = selected?.total || null
    },
  }
  actions[name]?.()
}
const fetchServices = async () => {
  const data = await getSupportData(`api/v1/services/client/${props.client}`)
  if (data) external.services = data
}

const fetchInvoices = async (service_id) => {
  try {
    showLoading()
    external.invoices = []
    fields.invoice.data = null
    const data = await getSupportData(`api/v1/billing/invoices/service/${service_id}`)
    if (data) external.invoices = data
  } finally {
    setTimeout(() => {
      hideLoading()
    }, 150)
  }
}
const fetchPaymentMethods = async () => {
  const data = await getSupportData(`api/v1/general/billing/payment-methods`)
  if (data) external.methods = data
}
const loadInitialData = () => {
  states.loading = true
  Promise.all([fetchServices(), fetchPaymentMethods()]).finally(() => (states.loading = false))
}
const emit = defineEmits(['hide'])
const send_data = async () => {
  states.loading = true
  showLoading()
  resetFieldErrors(fields)
  // let uri = ``
  let request = `api/v1/billing/payments`
  let method = 'POST'
  let params = buildFormData(fields, { _method: method, client: props.client })
  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Éxito', 'Pago registrado correctamente', 'blue-grey-10')
      emit('hide')
    } else {
      showNotification('Error', 'Algo ha salido mal.', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      states.loading = false
      hideLoading()
    }, 150)
  }
}
watch(
  () => props.visible,
  (newVal) => {
    states.is_visible = newVal
    if (newVal) loadInitialData()
  },
)
onMounted(() => {
  if (props.visible) loadInitialData()
})
</script>

<template>
  <q-dialog
    v-model="states.is_visible"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(4px) saturate(150%)"
    @hide="emit('hide')"
  >
    <q-card dark flat style="width: 700px; max-width: 80vw" class="custom-cards">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ states.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form greedy @submit="send_data">
          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-sm"
              v-for="(field, index) in normalFields"
              :key="index"
            >
              <template v-if="field.type === 'select'">
                <q-select
                  v-model="field.data"
                  dark
                  dense
                  outlined
                  clearable
                  color="white"
                  emit-value
                  map-options
                  transition-show="flip-up"
                  transition-hide="flip-down"
                  lazy-rules
                  v-if="!states.loading"
                  :label="field.label"
                  :rules="field.rules"
                  :error="field.error"
                  :error-message="field['error-message']"
                  :options="get_options(index)"
                  :option-value="(opt) => opt.id"
                  :option-label="(opt) => opt.name"
                  @update:model-value="onselect_change(index, $event)"
                />
              </template>

              <template v-if="field.type === 'text'">
                <q-input
                  v-model="field.data"
                  dark
                  dense
                  outlined
                  clearable
                  lazy-rules
                  v-if="!states.loading"
                  :label="field.label"
                  :rules="field.rules"
                  :error="field.error"
                  :error-message="field['error-message']"
                  :disable="field.disabled"
                  :mask="field.mask"
                />
              </template>
              <q-skeleton
                v-if="states.loading"
                class="q-my-xs"
                dark
                animation="fade"
                type="QInput"
              />
            </div>
          </div>

          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm"
              v-for="(field, index) in textAreaFields"
              :key="index"
            >
              <template v-if="field.type === 'textarea'">
                <q-input
                  v-model="field.data"
                  outlined
                  dark
                  dense
                  type="textarea"
                  :label="field.label"
                  :error="field.error"
                  :error-message="field['error-message']"
                  v-if="!states.loading"
                />
              </template>

              <q-skeleton
                v-if="states.loading"
                class="q-my-xs"
                dark
                animation="fade"
                type="QInput"
              />
            </div>
          </div>

          <div class="row content-end justify-end">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn flat label="Ingresar pago" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
