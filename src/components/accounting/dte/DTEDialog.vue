<script setup>
import { onMounted, reactive, watch } from 'vue'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useNotifications } from 'src/utils/notification.js'
import { api } from 'src/utils/api.js'
import { useDTEForm } from 'src/utils/composables/accounting/dte/useDTEForm.js'
import { useDTEInvoices } from 'src/utils/composables/accounting/dte/useDTEInvoices.js'
import { useDTERelatedDocs } from 'src/utils/composables/accounting/dte/useDTERelatedDocs.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import DTEHeaderFields from 'components/accounting/dte/composables/DTEHeaderFields.vue'
import DTERelatedDocs from 'components/accounting/dte/composables/DTERelatedDocs.vue'
import DTEEmissionMode from 'components/accounting/dte/composables/DTEEmissionMode.vue'
import DTEInvoiceList from 'components/accounting/dte/composables/DTEInvoiceList.vue'
import DTEDocumentBody from 'components/accounting/dte/composables/DTEDocumentBody.vue'

const { showNotification } = useNotifications()

const states = reactive({
  title: 'Emitir Documento Tributario Electrónico',
  loading: false,
})

const {
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
} = useDTEForm()

const {
  invoiceOptions,
  selectedInvoices,
  loadingInvoices,
  loadClientInvoices,
  toggleInvoice,
  isInvoiceSelected,
  reset: resetInvoices,
} = useDTEInvoices()

const {
  relatedDocuments,
  relatedDocumentOptions,
  searchRelatedDocuments,
  removeRelatedDocument,
  reset: resetRelatedDocs,
} = useDTERelatedDocs()

const totals = computedTotals(selectedInvoices)

const initial_data = async () => {
  console.info('XD')
  states.loading = true
  try {
    const [types, paymentMethods] = await Promise.all([
      getSupportData('/api/v1/general/billing/documents'),
      getSupportData('/api/v1/general/billing/payment-methods'),
    ])
    fields.type.options = types
    fields.payment_method.options = paymentMethods
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      states.loading = false
    }, 150)
  }
}

const emitDocument = async () => {
  states.loading = true
  try {
    const payload = {
      type_id: fields.type.data,
      client_id: fields.client.data,
      items: showInvoices.value
        ? selectedInvoices.value.map((inv) => inv.id)
        : fields.documentBody.resolvePayload(),
      totals: {
        neto: totals.value.neto.toFixed(2),
        iva: totals.value.iva.toFixed(2),
        discount: totals.value.discountAmount.toFixed(2),
        total: totals.value.total.toFixed(2),
      },
      ...(requiresRelatedDocuments.value && {
        related_documents: relatedDocuments.resolvePayload(),
      }),
      ...(requiresPaymentConditions.value && {
        payment_condition: fields.payment_condition.data,
      }),
      ...(requiresPaymentMethod.value && {
        payment_method: fields.payment_method.data,
      }),
    }

    await api.post('/api/accounting/dte', payload)
    showNotification('Éxito', 'Documento emitido correctamente', 'blue-grey-10')
  } catch (err) {
    if (err.response?.status === 422) {
      const errors = err.response?.data?.errors || {}

      for (const [key, field] of Object.entries(fields)) {
        if ('error' in field && errors[key]) {
          field.error = true
          field['error-message'] = errors[key][0]
        }
      }

      fields.documentBody.data.forEach((_, i) => {
        fields.documentBody.columns.forEach((col) => {
          const errKey = `items.${i}.${col.key}`

          if (errors[errKey]) {
            fields.documentBody.data[i][`_error_${col.key}`] = errors[errKey][0]
          }
        })
      })
    } else {
      showNotification(
        'Error',
        err.response?.data?.message ?? err.message ?? 'Error inesperado',
        'red-10',
      )
    }
  } finally {
    setTimeout(() => {
      states.loading = false
    }, 150)
  }
}

//  Watch: cambio del tipo de DTE
watch(
  () => fields.type.data,
  () => {
    emissionType.value = null
    resetInvoices()
    resetRelatedDocs()
  },
)

//  Watch: cambio del tipo de emisión
watch(emissionType, (val) => {
  selectedInvoices.value = []
  if (val === 2) {
    loadClientInvoices(fields.client.data)
  } else {
    invoiceOptions.value = []
  }
})

//  Watch: cambio de cliente
watch(
  () => fields.client.data,
  () => {
    resetInvoices()
    resetRelatedDocs()
  },
)

onMounted(async () => {
  await initial_data()
})
</script>
<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="emitDocument">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ states.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="states.loading"
            label="Emitir"
            type="submit"
            color="white"
          >
            <template v-slot:loading>
              <q-spinner-gears class="on-left" />
            </template>
          </q-btn>
          <q-btn v-close-popup round dense icon="close" />
        </q-toolbar>
      </q-header>

      <footer-component />

      <q-page-container>
        <q-page class="q-pa-md bg-dark">
          <q-card dark flat class="custom-cards q-pa-sm">
            <DTEHeaderFields
              :fields="fields"
              :normal-fields="normalFields"
              :requires-payment-condition="requiresPaymentConditions"
              :requires-payment-method="requiresPaymentMethod"
              :loading="states.loading"
            />
            <q-separator dark class="q-mx-sm" />

            <template v-if="requiresRelatedDocuments">
              <DTERelatedDocs
                :related-documents="relatedDocuments"
                :related-document-options="relatedDocumentOptions"
                :search-related-document="searchRelatedDocuments"
                :remove-related-documents="removeRelatedDocument"
              />
              <q-separator dark class="q-mx-sm" />
            </template>

            <template v-if="isCreditoFiscal">
              <DTEEmissionMode v-model="emissionType" />
              <q-separator dark class="q-mx-sm" />
            </template>

            <template v-if="showInvoices">
              <DTEInvoiceList
                :invoice-options="invoiceOptions"
                :selected-invoices="selectedInvoices"
                :loading-invoices="loadingInvoices"
                :is-invoice-selected="isInvoiceSelected"
                :toggle-invoice="toggleInvoice"
              />
            </template>

            <template v-if="showManualBody">
              <DTEDocumentBody :dynamic-fields="dynamicFields" :loading="states.loading" />
            </template>

            <q-separator dark class="q-ma-sm" />

            <q-card-section class="row justify-end q-pa-sm q-gutter-md">
              <div class="text-white text-caption text-right">
                <div class="text-weight-bold q-mb-xs">Valor Neto</div>
                <div class="text-h6">$ {{ totals.neto.toFixed(2) }}</div>
              </div>

              <q-separator dark vertical />

              <div class="text-white text-caption text-right">
                <div class="text-weight-bold q-mb-xs">IVA (13%)</div>
                <div class="text-h6">$ {{ totals.iva.toFixed(2) }}</div>
              </div>

              <q-separator dark vertical />

              <div class="text-white text-caption text-right">
                <div class="text-weight-bold q-mb-xs">Descuento</div>
                <div class="text-h6">$ {{ totals.discountAmount.toFixed(2) }}</div>
              </div>

              <q-separator dark vertical />

              <div class="text-white text-caption text-right">
                <div class="text-weight-bold q-mb-xs">Total</div>
                <div class="text-h6">$ {{ totals.total.toFixed(2) }}</div>
              </div>
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>
<style lang="sass" scoped></style>
