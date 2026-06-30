<script setup>
import { computed } from 'vue'
import { useMoneyFormatter } from 'src/utils/composables/accounting/useMoneyFormatter.js'

const { formatMoney } = useMoneyFormatter()
const props = defineProps({
  data: { type: Object, required: true },
  visible: { type: Boolean, required: true },
})
const emit = defineEmits(['update:visible', 'hide-dialog'])
const isVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})
const cancel = () => {
  isVisible.value = false
  emit('hide-dialog')
}
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

      <q-card-section>
        <div class="row wrap full-width">
          <q-table
            flat
            dense
            class="secondary-table full-width"
            binary-state-sort
            :rows="props.data.json.cuerpoDocumento"
            :columns="columns"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn icon="mdi-cancel" label="cerrar" color="negative" @click="cancel" />
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
