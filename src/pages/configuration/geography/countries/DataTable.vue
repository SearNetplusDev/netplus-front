<script setup>
import { ref, watch, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import DeleteItemDialog from 'components/base/DeleteItemDialog.vue'
import CountryDialog from 'components/configuration/geography/countries/CountryDialog.vue'

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
  { name: 'es_name', label: 'Nombre', align: 'left' },
  { name: 'iso_2', label: 'Formato ISO 2', align: 'left' },
  { name: 'iso_3', label: 'Formato ISO 3', align: 'left' },
  { name: 'phone_prefix', label: 'Prefijo telefónico', align: 'left' },
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
    title: 'Eliminar país',
    message: `¿Deseas eliminar el país ${name} de los registros?`,
    id: id,
    url: '/api/v1/configuration/geography/countries/',
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
      <BaseDialog :id="currentItem" :content="CountryDialog" />
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
              :color="props.row?.status_id ? 'primary' : 'red-10'"
              :label="props.row?.status_id ? 'Activo' : 'Inactivo'"
              class="text-center text-weight-bold q-py-xs"
            />
          </q-td>

          <!--    Name    -->
          <q-td
            key="es_name"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.es_name)"
          >
            {{ props.row?.es_name }}
          </q-td>

          <!--    ISO 2    -->
          <q-td
            key="iso_2"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.iso_2)"
          >
            {{ props.row?.iso_2 }}
          </q-td>

          <!--    ISO 3    -->
          <q-td
            key="iso_3"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.iso_3)"
          >
            {{ props.row?.iso_3 }}
          </q-td>

          <!--    PREFIX    -->
          <q-td
            key="phone_prefix"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.phone_prefix)"
          >
            {{ props.row?.phone_prefix }}
          </q-td>

          <!--    Actions    -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
                <q-tooltip transition-show="fade" transition-hide="flip-left">
                  Editar info. de {{ props.row?.es_name }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="negative"
                icon="delete_forever"
                size="sm"
                @click="showDeleteDialog(props.row?.id, props.row?.es_name)"
              >
                <q-tooltip transition-show="fade" transition-hide="flip-left">
                  Eliminar a {{ props.row?.es_name }}
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
