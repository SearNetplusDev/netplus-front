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
import { useInvoiceOrdering } from 'src/utils/composables/billing/useInvoiceOrdering.js'
import { useInvoiceStatusHelper } from 'src/utils/composables/billing/useInvoiceStatusHelper.js'
import { useInvoiceSelectionRules } from 'src/utils/composables/billing/useInvoiceSelectionRules.js'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { validationRules, createField } = useFields()
const props = defineProps({
  client: { type: Number, required: true },
})
const states = reactive({
  loading: false,
  title: `Ingresar pago a ${props.name}`,
})
const fields = reactive({
  invoices: createField('Facturas', 'multi-select', [validationRules.select_required]),
  discount: createField('Descuento', 'select', []),
  amount: createField(
    'Total a pagar',
    'text',
    [validationRules.text_required, validationRules.money_two_decimal],
    true,
  ),
  payment_method: createField('Método de pago', 'select', [validationRules.select_required]),
  cash: createField('Efectivo', 'text', [
    validationRules.text_required,
    validationRules.money_two_decimal,
  ]),
  change: createField('Cambio', 'text', [], true),
  comments: createField('Observaciones', 'textarea', []),
})
const external = reactive({
  invoices: [],
  discounts: [],
  methods: [],
})
const { normalFields, textAreaFields } = useFieldFilters(fields)
const optionsMap = {
  payment_method: 'methods',
  discount: 'discounts',
}
const get_options = (key) => external[optionsMap[key]] || []
const { sortInvoicesByPriority } = useInvoiceOrdering()
const status = useInvoiceStatusHelper(external, fields)
const { isInvoiceDisabled, normalizeSelection } = useInvoiceSelectionRules({
  ...status,
  external,
  fields,
})
const get_initial_data = async () => {
  const [invoices, discounts, methods] = await Promise.all([
    getSupportData(`/api/v1/billing/invoices/client/${props.client}`),
    getSupportData('/api/v1/general/billing/discounts/list'),
    getSupportData('/api/v1/general/billing/payment-methods'),
  ])
  external.invoices = sortInvoicesByPriority(invoices)
  external.discounts = discounts
  external.methods = methods
}
const emit = defineEmits(['hide'])
const send_data = async () => {
  states.loading = true
  showLoading()
  resetFieldErrors(fields)
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
const calculate_total = () => {
  let total = 0
  if (fields.invoices.data && fields.invoices.data.length > 0) {
    total = fields.invoices.data.reduce((sum, invoice_id) => {
      const invoice = external.invoices.find((inv) => inv.id === invoice_id)
      return sum + (invoice ? parseFloat(invoice.total) : 0)
    }, 0)
  }

  if (fields.discount.data) {
    const discount = external.discounts.find((disc) => disc.id === fields.discount.data)
    if (discount) total -= parseFloat(discount.amount)
  }

  total = Math.max(0, total)
  fields.amount.data = total.toFixed(2)
}
const calculate_change = () => {
  const cash = parseFloat(fields.cash.data || 0)
  const total = parseFloat(fields.amount.data || 0)
  let change = cash - total
  change = change < 0 ? 0 : change
  fields.change.data = change.toFixed(2)
}
watch(
  () => fields.invoices.data,
  (newVal, oldVal) => {
    fields.invoices.data = normalizeSelection(newVal, oldVal)
    calculate_total()
  },
  { deep: true },
)
watch(
  () => fields.invoices.data,
  () => calculate_total(),
)
watch(
  () => fields.discount.data,
  () => calculate_total(),
)
watch(
  () => [fields.cash.data, fields.amount.data],
  () => calculate_change(),
  { deep: true },
)
onMounted(async () => {
  await get_initial_data()
})
</script>

<template>
  <div class="row wrap full-width">
    <template v-if="external.invoices.length > 0">
      <q-form greedy @submit="send_data" class="full-width">
        <div class="row content-start items-start q-pa-sm">
          <div
            class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
            v-for="(field, index) in normalFields"
            :key="index"
          >
            <template v-if="field.type === 'multi-select'">
              <q-select
                v-model="field.data"
                dark
                dense
                outlined
                color="white"
                clearable
                emit-value
                map-options
                transition-show="flip-up"
                transition-hide="flip-down"
                lazy-rules
                multiple
                use-chips
                stack-label
                v-if="!states.loading"
                :label="field.label"
                :rules="field.rules"
                :error="field.error"
                :error-message="field['error-message']"
                :options="external.invoices"
                :option-value="(opt) => opt.id"
                :option-label="(opt) => opt.name"
                :option-disable="isInvoiceDisabled"
              />
            </template>

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
            <q-skeleton v-if="states.loading" class="q-my-xs" dark animation="fade" type="QInput" />
          </div>

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

            <q-skeleton v-if="states.loading" class="q-my-xs" dark animation="fade" type="QInput" />
          </div>

          <div class="row fit content-end justify-end">
            <q-btn
              color="white"
              icon="save"
              flat
              :ripple="{ center: true, color: 'amber' }"
              label="Almacenar"
              align="around"
              type="submit"
            />
          </div>
        </div>
      </q-form>
    </template>

    <template v-else>
      <div class="text-center q-pa-sm full-width">
        <q-icon name="mdi-file-document-alert-outline" size="48px" color="grey-6" />
        <div class="text-grey-6 q-mt-sm">Sin facturas disponibles</div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
