<script setup>
import { computed, ref, watch } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import StatusesDialog from 'components/billing/options/StatusesDialog.vue'

const dataViewer = useDataviewerStore()
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
  { name: 'color', label: 'Color', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const showForm = computed(() => dataViewer.get_dataViewer.showForm)
const edit = (itm) => {
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
</script>

<template>
  <template v-if="showForm !== 0">
    <base-dialog :id="currentItem" :content="StatusesDialog" />
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

        <!--  Color   -->
        <q-td key="color" class="text-left copy-text" :props="props">
          <q-badge
            class="q-py-xs text-weight-bold"
            :label="props.row.badge_color"
            :style="{
              backgroundColor: props.row.badge_color,
              color: '#fff',
            }"
          />
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
