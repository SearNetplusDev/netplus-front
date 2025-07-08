<script setup>
import { ref, watch, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import DeleteItemDialog from 'components/base/DeleteItemDialog.vue'
import DocumentDialog from 'components/configuration/clients/DocumentDialog.vue'

const dataViewer = useDataviewerStore()
const { copy } = useClipboard()
const currentItem = ref(0)
const showDeleteItem = ref(false)
const deleteProps = ref([])
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
  { name: 'code', label: 'Código', align: 'left' },
  { name: 'name', label: 'Nombre', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const showForm = computed(() => dataViewer.get_dataViewer.showForm)
const edit = (itm) => {
  currentItem.value = itm
  dataViewer.changeShowForm(2)
}
const showDeleteDialog = (id, name) => {
  showDeleteItem.value = true
  deleteProps.value = {
    title: 'Eliminar Tipo de documento',
    message: `¿Deseas eliminar el tipo ${name} de los registros?`,
    id: id,
    url: '/api/v1/configuration/clients/documents/',
  }
}
const resetShowDeleteItem = () => {
  showDeleteItem.value = false
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
    <template v-if="showDeleteItem">
      <DeleteItemDialog
        :data="deleteProps"
        :visible="showDeleteItem"
        @hide-dialog="resetShowDeleteItem"
      />
    </template>

    <template v-if="showForm !== 0">
      <BaseDialog :id="currentItem" :content="DocumentDialog" />
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
              :color="props.row?.status?.id ? 'primary' : 'red-10'"
              :label="props.row?.status?.name"
              class="text-center text-weight-bold q-py-xs"
            />
          </q-td>

          <!--    Code     -->
          <q-td
            key="code"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.code)"
          >
            {{ props.row?.code }}
          </q-td>

          <!--    Name    -->
          <q-td
            key="name"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.name)"
          >
            {{ props.row?.name }}
          </q-td>

          <!--    Actions    -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
                <q-tooltip transition-show="fade" transition-hide="flip-left">
                  Editar info. de {{ props.row?.name }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="negative"
                icon="delete_forever"
                size="sm"
                @click="showDeleteDialog(props.row?.id, props.row?.name)"
              >
                <q-tooltip transition-show="fade" transition-hide="flip-left">
                  Eliminar a {{ props.row?.name }}
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
