<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import DocumentForm from 'components/clients/data/general/documents/DocumentForm.vue'
import { copyToClipboard } from 'quasar'
import { useNotifications } from 'src/utils/notification.js'

const { showLoading, hideLoading } = useLoading()
const props = defineProps({
  client: Number,
})
const url = '/api/v1/clients/documents/data'
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
    label: 'Tipo de documento',
    align: 'center',
    // field: (row) => row.document_type?.name,
  },
  {
    name: 'number',
    label: 'Número',
    align: 'center',
  },
  { name: 'actions', label: '', align: 'center' },
]
const documents = ref([])
const isVisible = ref(false)
const currentDocument = ref(0)
const { showNotification } = useNotifications()
const copy = (txt) => {
  copyToClipboard(txt)
    .then(() => {
      showNotification('Elemento copiado', `${txt} agregado al portapapeles`, 'blue-grey-10')
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
}
const getDocuments = () => {
  showLoading()
  let data = new FormData()
  data.append('clientID', props.client)
  api
    .post(`${url}`, data)
    .then((res) => {
      documents.value = res.data.response
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      setTimeout(() => {
        hideLoading()
      }, 100)
    })
}
const refreshComponent = () => {
  isVisible.value = false
  currentDocument.value = 0
  getDocuments()
}
const edit = (id) => {
  isVisible.value = true
  currentDocument.value = id
}
onMounted(() => {
  getDocuments()
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
        <q-breadcrumbs-el label="Documentos personales" icon="mdi-card-account-details" />
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

    <div class="row full-width fit content-start justify-start q-pa-md">
      <div class="col-12">
        <q-table
          dark
          flat
          binary-state-sort
          class="secondary-table"
          :rows="documents"
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
                class="text-bold"
                color="indigo"
                :label="props.row.document_type?.name"
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
      <DocumentForm
        :client="props.client"
        :visible="isVisible"
        :documentID="currentDocument"
        @hide="refreshComponent"
      />
    </template>
  </div>
</template>

<style scoped></style>
