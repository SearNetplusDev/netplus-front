<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
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
const json_dte = reactive(JSON.parse(JSON.stringify(props.data.json)))
const originalQuantities = {}
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
    label: 'Total',
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
const onSaveAmount = (row, newVal) => {
  const parsed = parseInt(newVal, 10)
  const max = originalQuantities[row.numItem]

  if (isNaN(parsed) || parsed <= 0 || parsed > max) {
    row.cantidad = String(max)
    return
  }

  row.cantidad = String(parsed)

  const unitPrice = Number(row.precioUni)
  const discount = Number(row.montoDescu ?? 0)
  const montoCalculado = parsed * unitPrice - discount

  if (row.ventaGravada !== undefined) {
    row.ventaGravada = Math.round(montoCalculado * 100) / 100
  } else if (row.compra !== undefined) {
    row.compra = Math.round(montoCalculado * 100) / 100
  }
}
const quantityRule = (row) => [
  (val) => /^\d+$/.test(val) || 'Solo números enteros',
  (val) => Number(val) > 0 || 'Debe ser mayor a 0',
  (val) =>
    Number(val) <= originalQuantities[row.numItem] || `Máximo: ${originalQuantities[row.numItem]}`,
]
const onlyIntNumbers = (e) => {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
  if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
    e.preventDefault()
  }
}
const canSave = (row, val) => {
  const parsed = parseInt(val, 10)
  const max = originalQuantities[row.numItem]
  const isSelected = selected.value.some((s) => s.numItem === row.numItem)
  return !isNaN(parsed) && parsed > 0 && parsed <= max && isSelected
}
const totalSeleccionado = computed(() => {
  return selected.value.reduce((acc, row) => {
    const valor = Number(row.ventaGravada ?? row.compra ?? 0)
    return acc + valor
  }, 0)
})
const selected = ref([])
const getSelectedString = () => {
  return selected.value.length === 0
    ? ''
    : `${selected.value.length} ítem${selected.value.length > 1 ? 's' : ''} seleccionados de ${json_dte.cuerpoDocumento.length}`
}
const sendData = async () => {
  states.loading = true
  dataViewer.fetch({ force: true })
}
onMounted(() => {
  json_dte.cuerpoDocumento.forEach((row) => {
    originalQuantities[row.numItem] = Number(row.cantidad)
  })
})
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

                    <q-popup-edit
                      v-model="props.row.cantidad"
                      label-cancel="cancelar"
                      @save="(newVal) => onSaveAmount(props.row, newVal)"
                      v-slot="scope"
                    >
                      <q-input
                        v-model="scope.value"
                        type="text"
                        dense
                        autofocus
                        :rules="quantityRule(props.row)"
                        :hint="`Máximo: ${originalQuantities[props.row.numItem]}`"
                        @keydown="onlyIntNumbers"
                      />

                      <div class="row justify-end q-gutter-sm q-mt-sm">
                        <q-btn flat dense label="cancelar" color="negative" @click="scope.cancel" />
                        <q-btn
                          flat
                          dense
                          label="guardar"
                          color="primary"
                          :disable="!canSave(props.row, scope.value)"
                          @click="scope.set"
                        />
                      </div>
                    </q-popup-edit>
                  </q-td>
                </template>
              </q-table>

              <div class="text-subtitle1 q-pt-sm">
                Total a devolver: {{ formatMoney(totalSeleccionado) }}
              </div>
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
