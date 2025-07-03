<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import DocumentForm from 'components/clients/data/general/documents/DocumentForm.vue'

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
    align: 'left',
  },
  {
    name: 'number',
    label: 'Número',
    align: 'left',
  },
  { name: 'actions', label: '', align: 'center' },
]
const documents = ref([])
const isVisible = ref(false)
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
      }, 1000)
    })
}
const refreshComponent = () => {
  isVisible.value = false
  getDocuments()
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
          class="custom-table"
          :rows="documents"
          :columns="columns"
          row-key="name"
        />
      </div>
    </div>

    <template v-if="isVisible">
      <DocumentForm :client="props.client" :visible="isVisible" @hide="refreshComponent" />
    </template>
  </div>
</template>

<style scoped></style>
