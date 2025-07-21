<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { useClipboard } from 'src/utils/clipboard.js'
import ContactForm from 'components/infrastructure/network/nodes/contacts/ContactForm.vue'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { copy } = useClipboard()
const props = defineProps({
  node: Number,
})
const url = '/api/v1/infrastructure/network/nodes/contacts/'
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
    name: 'name',
    label: 'Nombre',
    align: 'left',
    field: (row) => row.name,
  },
  {
    name: 'phone',
    label: 'Teléfono',
    align: 'center',
    field: (row) => row.phone_number,
  },
  {
    name: 'contract_begin',
    label: 'Inicio de contrato',
    align: 'left',
    field: (row) => row.initial_contract_date,
  },
  {
    name: 'contract_end',
    label: 'Fin de contrato',
    align: 'left',
    field: (row) => row.final_contract_date,
  },
  {
    name: 'difference',
    label: 'Días restantes de contrato',
    align: 'center',
    field: (row) => row.diff_days,
  },
  { name: 'actions', label: '', align: 'center' },
]
const contacts = ref([])
const isVisible = ref(false)
const currentContact = ref(0)
const getData = () => {
  showLoading()
  let data = new FormData()
  data.append('node', props.node)
  api
    .post(`${url}data`, data)
    .then((res) => {
      contacts.value = res.data.response
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
  currentContact.value = 0
  getData()
}
const edit = (id) => {
  isVisible.value = true
  currentContact.value = id
}
onMounted(() => {
  getData()
})
</script>

<template>
  <div class="fit row">
    <div class="col-12">
      <q-breadcrumbs class="text-white" gutter="md" active-color="white">
        <template v-slot:separator>
          <q-icon size="1.5em" name="chevron_right" color="white" />
        </template>
        <q-breadcrumbs-el label="Infraestructura" icon="mdi-office-building-cog-outline" />
        <q-breadcrumbs-el label="Redes" icon="mdi-lan-pending" />
        <q-breadcrumbs-el label="Nodos" icon="cell_tower" />
        <q-breadcrumbs-el label="Contactos" icon="mdi-clipboard-account-outline" />
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
          :columns="columns"
          :rows="contacts"
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

          <template v-slot:body-cell-phone="props">
            <q-td key="phone" :props="props" class="copy-text">
              <div class="text-center">
                <div @click="copy(props.row?.phone_number)">
                  {{ props.row?.phone_number }}
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td key="actions" :props="props">
              <q-btn-group>
                <q-btn color="primary" icon="edit" size="sm" @click="edit(props.row?.id)">
                  <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-9">
                    Editar info. de {{ props.row?.name }}
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <template v-if="isVisible">
      <ContactForm
        :node="props.node"
        :visible="isVisible"
        :contactID="currentContact"
        @hide="refreshComponent"
      />
    </template>
  </div>
</template>

<style scoped></style>
