<script setup>
import { onMounted, ref } from 'vue'
import { useLoading } from 'src/utils/loader.js'
import { api } from 'boot/axios.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useNotifications } from 'src/utils/notification.js'

const props = defineProps({
  service: {
    type: Number,
    required: true,
  },
})
const { showLoading, hideLoading } = useLoading()
const { copy } = useClipboard()
const { showNotification } = useNotifications()
const loading = ref(false)
const url = '/api/v1/services/equipment/'
const equipment = ref([])
const columns = [
  {
    name: 'id',
    label: 'ID',
    align: 'center',
  },
  {
    name: 'type',
    label: 'Tipo de equipo',
    align: 'left',
    field: (row) => row.equipment?.type?.name,
  },
  {
    name: 'brand',
    label: 'Marca',
    align: 'left',
    field: (row) => row.equipment?.brand?.name,
  },
  {
    name: 'model',
    label: 'Modelo',
    align: 'left',
    field: (row) => row.equipment?.model?.name,
  },
  {
    name: 'mac',
    label: 'MAC',
    align: 'left',
  },
  {
    name: 'serial',
    label: 'Serial',
    align: 'left',
  },
  {
    name: 'actions',
    label: '',
    align: 'center',
  },
]
const isVisible = ref(false)
const getEquipment = () => {
  loading.value = true
  showLoading()
  let params = new FormData()
  params.append('service', props.service)
  api
    .post(`${url}list`, params)
    .then((res) => {
      equipment.value = res.data.equipment
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 300)
    })
}
onMounted(() => {
  getEquipment()
})
</script>
<template>
  <div class="fit row full-width">
    <div class="row fit content-end justify-end">
      <q-btn
        color="white"
        icon="add"
        flat
        :ripple="{ center: true, color: 'amber' }"
        label="agregar"
        align="around"
        @click="isVisible = true"
      />
    </div>

    <div class="row fit full-width content-start justify-start q-pa-md">
      <div class="col-12">
        <q-table
          dark
          flat
          binary-state-sort
          class="secondary-table"
          :columns="columns"
          :rows="equipment"
          row-key="name"
          no-data-label="No hay equipos asignados a este servicio"
        >
          <template v-slot:body-cell-id="props">
            <q-td key="id" :props="props" class="copy-text">
              <div class="text-center">
                <div @click="copy(props.row?.id)">
                  {{ props.row?.id }}
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-mac="props">
            <q-td key="id" :props="props" class="copy-text text-left">
              <div @click="copy(props.row?.equipment?.mac_address)">
                {{ props.row?.equipment?.mac_address }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-serial="props">
            <q-td key="id" :props="props" class="copy-text text-left">
              <div @click="copy(props.row?.equipment?.serial_number)">
                {{ props.row?.equipment?.serial_number }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td key="actions" :props="props">
              <q-btn-group>
                <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
                  <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-9">
                    Editar info. del equipo con mac {{ props.row?.mac_address }}
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
