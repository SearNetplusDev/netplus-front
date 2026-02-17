<script setup>
import { useClipboard } from 'src/utils/clipboard.js'
// import { ref } from 'vue'

const props = defineProps({
  data: Object,
})
const { copy } = useClipboard()
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
    name: 'profile',
    label: 'Plan de internet',
    align: 'center',
    field: (row) => row.internet?.profile?.name,
  },
  {
    name: 'price',
    label: 'Precio (USD)',
    align: 'center',
    field: (row) => row.internet?.profile?.price,
    format: (val) => '$ ' + (val != null ? Number(val).toFixed(2) : ''),
  },
  {
    name: 'user',
    label: 'Usuario PPPoe',
    align: 'center',
  },
  {
    name: 'install_date',
    label: 'Fecha de instalación',
    align: 'center',
    field: (row) => row.installation_date,
  },
  {
    name: 'node',
    label: 'Nodo',
    align: 'center',
    field: (row) => row.node?.name,
  },
  {
    name: 'equipment',
    label: 'Equipo',
    align: 'center',
    field: (row) => row.equipment?.name,
  },
  {
    name: 'address',
    label: 'Dirección',
    align: 'center',
    field: (row) => row.address,
  },
  {
    name: 'state',
    label: 'Departamento',
    align: 'center',
    field: (row) => row.state?.name,
  },
  {
    name: 'district',
    label: 'Distrito',
    align: 'center',
    field: (row) => row.district?.name,
  },
  { name: 'actions', label: '', align: 'center' },
]
// const service = ref([])
const edit = (itm) => {
  emit('view-service', itm)
}
const emit = defineEmits(['view-service'])
</script>

<template>
  <div class="fit row">
    <div class="row full-width content-start justify-center q-pa-md">
      <div class="col-12">
        <q-table
          dark
          flat
          binary-state-sort
          class="secondary-table"
          :columns="columns"
          :rows="props.data"
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

          <template v-slot:body-cell-user="props">
            <q-td key="user" :props="props" class="copy-text">
              <div class="text-center" @click="copy(props.row?.internet?.user)">
                {{ props.row?.internet?.user }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td key="actions" :props="props">
              <q-btn-group>
                <q-btn color="indigo" icon="mdi-eye" size="sm" @click="edit(props.row)">
                  <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-9">
                    Datos del servicio
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
