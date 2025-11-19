<script setup>
import { ref, watch, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import DiscountsDialog from 'components/billing/options/DiscountsDialog.vue'

const dataviewer = useDataviewerStore()
const { copy } = useClipboard()
const currentItem = ref(0)
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
  { name: 'name', label: 'Nombre', align: 'left' },
  { name: 'code', label: 'Código', align: 'left' },
  { name: 'percentage', label: 'Porcentaje', align: 'left' },
  { name: 'amount', label: 'Monto fijo', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const showForm = computed(() => dataviewer.get_dataViewer.showForm)
const edit = (itm) => {
  currentItem.value = itm
  dataviewer.changeShowForm(2)
}
watch(showForm, (newVal) => {
  if (newVal === 1) {
    currentItem.value = 0
  } else {
    dataviewer.fetch({ force: true })
  }
})
</script>

<template>
  <template v-if="showForm !== 0">
    <BaseDialog :id="currentItem" :content="DiscountsDialog" />
  </template>

  <base-data-table :columns="columns">
    <template v-slot:body="{ props }">
      <q-tr :props="props">
        <!--    ID    -->
        <q-td key="id" class="text-left copy-text" :props="props" @click="copy(props.row?.id)">
          {{ props.row?.id }}
        </q-td>

        <!--    Status    -->
        <q-td key="status" :props="props">
          <q-badge
            :color="props.row?.status?.id ? 'primary' : 'red-10'"
            :label="props.row?.status?.name"
            class="text-center text-weight-bold q-py-xs"
          />
        </q-td>

        <!--    Name    -->
        <q-td key="name" class="text-left copy-text" :props="props" @click="copy(props.row?.name)">
          {{ props.row?.name }}
        </q-td>

        <!--    Code    -->
        <q-td key="code" class="text-left copy-text" :props="props" @click="copy(props.row?.code)">
          {{ props.row?.code }}
        </q-td>

        <!--    Percentage    -->
        <q-td key="percentage" class="text-left copy-text" :props="props">
          {{ props.row?.percentage }} %
        </q-td>

        <!--    Amount    -->
        <q-td key="amount" class="text-left copy-text" :props="props">
          $ {{ props.row?.amount }}
        </q-td>

        <!--    Actions    -->
        <q-td key="actions" :props="props">
          <q-btn-group>
            <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
              <q-tooltip transition-show="fade" transition-hide="flip-left">
                Editar info. de {{ props.row?.name }}
              </q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </q-tr>
    </template>
  </base-data-table>
</template>

<style scoped></style>
