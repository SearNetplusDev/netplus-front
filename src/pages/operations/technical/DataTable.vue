<script setup>
import { ref, watch, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import FormDialog from 'components/operations/technical/FormDialog.vue'

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
    filterURL: '/api/v1/general/supports/status',
    options: [],
    align: 'left',
  },
  {
    name: 'type',
    label: 'Tipo',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/supports/types',
    options: [],
    align: 'left',
  },
  { name: 'ticket', label: 'Ticket', align: 'left' },
  { name: 'name', label: 'Nombres', align: 'left' },
  { name: 'surname', label: 'Apellidos', align: 'left' },
  {
    name: 'branch',
    label: 'Sucursal',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/branches',
    options: [],
    align: 'left',
  },
  { name: 'creation_date', label: 'Fecha de creación', align: 'left' },
  { name: 'due_date', label: 'Fecha de vencimiento', align: 'left' },
  { name: 'closed_at_date', label: 'Fecha de solución', align: 'left' },
  {
    name: 'technician',
    label: 'Asignado a',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/management/users/technicians',
    options: [],
    align: 'left',
  },
  {
    name: 'user',
    label: 'Generado por',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/management/users/list',
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
  <div>
    <template v-if="showForm !== 0">
      <BaseDialog :id="currentItem" :content="FormDialog" />
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
          <q-td key="type" :props="props">
            <q-badge
              :color="props.row?.type?.badge_color"
              :label="props.row?.type?.name"
              class="text-center text-weight-bold q-py-xs"
            />
          </q-td>

          <!--    Ticket    -->
          <q-td
            key="ticket"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.ticket_number)"
          >
            {{ props.row?.ticket_number }}
          </q-td>

          <!--    Name     -->
          <q-td
            key="name"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.client?.name)"
          >
            {{ props.row?.client?.name }}
          </q-td>

          <!--    Surname     -->
          <q-td
            key="surname"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.client?.surname)"
          >
            {{ props.row?.client?.surname }}
          </q-td>

          <!--    Branch    -->
          <q-td key="branch" class="text-left copy-text" :props="props">
            {{ props.row?.branch?.name }}
          </q-td>

          <!--    Creation Date    -->
          <q-td key="creation_date" class="text-left copy-text" :props="props">
            {{ props.row?.creation_date }}
          </q-td>

          <!--    Due Date    -->
          <q-td key="due_date" class="text-left copy-text" :props="props">
            {{ props.row?.due_date }}
          </q-td>

          <!--    Closed At Date    -->
          <q-td key="closed_at_date" class="text-left copy-text" :props="props">
            {{ props.row?.closed_at }}
          </q-td>

          <!--    Technician    -->
          <q-td key="technician" class="text-left copy-text" :props="props">
            {{ props.row?.technician?.user?.name }}
          </q-td>

          <!--    User    -->
          <q-td key="user" class="text-left copy-text" :props="props">
            {{ props.row?.user?.name }}
          </q-td>

          <!--    State    -->
          <q-td key="state" class="text-left copy-text" :props="props">
            {{ props.row?.state?.name }}
          </q-td>

          <!--    District    -->
          <q-td key="district" class="text-left copy-text" :props="props">
            {{ props.row?.district?.name }}
          </q-td>

          <!--    Actions    -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn color="blue-10" icon="mdi-wrench" size="sm" @click="edit(props.row?.id)">
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Solucionar soporte {{ props.row?.ticket_number }}
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
