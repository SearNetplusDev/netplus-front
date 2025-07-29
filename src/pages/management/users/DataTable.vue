<script setup>
import { ref, computed, watch } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { date } from 'quasar'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import DeleteItemDialog from 'components/base/DeleteItemDialog.vue'
import UsersDialog from 'components/administracion/users/UsersDialog.vue'

const useDataViewer = useDataviewerStore()
const { copy } = useClipboard()
const currentItem = ref(0)
const showForm = computed(() => useDataViewer.get_dataViewer.showForm)
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
  { name: 'name', label: 'Nombre', align: 'left' },
  { name: 'email', label: 'Correo electrónico', align: 'left' },
  { name: 'role', label: 'Rol', align: 'left' },
  { name: 'register_date', label: 'Fecha de registro', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const edit = (itm) => {
  currentItem.value = itm
  useDataViewer.changeShowForm(2)
}
watch(showForm, (newVal) => {
  if (newVal === 1) {
    currentItem.value = 0
  } else {
    useDataViewer.fetch({ force: true })
  }
})
const showDeleteDialog = (id, name) => {
  showDeleteItem.value = true
  deleteProps.value = {
    title: 'Eliminar usuario',
    message: `¿Deseas eliminar a ${name} de los registros?`,
    id: id,
    url: '/api/v1/administracion/usuarios',
  }
}
const formattedDate = (itm) => {
  return date.formatDate(itm, 'YYYY-MM-DD')
}
const resetShowDeleteItem = () => {
  showDeleteItem.value = false
}
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

    <template v-if="showForm === 1 || showForm === 2">
      <BaseDialog :id="currentItem" :content="UsersDialog" />
    </template>

    <BaseDataTable :columns="columns">
      <template v-slot:body="{ props }">
        <q-tr :props="props">
          <!--    ID    -->
          <q-td key="id" class="text-left copy-text" :props="props" @click="copy(props.row?.id)">
            {{ props.row.id }}
          </q-td>

          <!--    Status    -->
          <q-td key="status" :props="props">
            <q-badge
              :color="props.row?.status_id ? 'primary' : 'red-10'"
              :label="props.row?.status_id ? 'Activo' : 'Inactivo'"
              class="text-center text-weight-bold q-py-xs"
            />
          </q-td>

          <!--  Name    -->
          <q-td
            key="name"
            :props="props"
            class="text-left copy-text"
            @click="copy(props.row?.name)"
          >
            {{ props.row?.name }}
          </q-td>

          <!--    Email   -->
          <q-td key="email" :props="props" class="copy-text" @click="copy(props.row?.email)">
            {{ props.row?.email }}
          </q-td>

          <!--    Role    -->
          <q-td key="role" :props="props" class="copy-text">
            {{ props.row?.roles[0]?.name }}
          </q-td>

          <!--    Register Date   -->
          <q-td key="register_date" :props="props">
            {{ formattedDate(props.row?.created_at) }}
          </q-td>

          <!--    Action buttoms   -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row.id)">
                <q-tooltip transition-show="fade" transition-hide="flip-left">
                  Editar info. de {{ props.row.name }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="negative"
                icon="delete_forever"
                size="sm"
                @click="showDeleteDialog(props.row.id, props.row.name)"
              >
                <q-tooltip transition-show="fade" transition-hide="flip-left">
                  Eliminar a {{ props.row.name }}
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
