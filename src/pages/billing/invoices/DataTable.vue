<script setup>
import { ref, watch, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import InvoicesDialog from 'components/billing/invoices/InvoicesDialog.vue'
import GeneralContainer from 'components/billing/GeneralContainer.vue'

const dataViewer = useDataviewerStore()
const { copy } = useClipboard()
const currentItem = ref(0)
const currentName = ref('')
const columns = [
  { name: 'id', label: 'ID', sortable: true, align: 'center' },
  {
    name: 'status',
    label: 'Estado',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/estados',
    options: [],
    align: 'left',
  },
  {
    name: 'financial_status',
    label: 'Estado Financiero',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/billing/statuses',
    options: [],
    align: 'left',
  },
  { name: 'name', label: 'Nombres', align: 'left' },
  { name: 'surname', label: 'Apellidos', align: 'left' },
  { name: 'total_invoices', label: 'Facturas generadas', align: 'center' },
  { name: 'paid_invoices', label: 'Facturas pagadas', align: 'center' },
  { name: 'pending_invoices', label: 'Facturas pendientes', align: 'center' },
  { name: 'overdue_invoices', label: 'Facturas vencidas', align: 'center' },
  { name: 'document', label: 'DUI', align: 'left' },
  { name: 'mobile', label: 'Teléfono', align: 'left' },
  {
    name: 'type',
    label: 'Tipo de cliente',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/client/types',
    options: [],
    align: 'left',
  },
  {
    name: 'branch',
    label: 'Sucursal',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/branches',
    options: [],
    align: 'left',
  },
  {
    name: 'state',
    label: 'Departamento',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/states',
    options: [],
    align: 'left',
  },
  {
    name: 'district',
    label: 'Distrito',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/districts',
    options: [],
    align: 'left',
  },
  { name: 'actions', label: '', align: 'center' },
]
const showForm = computed(() => dataViewer.get_dataViewer.showForm)
const show_main_dialog = ref(false)
const show_prepayment_form = ref(false)
const callMainDialog = (itm, name) => {
  currentItem.value = itm
  currentName.value = name
  show_main_dialog.value = true
}
const invoices = (itm) => {
  currentItem.value = itm
  dataViewer.changeShowForm(2)
}
watch(showForm, (newVal) => {
  if (newVal === 1) {
    currentItem.value = 0
  } else {
    dataViewer.fetch({ force: true })
  }
})
const reset_dialog = () => {
  currentItem.value = 0
  currentName.value = ''
  show_main_dialog.value = false
  show_prepayment_form.value = false
}
</script>

<template>
  <div>
    <template v-if="showForm !== 0">
      <BaseDialog :id="currentItem" :content="InvoicesDialog" />
    </template>

    <template v-if="show_main_dialog">
      <GeneralContainer
        :name="currentName"
        :client="currentItem"
        :visible="show_main_dialog"
        @hide="reset_dialog"
      />
    </template>

    <BaseDataTable :columns="columns">
      <template v-slot:body="{ props }">
        <q-tr :props="props">
          <!--    ID  De Cliente  -->
          <q-td key="id" class="text-left copy-text" :props="props" @click="copy(props.row.id)">
            {{ props.row.id }}
          </q-td>

          <!--  Estado De Cliente   -->
          <q-td key="status" :props="props">
            <q-badge
              :color="props.row.status?.id ? 'primary' : 'red-10'"
              :label="props.row.status?.name"
              class="text-center text-weight-bold q-py-xs"
            />
          </q-td>

          <!--    Estado financiero   -->
          <q-td key="financial_status" :props="props">
            <q-badge
              class="text-center text-weight-bold q-py-xs"
              :label="props.row.financial_status?.status?.name ?? 'Sin facturas generadas'"
              :style="{
                backgroundColor: props.row.financial_status?.status?.badge_color ?? '#7b2d8e',
                color: '#fff',
              }"
            />
          </q-td>

          <!--    Nombres    -->
          <q-td key="name" class="text-left copy-text" :props="props">
            {{ props.row?.name }}
          </q-td>

          <!--    Apellidos     -->
          <q-td key="surname" class="text-left copy-text" :props="props">
            {{ props.row?.surname }}
          </q-td>

          <!--  Total Facturas    -->
          <q-td auto-width key="total_invoices" class="text-center copy-text" :props="props">
            {{ props.row.financial_status?.total_invoices ?? 0 }}
          </q-td>

          <!--  Total Facturas Pagadas    -->
          <q-td auto-width key="paid_invoices" class="text-center copy-text" :props="props">
            {{ props.row.financial_status?.paid_invoices ?? 0 }}
          </q-td>

          <!--  Total Facturas Pendientes    -->
          <q-td auto-width key="pending_invoices" class="text-center copy-text" :props="props">
            {{ props.row.financial_status?.pending_invoices ?? 0 }}
          </q-td>

          <!--  Total Facturas Vencidas    -->
          <q-td auto-width key="overdue_invoices" class="text-center copy-text" :props="props">
            {{ props.row.financial_status?.overdue_invoices ?? 0 }}
          </q-td>

          <!--    DUI     -->
          <q-td
            key="document"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row.dui?.number)"
          >
            {{ props.row.dui?.number ?? '' }}
          </q-td>

          <!--    Celular    -->
          <q-td
            key="mobile"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.mobile?.number ?? '')"
          >
            {{ props.row?.mobile?.number }}
          </q-td>

          <!--    Tipo Cliente   -->
          <q-td key="type" :props="props" class="copy-text">
            {{ props.row?.client_type?.name }}
          </q-td>

          <!--    Sucursal    -->
          <q-td key="branch" :props="props" class="copy-text">
            <q-badge
              class="text-center text-weight-bold q-py-xs"
              :label="props.row.branch?.name"
              :style="{ backgroundColor: props.row.branch?.badge_color, color: '#fff' }"
            />
          </q-td>

          <!--  Departamento   -->
          <q-td key="state" :props="props" class="copy-text">
            {{ props.row?.address?.state?.name }}
          </q-td>

          <!--    Distrito    -->
          <q-td key="district" :props="props" class="copy-text">
            {{ props.row?.address?.district?.name }}
          </q-td>

          <!--    Actions    -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn
                color="blue-grey-9"
                icon="mdi-wallet-outline"
                size="sm"
                @click="payments(props.row.id, `${props.row.name} ${props.row.surname}`)"
              >
                <q-tooltip transition-show="fade" transition-hide="slide-down" class="bg-grey-10">
                  Estado financiero de {{ props.row.name }} {{ props.row.surname }}
                </q-tooltip>
              </q-btn>

              <q-btn
                color="green-10"
                icon="mdi-cash"
                size="sm"
                @click="callMainDialog(props.row.id, `${props.row.name} ${props.row.surname}`)"
              >
                <q-tooltip transition-show="fade" transition-hide="slide-down" class="bg-grey-10">
                  Pagos/Abonos de {{ props.row.name }} {{ props.row.surname }}
                </q-tooltip>
              </q-btn>

              <q-btn
                color="blue-10"
                icon="mdi-invoice-list-outline"
                size="sm"
                @click="invoices(props.row?.id)"
              >
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Ver facturas(s) de {{ props.row?.name }} {{ props.row?.surname }}
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-td>
        </q-tr>
      </template>
    </BaseDataTable>
  </div>
</template>

<style scoped></style>
