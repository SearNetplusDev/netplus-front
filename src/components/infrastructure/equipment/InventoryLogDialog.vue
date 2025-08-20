<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
})
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const isVisible = ref(props.visible)
const loading = ref(false)
const title = ref('')
const equipment = ref([])
const logs = ref([])
const columns = [
  { name: 'status', label: 'Estado', align: 'center' },
  {
    name: 'date',
    label: 'Fecha',
    align: 'left',
    field: (row) => row.execution_date,
  },
  { name: 'user', label: 'Agente', align: 'left', field: (row) => row.user?.name },
  {
    name: 'technician',
    label: 'Técnico asignado',
    align: 'left',
    field: (row) => row.technician?.user?.name,
  },
  {
    name: 'description',
    label: 'Acción',
    align: 'left',
    field: (row) => row.description,
  },
]
const initialPagination = {
  sort: 'desc',
  descending: false,
  rowsPerPage: 10,
}
const getLogs = () => {
  loading.value = true
  showLoading()
  let uri = '/api/v1/infrastructure/equipment/inventory/logs'
  let params = new FormData()
  params.append('id', props.id)
  api
    .post(uri, params)
    .then((res) => {
      equipment.value = res.data.equipment
      logs.value = res.data.equipment?.logs
      title.value = `Historial de ${equipment.value.type?.name} ${equipment.value.brand?.name} ${equipment.value.model?.name} ${equipment.value.mac_address}`
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 250)
    })
}
onMounted(() => {
  getLogs()
})
</script>

<template>
  <q-dialog
    v-model="isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="jump-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat style="width: 1000px; max-width: 100vw" class="custom-cards">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <div class="q-pa-xs">
          <q-table
            flat
            :rows="logs"
            :columns="columns"
            row-key="name"
            dark
            class="secondary-table"
            binary-state-sort
            :pagination="initialPagination"
          >
            <template v-slot:body-cell-status="props">
              <q-td key="status" :props="props">
                <q-badge
                  align="middle"
                  class="text-bold q-pa-xs"
                  :color="props.row?.status?.badge_color"
                  :label="props.row?.status?.name"
                />
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="cerrar" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
