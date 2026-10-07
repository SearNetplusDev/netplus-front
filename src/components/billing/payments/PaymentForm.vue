<script setup>
import { reactive, computed, onMounted, watch } from 'vue'
import { api } from 'src/utils/api.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
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

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const CASH_METHOD_ID = 1
const CASH_ONLY_FIELDS = ['cash', 'change']
const MONEY_INPUT_FIELDS = ['cash']
const uri = 'api/v1/billing/payments'

// ---------------------------------------------------------------------------
// Props / emits / composables
// ---------------------------------------------------------------------------
const props = defineProps({
  client: { type: Number, required: true },
  visible: { type: Boolean, required: true },
})
const emit = defineEmits(['hide'])

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { validationRules, createField } = useFields()
const { sortInvoicesByPriority } = useInvoiceOrdering()
const ui_states = reactive({
  is_visible: props.visible,
  loading: false,
  title: 'Ingresar pago',
})

// ---------------------------------------------------------------------------
// Helpers de dinero
// ---------------------------------------------------------------------------
const toNumber = (val) => {
  const num = parseFloat(val)
  return Number.isFinite(num) ? num : 0
}
const formatMoney = (val) => {
  if (val === null || val === undefined || val === '') return val
  const num = Number(String(val).replace(/[,\s$]/g, ''))
  return Number.isFinite(num) && num >= 0 ? num.toFixed(2) : val
}

// ---------------------------------------------------------------------------
// Campos
// ---------------------------------------------------------------------------
const cashRules = [
  validationRules.text_required,
  (val) => /^\d{1,4}(\.\d{1,2})?$/.test(String(val ?? '').trim()) || 'Formato inválido',
  (val) =>
    toNumber(val) >= toNumber(fields.amount.data) || 'El efectivo no puede ser menor al total',
]
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
  cash: createField('Efectivo', 'text', cashRules),
  change: createField('Cambio', 'text', [], true),
  comments: createField('Observaciones', 'textarea', []),
})
const external = reactive({
  invoices: [],
  discounts: [],
  methods: [],
})
const optionsMap = {
  payment_method: 'methods',
  discount: 'discounts',
}
const get_options = (key) => external[optionsMap[key]] || []
const { normalFields, textAreaFields } = useFieldFilters(fields)
const isCash = computed(() => fields.payment_method.data === CASH_METHOD_ID)
const visibleFields = computed(() =>
  Object.fromEntries(
    Object.entries(normalFields.value).filter(
      ([key]) => isCash.value || !CASH_ONLY_FIELDS.includes(key),
    ),
  ),
)
const status = useInvoiceStatusHelper(external, fields)
const { isInvoiceDisabled, normalizeSelection } = useInvoiceSelectionRules({
  ...status,
  external,
  fields,
})
const onFieldBlur = (key) => {
  if (MONEY_INPUT_FIELDS.includes(key)) {
    fields[key].data = formatMoney(fields[key].data)
  }
}

// ---------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------
const load_invoices = async () => {
  const invoices = await getSupportData(`/api/v1/billing/invoices/client/${props.client}`)
  external.invoices = sortInvoicesByPriority(invoices)
}
const get_initial_data = async () => {
  const [, discounts, methods] = await Promise.all([
    load_invoices(),
    getSupportData('/api/v1/general/billing/discounts/list'),
    getSupportData('/api/v1/general/billing/payment-methods'),
  ])
  external.discounts = discounts
  external.methods = methods
}
const clear_data = async () => {
  Object.values(fields).forEach((field) => {
    field.data = null
    if ('error' in field) field.error = false
  })
  await load_invoices()
}
const send_data = async () => {
  ui_states.loading = true
  showLoading()
  resetFieldErrors(fields)
  if (isCash.value) fields.cash.data = formatMoney(fields.cash.data)
  const params = buildFormData(fields, { _method: 'POST', client: props.client })

  try {
    const { data } = await api.post(uri, params)
    if (data.saved) {
      showNotification('Éxito', 'Pago registrado correctamente', 'blue-grey-10')
      await clear_data()
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
      ui_states.loading = false
      hideLoading()
    }, 150)
  }
}

// ---------------------------------------------------------------------------
// Cálculos
// ---------------------------------------------------------------------------
const calculate_total = () => {
  const selected = fields.invoices.data ?? []
  let total = selected.reduce((sum, invoice_id) => {
    const invoice = external.invoices.find((inv) => inv.id === invoice_id)
    return sum + (invoice ? toNumber(invoice.total) : 0)
  }, 0)

  if (fields.discount.data) {
    const discount = external.discounts.find((disc) => disc.id === fields.discount.data)
    if (discount) total -= toNumber(discount.amount)
  }

  fields.amount.data = Math.max(0, total).toFixed(2)
}
const calculate_change = () => {
  const change = Math.max(0, toNumber(fields.cash.data) - toNumber(fields.amount.data))
  fields.change.data = change.toFixed(2)
}

// ---------------------------------------------------------------------------
// Watchers
// ---------------------------------------------------------------------------
watch(
  () => fields.invoices.data,
  (newVal, oldVal) => {
    const normalized = normalizeSelection(newVal, oldVal)
    if (normalized !== newVal) fields.invoices.data = normalized
    calculate_total()
  },
  { deep: true },
)
watch(() => fields.discount.data, calculate_total)
watch(() => [fields.cash.data, fields.amount.data], calculate_change)
watch(isCash, (cash) => {
  if (cash) return
  fields.cash.data = null
  fields.cash.error = false
  fields.change.data = null
})
onMounted(get_initial_data)
</script>

<template>
  <q-dialog
    v-model="ui_states.is_visible"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(4px) saturate(150%)"
    @hide="emit('hide')"
  >
    <q-card
      dark
      flat
      class="custom-cards"
      style="width: 50vw !important; max-width: 50vw !important"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ ui_states.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row wrap full-width">
          <template v-if="external.invoices.length > 0">
            <q-form greedy @submit="send_data" class="full-width">
              <div class="row content-start items-start q-pa-sm">
                <div
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-6 q-pa-sm"
                  v-for="(field, index) in visibleFields"
                  :key="index"
                >
                  <q-skeleton
                    v-if="ui_states.loading"
                    class="q-my-xs"
                    dark
                    animation="fade"
                    type="QInput"
                  />

                  <template v-else>
                    <q-select
                      v-if="field.type === 'multi-select'"
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
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="external.invoices"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      :option-disable="isInvoiceDisabled"
                    />

                    <q-select
                      v-else-if="field.type === 'select'"
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
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="get_options(index)"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                    />

                    <q-input
                      v-else-if="field.type === 'text'"
                      v-model="field.data"
                      dark
                      dense
                      outlined
                      clearable
                      lazy-rules
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :disable="field.disabled"
                      :mask="field.mask"
                      @blur="onFieldBlur(index)"
                    />
                  </template>
                </div>

                <div
                  class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm"
                  v-for="(field, index) in textAreaFields"
                  :key="index"
                >
                  <q-skeleton
                    v-if="ui_states.loading"
                    class="q-my-xs"
                    dark
                    animation="fade"
                    type="QInput"
                  />

                  <q-input
                    v-else
                    v-model="field.data"
                    outlined
                    dark
                    dense
                    type="textarea"
                    :label="field.label"
                    :error="field.error"
                    :error-message="field['error-message']"
                  />
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
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
