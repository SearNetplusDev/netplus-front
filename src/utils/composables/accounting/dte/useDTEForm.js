import { computed, reactive, ref } from 'vue'
import { useFields } from 'src/utils/composables/useFields.js'
import { useNotifications } from 'src/utils/notification.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import { api } from 'src/utils/api.js'

const RELATED_DOCS_REQUIRED = [3, 4, 5, 6, 8]
const PAYMENT_CONDITION_REQUIRED = [1, 2, 4, 5, 7, 9, 10]
const PAYMENT_METHOD_REQUIRED = [1, 2, 9, 10, 11]
export const FISCAL_CREDIT_ID = 2

const paymentConditionOptions = [
  { id: 1, name: 'Contado' },
  { id: 2, name: 'Crédito' },
  { id: 3, name: 'Otro' },
]

export function useDTEForm() {
  const { showNotification } = useNotifications()
  const { createField, createDynamicList, validationRules } = useFields()
  const searchClient = async (val, update) => {
    if (!val || val.length < 4) {
      update(() => (fields.client.options = []))
      return
    }

    update(async () => {
      try {
        const { data } = await api.post('/api/v1/clients/search', { client: val, _method: 'POST' })
        fields.client.options = data.clients || []
      } catch (err) {
        showNotification(
          'Error',
          err.response?.data?.message ?? err.message ?? 'Error inesperado',
          'red-10',
        )
      }
    })
  }

  const fields = reactive({
    type: createField('Tipo DTE', 'select', [validationRules.text_required], false, '', {
      options: [],
      optionValue: (option) => option.id,
      optionLabel: (option) => option.name,
    }),
    client: createField('Cliente', 'select-filter', [validationRules.text_required], false, '', {
      options: [],
      optionValue: (option) => option.id,
      optionLabel: (option) => option.name,
      filter: searchClient,
    }),
    discount: createField('Descuento', 'text', [validationRules.money_two_decimal]),
    payment_condition: createField(
      'Condición de operación',
      'select',
      [validationRules.select_required],
      false,
      '',
      {
        options: paymentConditionOptions,
        optionValue: (option) => option.id,
        optionLabel: (option) => option.name,
      },
    ),
    payment_method: createField(
      'Método de pago',
      'select',
      [validationRules.text_required],
      false,
      '',
      {
        options: [],
        optionValue: (option) => option.id,
        optionLabel: (option) => option.name,
      },
    ),
    documentBody: createDynamicList('Datos', [
      {
        key: 'description',
        label: 'Descripción',
        type: 'text',
        colClass: 'col-4',
        rules: [validationRules.text_required],
      },
      {
        key: 'unit_price',
        label: 'Precio unitario',
        type: 'text',
        colClass: 'col',
        rules: [validationRules.text_required, validationRules.money_two_decimal],
      },
      {
        key: 'quantity',
        label: 'Cantidad',
        type: 'text',
        colClass: 'col',
        rules: [validationRules.text_required],
      },
      {
        key: 'neto',
        label: 'Valor neto',
        type: 'computed',
        colClass: 'col',
        computed: (row) => {
          const price = parseFloat(row.unit_price) || 0
          const qty = parseFloat(row.quantity) || 0
          return ((price * qty) / 1.13).toFixed(2)
        },
      },
      {
        key: 'iva',
        label: 'I.V.A.',
        type: 'computed',
        colClass: 'col',
        computed: (row) => {
          const price = parseFloat(row.unit_price) || 0
          const qty = parseFloat(row.quantity) || 0
          const total = price * qty
          const iva = (total / 1.13) * 0.13
          return iva.toFixed(2)
        },
      },
      {
        key: 'total',
        label: 'Total',
        type: 'computed',
        colClass: 'col',
        computed: (row) => {
          const price = parseFloat(row.unit_price) || 0
          const qty = parseFloat(row.quantity) || 0
          return (price * qty).toFixed(2)
        },
      },
    ]),
  })
  const { normalFields, dynamicFields } = useFieldFilters(fields)
  const emissionType = ref(null)
  const requiresRelatedDocuments = computed(() => RELATED_DOCS_REQUIRED.includes(fields.type.data))
  const requiresPaymentConditions = computed(() =>
    PAYMENT_CONDITION_REQUIRED.includes(fields.type.data),
  )
  const requiresPaymentMethod = computed(() => PAYMENT_METHOD_REQUIRED.includes(fields.type.data))
  const isCreditoFiscal = computed(() => fields.type.data === FISCAL_CREDIT_ID)
  const showManualBody = computed(() => !isCreditoFiscal.value || emissionType.value === 1)
  const showInvoices = computed(() => isCreditoFiscal.value && emissionType.value === 2)
  const computedTotals = (selectedInvoices) =>
    computed(() => {
      let subtotals = { neto: 0, iva: 0, total: 0 }

      if (showInvoices.value) {
        subtotals = selectedInvoices.value.reduce(
          (acc, invoice) => {
            acc.neto += parseFloat(invoice.subtotal) || 0
            acc.iva += parseFloat(invoice.iva) || 0
            acc.total += parseFloat(invoice.total_amount) || 0
            return acc
          },
          { neto: 0, iva: 0, total: 0 },
        )
      } else {
        const rows = fields.documentBody.data
        const columns = fields.documentBody.columns
        const netoCol = columns.find((c) => c.key === 'neto')
        const ivaCol = columns.find((c) => c.key === 'iva')
        const totalCol = columns.find((c) => c.key === 'total')

        subtotals = rows.reduce(
          (acc, row) => {
            acc.neto += parseFloat(netoCol?.computed(row) ?? 0)
            acc.iva += parseFloat(ivaCol?.computed(row) ?? 0)
            acc.total += parseFloat(totalCol?.computed(row) ?? 0)
            return acc
          },
          { neto: 0, iva: 0, total: 0 },
        )
      }

      const discountAmount = parseFloat(fields.discount.data) || 0
      const factor = subtotals.total > 0 ? (subtotals.total - discountAmount) / subtotals.total : 1
      return {
        neto: subtotals.neto * factor,
        iva: subtotals.iva * factor,
        total: subtotals.total - discountAmount,
        discountAmount,
      }
    })

  return {
    fields,
    normalFields,
    dynamicFields,
    emissionType,
    requiresRelatedDocuments,
    requiresPaymentConditions,
    requiresPaymentMethod,
    isCreditoFiscal,
    showManualBody,
    showInvoices,
    computedTotals,
  }
}
