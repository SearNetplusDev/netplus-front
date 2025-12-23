<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useClipboard } from 'src/utils/clipboard.js'
import ReferencesForm from 'components/clients/data/general/references/ReferencesForm.vue'

const { showLoading, hideLoading } = useLoading()
const { copy } = useClipboard()
const props = defineProps({
  client: Number,
})
const url = '/api/v1/clients/references/data'
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
    label: 'Name',
    align: 'left',
    field: (row) => row?.name,
  },
  {
    name: 'dui',
    label: 'DUI',
    align: 'center',
    // field: (row) => row?.dui,
  },
  {
    name: 'mobile',
    label: 'Celular',
    align: 'center',
    // field: (row) => row?.dui,
  },
  {
    name: 'relation',
    label: 'Parentesco',
    align: 'left',
    field: (row) => row?.kinship?.name,
  },
  { name: 'actions', label: '', align: 'center' },
]
const references = ref([])
const isVisible = ref(false)
const currentRef = ref(0)
const getReferences = () => {
  showLoading()
  let data = new FormData()
  data.append('clientID', props.client)
  api
    .post(`${url}`, data)
    .then((res) => {
      references.value = res.data.response
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
  currentRef.value = 0
  getReferences()
}
const edit = (id) => {
  isVisible.value = true
  currentRef.value = id
}
onMounted(() => {
  getReferences()
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
        <q-breadcrumbs-el label="Referencias Personales" icon="mdi-account-multiple-plus" />
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
          :columns="columns"
          :rows="references"
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

          <template v-slot:body-cell-dui="props">
            <q-td key="dui" :props="props" @click="copy(props.row?.dui)" class="copy-text">
              {{ props.row?.dui }}
            </q-td>
          </template>

          <template v-slot:body-cell-mobile="props">
            <q-td key="dui" :props="props" @click="copy(props.row?.mobile)" class="copy-text">
              {{ props.row?.mobile }}
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
      <ReferencesForm
        :client="props.client"
        :visible="isVisible"
        :referenceID="currentRef"
        @hide="refreshComponent"
      />
    </template>
  </div>
</template>

<style scoped></style>
