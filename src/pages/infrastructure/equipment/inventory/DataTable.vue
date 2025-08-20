<script setup>
import { ref, watch, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import InventoryFormDialog from 'components/infrastructure/equipment/InventoryFormDialog.vue'
import InventoryLogDialog from 'components/infrastructure/equipment/InventoryLogDialog.vue'

const dataViewer = useDataviewerStore()
const { copy } = useClipboard()
const currentItem = ref(0)
const showHistoryDialog = ref(false)
const columns = [
  { name: 'id', label: 'ID', sortable: true, align: 'center' },
  {
    name: 'status',
    label: 'Estado',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/infrastructure/status',
    options: [],
    align: 'left',
  },
  {
    name: 'type',
    label: 'Tipo de equipo',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/infrastructure/types',
    options: [],
    align: 'left',
  },
  {
    name: 'brand',
    label: 'Marca',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/infrastructure/brands',
    options: [],
    align: 'left',
  },
  {
    name: 'model',
    label: 'Modelo',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/infrastructure/models',
    options: [],
    align: 'left',
  },
  { name: 'mac', label: 'Dirección MAC', align: 'left' },
  { name: 'branch', label: 'Sucursal', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const showForm = computed(() => dataViewer.get_dataViewer.showForm)
const edit = (itm) => {
  currentItem.value = itm
  dataViewer.changeShowForm(2)
}
const logDialog = (itm) => {
  showHistoryDialog.value = true
  currentItem.value = itm
}
const restartValues = () => {
  currentItem.value = 0
  showHistoryDialog.value = false
}
watch(showForm, (newVal) => {
  if (newVal === 1) {
    currentItem.value = 0
  } else {
    dataViewer.fetch({ force: true })
  }
})
</script>
<template>
  <div>
    <template v-if="showForm !== 0">
      <BaseDialog :id="currentItem" :content="InventoryFormDialog" />
    </template>

    <template v-if="showHistoryDialog">
      <InventoryLogDialog :id="currentItem" :visible="showHistoryDialog" @hide="restartValues" />
    </template>

    <BaseDataTable :columns="columns">
      <template v-slot:body="{ props }">
        <q-tr :props="props">
          <!--    ID    -->
          <q-td key="id" class="text-left copy-text" :props="props" @click="copy(props.row?.id)">
            {{ props.row?.id }}
          </q-td>

          <!--    Status    -->
          <q-td key="status" :props="props">
            <q-badge
              :color="props.row?.status?.badge_color"
              :label="props.row?.status?.name"
              class="text-center text-weight-bold q-py-xs"
            />
          </q-td>

          <!--    Type    -->
          <q-td key="type" class="text-left copy-text" :props="props">
            {{ props.row?.type?.name }}
          </q-td>

          <!--    Brand     -->
          <q-td key="brand" class="text-left copy-text" :props="props">
            {{ props.row?.brand?.name }}
          </q-td>

          <!--    Model     -->
          <q-td key="model" class="text-left copy-text" :props="props">
            {{ props.row?.model?.name }}
          </q-td>

          <!--    MAC    -->
          <q-td
            key="mac"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.mac_address)"
          >
            {{ props.row?.mac_address }}
          </q-td>

          <!--    Branch     -->
          <q-td key="branch" class="text-left copy-text" :props="props">
            {{ props.row?.branch?.name }}
          </q-td>

          <!--    Actions    -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Editar info. de {{ props.row?.mac_address }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="blue-grey-10"
                icon="history"
                size="sm"
                @click="logDialog(props.row?.id)"
              >
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Historial del equipo {{ props.row?.mac_address }}
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-td>
        </q-tr>
      </template>
    </BaseDataTable>
  </div>
</template>
<style lang="sass" scoped></style>
