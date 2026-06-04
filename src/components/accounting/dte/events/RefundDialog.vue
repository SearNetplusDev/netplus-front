<script setup>
import { computed, reactive, ref } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const dataViewer = useDataviewerStore()
const props = defineProps({
  data: { type: Object, required: true },
  visible: { type: Boolean, required: true },
})
const emit = defineEmits(['update:visible', 'hide-dialog'])
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
const states = reactive({
  loading: false,
})
const cancel = () => {
  emit('hide-dialog')
}
const json_dte = props.data.json
const columns = [
  {
    name: 'numItem',
    required: true,
    label: 'N°',
    align: 'left',
    field: (row) => row.numItem,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'cantidad',
    required: true,
    label: 'Cantidad',
    align: 'left',
    field: (row) => row.cantidad,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'descripcion',
    required: true,
    label: 'Descripción',
    align: 'left',
    field: (row) => row.descripcion,
    format: (val) => `${val}`,
    sortable: false,
  },
  {
    name: 'unitPrice',
    required: true,
    label: 'Precio Unitario',
    align: 'left',
    field: (row) => row.precioUni,
    format: (val) => formatMoney(val),
    sortable: false,
  },
  {
    name: 'ventaGravada',
    required: true,
    label: 'Venta Gravada',
    align: 'left',
    field: (row) => row.ventaGravada ?? row.compra,
    format: (val) => formatMoney(val),
    sortable: false,
  },
]
const formatMoney = (val) => {
  if (val === null || val === undefined || val === '') {
    return '$0.00'
  }
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(val))
}
const selected = ref([])
const getSelectedString = () => {
  return selected.value.length === 0
    ? ''
    : `${selected.value.length} ítem${selected.value.length > 1 ? 's' : ''}seleccionados de ${json_dte.cuerpoDocumento.length}`
}
const sendData = async () => {
  states.loading = true
  dataViewer.fetch({ force: true })
}
</script>

<template>
  <q-dialog
    v-model="isVisible"
    dark
    persistent
    @hide="cancel"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card class="custom-cards q-pa-xs" dark>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ props.data.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section class="text-subtitle1">
        <div class="row wrap full-width">
          <q-form greedy @submit="sendData" class="full-width">
            <div class="row wrap full-width">
              <q-table
                :rows="json_dte.cuerpoDocumento"
                :columns="columns"
                flat
                dense
                title="Selecciona los ítems a devolver"
                row-key="numItem"
                :selected-rows-label="getSelectedString"
                selection="multiple"
                v-model:selected="selected"
                class="secondary-table full-width"
                binary-state-sort
              >
                <template #body-cell-cantidad="props">
                  <q-td :props="props">
                    {{ props.row.cantidad }}

                    <q-popup-edit v-model="props.row.cantidad" buttons v-slot="scope">
                      <q-input v-model="scope.value" type="text" dense autofocus mask="###" />
                    </q-popup-edit>
                  </q-td>
                </template>
              </q-table>

              <div class="q-mt-md">Seleccionados: {{ JSON.stringify(selected) }}</div>
            </div>
          </q-form>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn icon="mdi-check" label="procesar" color="primary" type="submit" @click="sendData" />
        <q-btn icon="mdi-cancel" label="Cancelar" color="negative" @click="cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.custom-cards
  width: 50vw
  max-width: 50vw
  border-radius: 1em
</style>
