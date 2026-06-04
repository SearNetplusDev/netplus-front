<script setup>
import { reactive, computed, watch, defineAsyncComponent } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { api } from 'src/utils/api.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import DTEDialog from 'components/accounting/dte/DTEDialog.vue'

const PDFDialog = defineAsyncComponent(() => import('components/base/widgets/PDFDialog.vue'))
const AnulateDTEComponent = defineAsyncComponent(
  () => import('components/base/AnulateDTEComponent.vue'),
)
const RefundDialog = defineAsyncComponent(
  () => import('components/accounting/dte/events/RefundDialog.vue'),
)

const dataViewer = useDataviewerStore()
const { copy } = useClipboard()
const { formatLongDate } = useDateFormatter()
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const columns = reactive([
  { name: 'id', label: 'ID', sortable: true, align: 'center' },
  {
    name: 'status',
    label: 'Estado',
    filterable: true,
    model: [],
    options: [
      { name: 'Emitido', id: 1 },
      { name: 'Anulado', id: 0 },
    ],
    align: 'center',
  },
  {
    name: 'type',
    label: 'Tipo DTE',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/billing/documents',
    options: [],
    align: 'center',
  },
  { name: 'client', label: 'Cliente', align: 'left' },
  { name: 'control', label: 'Número de control', align: 'left' },
  { name: 'generation', label: 'Código de generación', align: 'left' },
  { name: 'amount', label: 'Total', align: 'left' },
  { name: 'date', label: 'Fecha de emisión', align: 'left' },
  {
    name: 'user',
    label: 'Generado por',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/management/users/list',
    options: [],
    align: 'left',
  },
  { name: 'actions', label: '', align: 'center' },
])
const showForm = computed(() => dataViewer.get_dataViewer.showForm)
const states = reactive({
  visiblePDF: false,
  currentItem: 0,
  pdfUrl: '',
  showAnulateDialog: false,
  anulateProps: {},
  showRefundDialog: false,
  refundProps: {},
})
const printDTE = (id) => {
  states.visiblePDF = true
  states.currentItem = id
  states.pdfUrl = `/api/v1/accounting/dte/print/${states.currentItem}`
}
const showAnulateDialog = (id, type, control_number) => {
  states.showAnulateDialog = true
  states.anulateProps = {
    title: `Anular ${type} - ${control_number}`,
    id: id,
  }
}
const refreshPDFComponent = () => {
  states.visiblePDF = false
  states.currentItem = 0
}
const resetAnulateItem = () => {
  states.anulateProps.id = 0
  states.showAnulateDialog = false
}
const resetRefundItem = () => {
  states.refundProps.id = 0
  states.showRefundDialog = false
}
const sendMail = async (id) => {
  showLoading()
  let uri = '/api/v1/accounting/dte/resend/mail'
  let params = { dte_id: id, _method: 'POST' }
  try {
    const { data } = await api.post(uri, params)
    if (data) {
      showNotification('Éxito', 'Se ha reenviado el correo de notificación.', 'blue-grey-10')
    } else {
      showNotification('Error', 'Algo ha salido mal.', 'red-10')
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      hideLoading()
    }, 150)
  }
}
const showRefundDialog = (id, type, control_number, json) => {
  states.showRefundDialog = true
  states.refundProps = {
    title: `Reembolso en ${type} - ${control_number}`,
    id: id,
    json: json,
  }
}
watch(showForm, (newVal) => {
  if (newVal === 1) {
    states.currentItem = 0
  } else {
    dataViewer.fetch({ force: true })
  }
})
</script>

<template>
  <div>
    <template v-if="showForm !== 0">
      <base-dialog :content="DTEDialog" />
    </template>

    <template v-if="states.visiblePDF">
      <PDFDialog :visible="states.visiblePDF" :uri="states.pdfUrl" @hide="refreshPDFComponent" />
    </template>

    <template v-if="states.showAnulateDialog">
      <AnulateDTEComponent
        :data="states.anulateProps"
        :visible="states.showAnulateDialog"
        @hide-dialog="resetAnulateItem"
      />
    </template>

    <template v-if="states.showRefundDialog">
      <RefundDialog
        :data="states.refundProps"
        v-model:visible="states.showRefundDialog"
        @hide-dialog="resetRefundItem"
      />
    </template>

    <base-data-table :columns="columns">
      <template v-slot:body="{ props }">
        <q-tr :props="props">
          <!--  ID    -->
          <q-td key="id" class="text-left copy-text" :props="props" @click="copy(props.row.id)">
            {{ props.row.id }}
          </q-td>

          <!--  Estado    -->
          <q-td key="status" :props="props">
            <q-badge
              :color="props.row.status_id ? 'primary' : 'red-10'"
              :label="props.row.status_id ? 'Emitido' : 'Anulado'"
              class="text-center text-weight-bold q-py-xs"
            />
          </q-td>

          <!--    Tipo    -->
          <q-td key="type" :props="props" class="copy-text text-left">
            {{ props.row.dte_type?.name }}
          </q-td>

          <!--    Cliente    -->
          <q-td key="client" :props="props" class="copy-text text-left">
            {{ props.row.client?.name }} {{ props.row.client?.surname }}
          </q-td>

          <!--    Número de control    -->
          <q-td
            key="control"
            :props="props"
            class="text-left copy-text"
            @click="copy(props.row.control_number)"
          >
            {{ props.row.control_number }}
          </q-td>

          <!--    Código de generación    -->
          <q-td
            key="generation"
            :props="props"
            class="text-left copy-text"
            @click="copy(props.row.generation_code)"
          >
            {{ props.row.generation_code }}
          </q-td>

          <!--    Total   -->
          <q-td key="amount" :props="props" class="text-left copy-text">
            $ {{ props.row.total_amount }}
          </q-td>

          <!--    Fecha de emisión    -->
          <q-td key="date" :props="props" class="text-left copy-text">
            {{ formatLongDate(props.row.generation_datetime) }}
          </q-td>

          <!--    Generado por    -->
          <q-td key="user" :props="props">
            {{ props.row.user?.name ?? 'N/A' }}
          </q-td>

          <!--    Acciones    -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn
                color="blue-grey-9"
                icon="mdi-printer"
                size="sm"
                @click="printDTE(props.row.id)"
              >
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Imprimir {{ props.row.control_number }}
                </q-tooltip>
              </q-btn>

              <q-btn
                color="blue-10"
                icon="mdi-email-fast"
                size="sm"
                @click="sendMail(props.row.id)"
              >
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Reenviar correo
                </q-tooltip>
              </q-btn>

              <q-btn-dropdown color="teal-9" size="sm" label="Eventos">
                <q-list>
                  <q-item
                    v-if="!props.row.invalidation"
                    clickable
                    v-close-popup
                    @click="
                      showAnulateDialog(
                        props.row.id,
                        props.row.dte_type.name,
                        props.row.control_number,
                      )
                    "
                  >
                    <q-item-section avatar>
                      <q-avatar
                        icon="mdi-file-document-remove"
                        color="negative"
                        text-color="white"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Invalidar {{ props.row.dte_type?.name }}</q-item-label>
                      <q-item-label caption>{{ props.row.control_number }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-if="[1, 10].includes(props.row.document_type_id) && !props.row.invalidation"
                    clickable
                    v-close-popup
                    @click="
                      showRefundDialog(
                        props.row.id,
                        props.row.dte_type?.name,
                        props.row.control_number,
                        props.row.json_body,
                      )
                    "
                  >
                    <q-item-section avatar>
                      <q-avatar icon="mdi-cash-refund" color="negative" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Devolución en {{ props.row.dte_type?.name }}</q-item-label>
                      <q-item-label caption>{{ props.row.control_number }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-btn-group>
          </q-td>
        </q-tr>
      </template>
    </base-data-table>
  </div>
</template>

<style scoped></style>
