<script setup>
import { reactive, computed, watch } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import DTEDialog from 'components/accounting/dte/DTEDialog.vue'
import PDFDialog from 'components/base/widgets/PDFDialog.vue'

const dataViewer = useDataviewerStore()
const { copy } = useClipboard()
const { formatLongDate } = useDateFormatter()
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
})
const printDTE = (id) => {
  states.visiblePDF = true
  states.currentItem = id
  states.pdfUrl = `/api/v1/accounting/dte/print/${id}`
}
const refreshPDFComponent = () => {
  states.visiblePDF = false
  states.currentItem = 0
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
      <PDFDialog
        :id="states.currentItem"
        :visible="states.visiblePDF"
        @hide="refreshPDFComponent"
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
              :color="props.row.status?.id ? 'primary' : 'red-10'"
              :label="props.row.status?.name"
              class="text-center text-weight-bold q-py-xs"
            />
          </q-td>

          <!--    Tipo    -->
          <q-td key="type" :props="props">
            {{ props.row.type?.name }}
          </q-td>

          <!--    Cliente    -->
          <q-td key="client" :props="props">
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

          <!--    Fecha de emisión    -->
          <q-td key="date" :props="props" class="text-left copy-text">
            {{ formatLongDate(props.row.issue_date) }}
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
                  Imprimir DTE {{ props.row.control_number }}
                </q-tooltip>
              </q-btn>

              <q-btn color="red-10" icon="mdi-receipt-text-remove-outline" size="sm">
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Anular DTE {{ props.row.control_number }}
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-td>
        </q-tr>
      </template>
    </base-data-table>
  </div>
</template>

<style scoped></style>
