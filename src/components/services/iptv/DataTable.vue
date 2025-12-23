<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useLoading } from 'src/utils/loader.js'
import { api } from 'src/utils/api.js'
import { useClipboard } from 'src/utils/clipboard.js'
// import { useNotifications } from 'src/utils/notification.js'
import FormDialog from 'components/services/iptv/FormDialog.vue'
import DeleteItemDialog from 'components/base/DeleteItemDialog.vue'

const props = defineProps({
  service: {
    type: Number,
    required: true,
  },
})
const { showLoading, hideLoading } = useLoading()
const { copy } = useClipboard()
// const { showNotification } = useNotifications()
const url = '/api/v1/services/equipment/iptv/'
const uiStates = reactive({
  loading: false,
  showDeleteItem: false,
  isVisible: false,
  currentItem: 0,
  iptv: false,
  allowedDevices: 0,
})
const deleteProps = ref([])
const showDeleteDialog = (id, type, brand, model, mac) => {
  uiStates.showDeleteItem = true
  deleteProps.value = {
    title: 'Desvincular equipo',
    message: `¿Deseas desvincular ${type} ${brand} ${model} con MAC ${mac}`,
    id: id,
    url: url,
  }
}
const resetShowDeleteItem = () => {
  uiStates.showDeleteItem = false
  getTvBoxes()
}
const tvBoxes = ref([])
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
    name: 'company',
    label: 'Empresa',
    align: 'left',
    field: (row) => row.equipment?.company?.name,
  },
  {
    name: 'actions',
    label: '',
    align: 'center',
  },
]
const getTvBoxes = async () => {
  uiStates.loading = true
  showLoading()
  try {
    const { data } = await api.post(`${url}list`, { service: props.service })
    tvBoxes.value = data.collection ?? []
    uiStates.iptv = data.has_iptv ?? false
    uiStates.allowedDevices = data.allowed_devices ?? 0
    return tvBoxes.value
  } catch (err) {
    console.error(err)
    // const message = err.response?.data?.message || err.message || 'Error inesperado'
    // showNotification('Error', message, 'red-10')
  } finally {
    setTimeout(() => {
      uiStates.loading = false
      hideLoading()
    }, 500)
  }
}
const refreshComponent = () => {
  uiStates.isVisible = false
  uiStates.currentItem = 0
  getTvBoxes()
}
const edit = (itm) => {
  uiStates.currentItem = itm
  uiStates.isVisible = true
}
onMounted(() => {
  getTvBoxes()
})
</script>

<template>
  <div class="fit row full-width">
    <template v-if="uiStates.iptv">
      <div class="row fit content-end justify-end">
        <template v-if="tvBoxes.length < uiStates.allowedDevices">
          <q-btn
            color="white"
            icon="add"
            flat
            :ripple="{ center: true, color: 'amber' }"
            label="agregar"
            align="around"
            @click="uiStates.isVisible = true"
          />
        </template>
      </div>

      <div class="row fit full-width content-start justify-start q-pa-md">
        <div class="col-12">
          <q-table
            :rows="tvBoxes"
            dark
            flat
            binary-state-sort
            class="secondary-table"
            :columns="columns"
            row-key="name"
            no-data-label="Sin equipos asignados"
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
                    <q-tooltip
                      transition-show="fade"
                      transition-hide="flip-left"
                      class="bg-grey-10"
                    >
                      Editar info. de {{ props.row?.equipment?.mac_address }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    color="negative"
                    icon="mdi-access-point-remove"
                    size="sm"
                    @click="
                      showDeleteDialog(
                        props.row?.id,
                        props.row.equipment?.type?.name,
                        props.row?.equipment?.brand?.name,
                        props.row?.equipment?.model?.name,
                        props.row?.equipment?.mac_address,
                      )
                    "
                  >
                    <q-tooltip
                      transition-show="fade"
                      transition-hide="flip-left"
                      class="bg-grey-10"
                    >
                      Retirar equipo con mac {{ props.row?.equipment?.mac_address }}
                    </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="text-h6 text-amber">Este servicio no posee un plan de internet con IPTV</div>
    </template>

    <template v-if="uiStates.isVisible">
      <FormDialog
        :id="uiStates.currentItem"
        :service="props.service"
        :visible="uiStates.isVisible"
        @hide="refreshComponent"
      />
    </template>

    <template v-if="uiStates.showDeleteItem">
      <DeleteItemDialog
        :data="deleteProps"
        :visible="uiStates.showDeleteItem"
        @hide-dialog="resetShowDeleteItem"
      />
    </template>
  </div>
</template>

<style scoped></style>
