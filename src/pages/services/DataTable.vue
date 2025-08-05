<script setup>
import { ref, watch, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
// import BaseDialog from 'components/base/BaseDialog.vue'

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
  { name: 'name', label: 'Nombres', align: 'left' },
  { name: 'surname', label: 'Apellidos', align: 'left' },
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
  { name: 'services', label: 'Total Servicios', align: 'center' },
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
    <!--    <template v-if="showForm !== 0">-->
    <!--      <BaseDialog :id="currentItem" :content="CountryDialog" />-->
    <!--    </template>-->

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

          <!--    Name    -->
          <q-td key="name" class="text-left copy-text" :props="props">
            {{ props.row?.name }}
          </q-td>

          <!--    Surname     -->
          <q-td key="surname" class="text-left copy-text" :props="props">
            {{ props.row?.surname }}
          </q-td>

          <!--    Document     -->
          <q-td
            key="document"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.dui?.number)"
          >
            {{ props.row?.dui?.number }}
          </q-td>

          <!--    Mobile    -->
          <q-td
            key="mobile"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.mobile?.number)"
          >
            {{ props.row?.mobile?.number }}
          </q-td>

          <!--    Client Type   -->
          <q-td key="type" :props="props" class="copy-text">
            {{ props.row?.client_type?.name }}
          </q-td>

          <!--    Branch    -->
          <q-td key="branch" :props="props" class="copy-text">
            {{ props.row?.branch?.name }}
          </q-td>

          <!--  State   -->
          <q-td key="state" :props="props" class="copy-text">
            {{ props.row?.address?.state?.name }}
          </q-td>

          <!--    District    -->
          <q-td key="district" :props="props" class="copy-text">
            {{ props.row?.address?.district?.name }}
          </q-td>

          <!--    Total Services    -->
          <q-td key="services" :props="props" class="copy-text">
            {{ props.row?.services.length }}
          </q-td>

          <!--    Actions    -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn
                color="indigo-6"
                icon="mdi-list-box-outline"
                size="sm"
                @click="edit(props.row?.id)"
              >
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Ver servicio(s) de {{ props.row?.name }} {{ props.row?.surname }}
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
