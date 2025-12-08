<script setup>
import { reactive, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useClipboard } from 'src/utils/clipboard.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import PDFDialog from 'components/base/widgets/PDFDialog.vue'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { copy } = useClipboard()
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
const data = reactive({
  invoices: [],
})
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
const refreshPDFComponent = () => {
  uiStates.visiblePDF = false
  uiStates.currentInvoice = 0
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
                      $ {{ props.row.subtotal }}
                    </q-td>

                    <!--  IVA  -->
                    <q-td key="tax" :props="props" class="copy-text" @click="copy(props.row.iva)">
                      $ {{ props.row.iva }}
                    </q-td>

                    <!--  Detained IVA  -->
                    <q-td
                      key="detained_tax"
                      :props="props"
                      class="copy-text"
                      @click="copy(props.row.iva_retenido)"
                    >
                      $ {{ props.row.iva_retenido }}
                    </q-td>

                    <!--  TOTAL  -->
                    <q-td
                      key="detained_tax"
                      :props="props"
                      class="copy-text"
                      @click="copy(props.row.total_amount)"
                    >
                      $ {{ props.row.total_amount }}
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

                          <q-item clickable v-close-popup>
                            <q-item-section>
                              <q-item-label>Anular</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                              <q-avatar icon="mdi-invoice-text-remove-outline" text-color="white" />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                    </q-td>
                  </q-tr>

                  <q-tr v-show="props.expand" :props="props">
                    <q-td colspan="100%">
                      <div class="text-subtitle2">Expansión para {{ props.row.period?.code }}</div>
                      <q-separator class="q-mb-xs" />
                      <div class="text-caption">
                        Del {{ props.row.period?.period_start }} al
                        {{ props.row.period?.period_end }}
                      </div>
                      <q-separator class="q-mb-xs" />
                      <div class="text-weight-bold">Factura ID {{ props.row.id }}</div>
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
      <PDFDialog
        :visible="uiStates.visiblePDF"
        :uri="uiStates.pdfUri"
        @hide="refreshPDFComponent"
      />
    </template>
  </q-layout>
</template>

<style scoped></style>
