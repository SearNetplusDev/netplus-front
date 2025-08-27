<script setup>
import { ref, watch, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import BaseDialog from 'components/base/BaseDialog.vue'
import InternetFormDialog from 'components/administracion/profiles/InternetFormDialog.vue'

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
  { name: 'alias', label: 'Alias', align: 'left' },
  { name: 'price', label: 'Precio', align: 'left' },
  {
    name: 'iptv',
    label: 'IPTV',
    filterable: true,
    model: [],
    options: [
      { id: 0, name: 'Sin IPTV' },
      { id: 1, name: 'Con IPTV' },
    ],
    align: 'left',
  },
  {
    name: 'ftth',
    label: 'Tipo',
    filterable: true,
    model: [],
    options: [
      { id: 0, name: 'Inalámbrico' },
      { id: 1, name: 'FTTH' },
    ],
    align: 'left',
  },
  { name: 'stb', label: 'STB permitidas', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const showForm = computed(() => dataViewer.get_dataViewer.showForm)
const edit = (itm) => {
  currentItem.value = itm
  dataViewer.changeShowForm(2)
}
const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2)
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
      <BaseDialog :id="currentItem" :content="InternetFormDialog" />
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

          <!--    Name    -->
          <q-td
            key="name"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.name)"
          >
            {{ props.row?.name }}
          </q-td>

          <!--    Speed     -->
          <q-td
            key="alias"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row?.alias)"
          >
            {{ props.row?.alias }}
          </q-td>

          <!--    Price     -->
          <q-td key="price" class="text-left copy-text" :props="props">
            $ {{ formatPrice(props.row?.price) }}
          </q-td>

          <!--    IPTV    -->
          <q-td key="iptv" :props="props" class="copy-text">
            <q-icon
              :name="props.row.iptv ? 'mdi-television-box' : 'mdi-web'"
              color="white"
              size="sm"
            />
          </q-td>

          <!--    FTTH    -->
          <q-td key="ftth" :props="props" class="copy-text">
            <q-icon
              :name="props.row.ftth ? 'mdi-router-network' : 'mdi-access-point'"
              color="white"
              size="sm"
            />
          </q-td>

          <!--    STB   -->
          <q-td key="stb" :props="props" class="copy-text">
            {{ props.row.allowed_stb }}
          </q-td>

          <!--    Actions    -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
                <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                  Editar info. de {{ props.row?.name }}
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
