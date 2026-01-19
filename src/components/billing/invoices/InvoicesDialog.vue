<script setup>
import { reactive, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import PDFDialog from 'components/base/widgets/PDFDialog.vue'
import ExtensionDialog from 'components/billing/invoices/extensions/ExtensionDialog.vue'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { copy } = useClipboard()
const { formatLongDate } = useDateFormatter()
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})
const url = 'api/v1/billing/invoices/'
const uiStates = reactive({
  loading: false,
  title: 'Facturas de ',
  visiblePDF: false,
  visibleDialog: false,
  currentInvoice: 0,
  pdfUri: '',
})
const columns = [
  { name: 'id', label: 'ID', align: 'left' },
  { name: 'status', label: 'Estado', align: 'left' },
  { name: 'period', label: 'Período facturado', align: 'left' },
  { name: 'subtotal', label: 'Subtotal', align: 'left' },
  { name: 'tax', label: 'I.V.A.', align: 'left' },
  { name: 'detained_tax', label: 'I.V.A. Retenido', align: 'left' },
  { name: 'total', label: 'Total', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const paymentsColumns = [
  { name: 'payment_id', label: 'ID pago', align: 'left', field: 'id' },
  { name: 'payment_date', label: 'Fecha de pago', align: 'left', field: 'payment_date' },
  { name: 'payment_method', label: 'Método de pago', align: 'left' },
  { name: 'amount', label: 'Monto Pagado', align: 'left', field: 'id' },
  { name: 'discount', label: 'Descuento', align: 'left', field: 'discount' },
  { name: 'discount_name', label: 'Descripción descuento', align: 'left' },
]
const data = reactive({
  invoices: [],
})
const moneyFormat = (amount) => {
  return parseFloat(amount).toFixed(2)
}
const getData = async () => {
  uiStates.loading = true
  uiStates.title = 'Obteniendo datos, espera un momento ...'
  showLoading()

  try {
    const {
      data: { invoices },
    } = await api.post(`${url}client`, { client_id: props.id })

    if (invoices) {
      data.invoices = invoices?.invoices
      uiStates.title = `Facturas de ${invoices.name} ${invoices.surname}`
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      uiStates.loading = false
      hideLoading()
    }, 150)
  }
}
const print = (id) => {
  uiStates.visiblePDF = true
  uiStates.currentInvoice = id
  uiStates.pdfUri = `/api/v1/billing/invoices/print/${uiStates.currentInvoice}`
}
const extension = (id) => {
  uiStates.visibleDialog = true
  uiStates.currentInvoice = id
}
const resetDialogState = () => {
  uiStates.visibleDialog = false
  uiStates.visiblePDF = false
  uiStates.currentInvoice = 0
  uiStates.pdfUri = ''
}
onMounted(async () => {
  if (props.id > 0) await getData()
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-header class="q-header">
      <q-toolbar>
        <q-toolbar-title>{{ uiStates.title }}</q-toolbar-title>
        <q-btn v-close-popup round dense icon="close" />
      </q-toolbar>
    </q-header>

    <footer-component />

    <q-page-container>
      <q-page class="q-pa-md bg-dark">
        <q-card flat class="custom-cards q-pa-sm">
          <q-card-section>
            <div class="q-pa-md">
              <q-table
                dark
                flat
                binary-state-sort
                row-key="id"
                :rows="data.invoices"
                :columns="columns"
                no-data-label="Sin facturas generadas"
                class="secondary-table"
                :pagination="{ rowsPerPage: 12 }"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th auto-width />
                    <q-th v-for="col in props.cols" :key="col.name" :props="props">
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td auto-width>
                      <q-btn
                        size="sm"
                        color="primary"
                        round
                        dense
                        :icon="props.expand ? 'remove' : 'add'"
                        @click="props.expand = !props.expand"
                      />
                    </q-td>

                    <!--    ID    -->
                    <q-td
                      auto-width
                      key="id"
                      :props="props"
                      @click="copy(props.row.id)"
                      class="copy-text"
                    >
                      {{ props.row.id }}
                    </q-td>

                    <!--    Status    -->
                    <q-td key="status" :props="props">
                      <q-badge
                        class="text-center text-weight-bold q-py-xs"
                        :label="props.row.financial_status?.name"
                        :style="{
                          backgroundColor: props.row.financial_status?.badge_color,
                          color: '#fff',
                        }"
                      />
                    </q-td>

                    <!--    Period    -->
                    <q-td key="period" :props="props" class="copy-text">
                      {{ props.row.period?.name }}
                    </q-td>

                    <!--  Subtotal  -->
                    <q-td
                      key="subtotal"
                      :props="props"
                      class="copy-text"
                      @click="copy(props.row.subtotal)"
                    >
                      $ {{ moneyFormat(props.row.subtotal) }}
                    </q-td>

                    <!--  IVA  -->
                    <q-td key="tax" :props="props" class="copy-text" @click="copy(props.row.iva)">
                      $ {{ moneyFormat(props.row.iva) }}
                    </q-td>

                    <!--  Detained IVA  -->
                    <q-td
                      key="detained_tax"
                      :props="props"
                      class="copy-text"
                      @click="copy(props.row.iva_retenido)"
                    >
                      $ {{ moneyFormat(props.row.iva_retenido) }}
                    </q-td>

                    <!--  TOTAL  -->
                    <q-td
                      key="detained_tax"
                      :props="props"
                      class="copy-text"
                      @click="copy(props.row.total_amount)"
                    >
                      $ {{ moneyFormat(props.row.total_amount) }}
                    </q-td>

                    <!--    Actions   -->
                    <q-td auto-width key="actions" :props="props">
                      <q-btn-dropdown color="primary" label="acciones">
                        <q-list>
                          <q-item clickable v-close-popup @click="print(props.row.id)">
                            <q-item-section>
                              <q-item-label>Detalles</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                              <q-avatar icon="mdi-invoice-text-outline" text-color="white" />
                            </q-item-section>
                          </q-item>

                          <q-item clickable v-close-popup @click="extension(props.row.id)">
                            <q-item-section>
                              <q-item-label>Extensión</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                              <q-avatar icon="mdi-store-clock-outline" text-color="white" />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                    </q-td>
                  </q-tr>

                  <!--    Desplegable   -->
                  <q-tr v-show="props.expand" :props="props" class="expanded-row">
                    <q-td colspan="100%" class="expanded-content">
                      <div class="q-pa-md">
                        <div v-if="props.row.payments && props.row.payments.length > 0">
                          <div class="text-subtitle2 q-mb-md text-white">
                            Pagos aplicados ({{ props.row.payments.length }})
                          </div>

                          <q-table
                            dark
                            flat
                            :rows="props.row.payments"
                            :columns="paymentsColumns"
                            row-key="id"
                            hide-pagination
                            :rows-per-page-options="[0]"
                            class="nested-table"
                          >
                            <template v-slot:body-cell-payment_id="cellProps">
                              <!--  Id pago -->
                              <q-td
                                :props="cellProps"
                                @click="copy(cellProps.row.id)"
                                class="copy-text"
                              >
                                {{ cellProps.row.id }}
                              </q-td>
                            </template>

                            <!--  Fecha pago    -->
                            <template v-slot:body-cell-payment_date="cellProps">
                              <q-td :props="cellProps">
                                {{ formatLongDate(cellProps.row.payment_date) }}
                              </q-td>
                            </template>

                            <!--  Método de pago    -->
                            <template v-slot:body-cell-payment_method="cellProps">
                              <q-td :props="cellProps">
                                <q-badge
                                  class="text-center text-weight-bold q-py-xs"
                                  :label="cellProps.row.payment_method.name"
                                  :style="{
                                    backgroundColor: cellProps.row.payment_method?.badge_color,
                                    color: '#fff',
                                  }"
                                />
                              </q-td>
                            </template>

                            <!--  Cantidad pagada   -->
                            <template v-slot:body-cell-amount="cellProps">
                              <q-td :props="cellProps" class="copy-text">
                                $ {{ moneyFormat(cellProps.row.amount) }}
                              </q-td>
                            </template>

                            <!--  Descuento   -->
                            <template v-slot:body-cell-discount="cellProps">
                              <q-td :props="cellProps">
                                <template v-if="cellProps.row.discount">
                                  <q-badge
                                    color="blue-9"
                                    class="text-weight-bold"
                                    :label="`$ ${moneyFormat(cellProps.row.discount_amount)}`"
                                  />
                                </template>

                                <template v-else></template>
                              </q-td>
                            </template>

                            <!--  Descripción de descuento   -->
                            <template v-slot:body-cell-discount_name="cellProps">
                              <q-td :props="cellProps" class="copy-text">
                                {{ cellProps.row.discount?.name ?? '' }}
                              </q-td>
                            </template>
                          </q-table>
                        </div>

                        <!--    Mensaje cuando no hay pagos   -->
                        <div v-else class="text-center q-pa-sm">
                          <q-icon name="mdi-cash-remove" size="48px" color="grey-6" />
                          <div class="text-grey-6 q-mt-sm">No hay pagos registrados</div>
                        </div>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>

    <template v-if="uiStates.visiblePDF">
      <PDFDialog :visible="uiStates.visiblePDF" :uri="uiStates.pdfUri" @hide="resetDialogState" />
    </template>

    <template v-if="uiStates.visibleDialog">
      <ExtensionDialog
        :visible="uiStates.visibleDialog"
        :invoice="uiStates.currentInvoice"
        @hide="resetDialogState"
      />
    </template>
  </q-layout>
</template>

<style scoped lang="sass">
.expanded-row
  background-color: #1a1a2e !important

.expanded-content
  background-color: #2f353b !important
  padding: 20px !important

.nested-table
  background-color: rgba(255,255,255,0.05)
  border-radius: 8px
</style>
