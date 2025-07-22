<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useNotifications } from 'src/utils/notification.js'
import PhonesForm from 'components/clients/data/general/phones/PhonesForm.vue'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { copy } = useClipboard()
const props = defineProps({
  client: Number,
})
const url = '/api/v1/clients/phones/data'
const columns = [
  {
    name: 'id',
    label: 'ID',
    align: 'center',
  },
  {
    name: 'status',
    label: 'Estado',
    align: 'center',
  },
  {
    name: 'type',
    label: 'Tipo de teléfono',
    align: 'center',
  },
  {
    name: 'country',
    label: 'País',
    align: 'center',
    field: (row) => row?.country?.es_name,
  },
  {
    name: 'number',
    label: 'Número',
    align: 'center',
  },
  { name: 'actions', label: '', align: 'center' },
]
const phones = ref([])
const isVisible = ref(false)
const currentNumber = ref(0)

const getPhones = () => {
  showLoading()
  let data = new FormData()
  data.append('clientID', props.client)
  api
    .post(`${url}`, data)
    .then((res) => {
      phones.value = res.data.response
    })
    .catch((err) => {
      console.error(err)
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        hideLoading()
      }, 100)
    })
}
const refreshComponent = () => {
  isVisible.value = false
  currentNumber.value = 0
  getPhones()
}
const edit = (id) => {
  isVisible.value = true
  currentNumber.value = id
}
onMounted(() => {
  getPhones()
})
</script>

<template>
  <div class="fit row">
    <div class="col-12">
      <q-breadcrumbs class="text-white" gutter="md" active-color="white">
        <template v-slot:separator>
          <q-icon size="1.5em" name="chevron_right" color="white" />
        </template>
        <q-breadcrumbs-el label="Clientes" icon="mdi-account" />
        <q-breadcrumbs-el label="Teléfonos" icon="mdi-card-account-phone" />
      </q-breadcrumbs>

      <q-separator dark class="q-my-md" />
    </div>

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
          :rows="phones"
          :columns="columns"
          row-key="name"
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

          <template v-slot:body-cell-status="props">
            <q-td key="status" :props="props">
              <div class="text-center">
                <q-badge
                  align="middle"
                  class="text-bold"
                  :color="props.row.status?.id ? 'primary' : 'red-10'"
                  :label="props.row.status?.name"
                />
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-type="props">
            <q-td key="type" :props="props">
              <q-badge
                align="middle"
                class="text-bold q-pa-xs"
                color="indigo"
                :label="props.row.phone_type?.name"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-number="props">
            <q-td key="number" :props="props" class="copy-text">
              <div @click="copy(props.row?.number)">
                {{ props.row?.number }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td key="actions" :props="props">
              <q-btn-group>
                <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
                  <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-9">
                    Editar info. de {{ props.row?.number }}
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <template v-if="isVisible">
      <PhonesForm
        :client="props.client"
        :visible="isVisible"
        :phoneID="currentNumber"
        @hide="refreshComponent"
      />
    </template>
  </div>
</template>

<style scoped></style>
