<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useClipboard } from 'src/utils/clipboard.js'
import ContractDialog from 'components/clients/data/general/contracts/ContractDialog.vue'
import PDFDialog from 'components/base/widgets/PDFDialog.vue'

const { showLoading, hideLoading } = useLoading()
const { copy } = useClipboard()
const props = defineProps({
  client: Number,
})
const url = '/api/v1/clients/contracts/data'
const pdfUrl = ref('')
const columns = [
  {
    name: 'id',
    label: 'ID',
    align: 'center',
  },
  {
    name: 'status',
    label: 'Estado',
    align: 'center',
  },
  {
    name: 'initial_date',
    label: 'Fecha Inicio',
    align: 'center',
    field: (row) => row.contract_date,
  },
  {
    name: 'final_date',
    label: 'Fecha Fin',
    align: 'center',
    field: (row) => row.contract_end_date,
  },
  {
    name: 'days',
    label: 'Días Restantes',
    align: 'center',
    field: (row) => `${row?.diff_days} días`,
  },
  { name: 'actions', label: '', align: 'center' },
]
const contracts = ref([])
const isVisible = ref(false)
const visiblePDF = ref(false)
const currentContract = ref(0)
const getData = () => {
  showLoading()
  let data = new FormData()
  data.append('clientID', props.client)
  api
    .post(url, data)
    .then((res) => {
      contracts.value = res.data.response
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      setTimeout(() => {
        hideLoading()
      }, 500)
    })
}
const refreshComponent = () => {
  isVisible.value = false
  currentContract.value = 0
  getData()
}
const refreshPDFComponent = () => {
  visiblePDF.value = false
  currentContract.value = 0
}
const edit = (id) => {
  isVisible.value = true
  currentContract.value = id
}
const print = (id) => {
  visiblePDF.value = true
  currentContract.value = id
  pdfUrl.value = '/api/v1/clients/contracts/print/' + id
}
onMounted(() => {
  getData()
})
</script>

<template>
  <div class="row fit">
    <div class="col-12">
      <q-breadcrumbs class="text-white" gutter="md" active-color="white">
        <template v-slot:separator>
          <q-icon size="1.5em" name="chevron_right" color="white" />
        </template>
        <q-breadcrumbs-el label="Clientes" icon="mdi-account" />
        <q-breadcrumbs-el label="Contratos" icon="mdi-file-account" />
      </q-breadcrumbs>

      <q-separator dark class="q-my-md" />
    </div>

    <!--    <div class="row fit content-end justify-end">-->
    <!--      <q-btn-->
    <!--        color="white"-->
    <!--        icon="add"-->
    <!--        flat-->
    <!--        :ripple="{ center: true, color: 'amber' }"-->
    <!--        label="agregar"-->
    <!--        align="around"-->
    <!--        @click="isVisible = true"-->
    <!--      />-->
    <!--    </div>-->

    <div class="row full-width fit content-start justify-start q-pa-md">
      <div class="col-12 full-width">
        <q-table
          dark
          flat
          binary-state-sort
          class="secondary-table"
          :rows="contracts"
          :columns="columns"
        >
          <template v-slot:body-cell-id="props">
            <q-td key="id" :props="props" class="copy-text">
              <div class="text-center">
                <div @click="copy(props.row?.id)">
                  {{ props.row?.id }}
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td key="status" :props="props">
              <div class="text-center">
                <q-badge
                  align="middle"
                  class="text-bold"
                  :color="props.row?.contract_status?.badge_color"
                  :label="props.row?.contract_status?.name"
                />
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td key="actions" :props="props">
              <q-btn-group>
                <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
                  <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-9">
                    Editar contrato vigente del {{ props.row?.contract_date }} al
                    {{ props.row?.contract_end_date }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  color="light-blue-10"
                  icon="mdi-printer"
                  size="sm"
                  @click="print(props.row?.id)"
                >
                  <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-9">
                    Imprimir contrato
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <template v-if="isVisible">
      <ContractDialog
        :client="props.client"
        :visible="isVisible"
        :contractID="currentContract"
        @hide="refreshComponent"
      />
    </template>

    <template v-if="visiblePDF">
      <PDFDialog :visible="visiblePDF" :uri="pdfUrl" @hide="refreshPDFComponent" />
    </template>
  </div>
</template>

<style scoped></style>
