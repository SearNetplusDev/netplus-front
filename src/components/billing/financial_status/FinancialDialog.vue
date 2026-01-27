<script setup>
import { reactive } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
  visible: { type: Boolean, required: true },
})
const emit = defineEmits(['hide'])
const states = reactive({
  loading: false,
  title: `Estado financiero de ${props.data.name} ${props.data.surname}`,
  visible: props.visible,
})
const moneyFormat = (amount) => {
  return parseFloat(amount).toFixed(2)
}
const financialStatus = [
  {
    title: 'Saldo Deudor',
    data: `$ ${moneyFormat(props.data.financial_status?.current_balance ?? 0)}`,
  },
  {
    title: 'Saldo Vencido',
    data: `$ ${moneyFormat(props.data.financial_status?.overdue_balance ?? 0)}`,
  },
  {
    title: 'Saldo Acreedor',
    data: `$ ${moneyFormat(props.data.financial_status?.prepayment_balance ?? 0)}`,
  },
  {
    title: 'Total Pagado',
    data: `$ ${moneyFormat(props.data.financial_status?.total_paid_amount ?? 0)}`,
  },
  {
    title: 'Facturas Generadas',
    data: `${props.data.financial_status?.total_invoices ?? 0}`,
  },
  {
    title: 'Facturas Pagadas',
    data: `${props.data.financial_status?.paid_invoices ?? 0}`,
  },
  {
    title: 'Facturas Pendientes',
    data: `${props.data.financial_status?.pending_invoices ?? 0}`,
  },
  {
    title: 'Facturas Vencidas',
    data: `${props.data.financial_status?.overdue_invoices ?? 0}`,
  },
  {
    title: 'Estado financiero',
    data: `${props.data.financial_status?.status?.name ?? 'Sin estado financiero'}`,
  },
]
</script>

<template>
  <q-dialog
    v-model="states.visible"
    persistent
    transition-show="slide-up"
    transition-hide="slide_down"
    backdrop-filter="blur(4px) saturate(150%)"
    maximized
    @hide="emit('hide')"
  >
    <q-card flat class="custom-cards" style="width: 95vw !important">
      <q-card-section class="row items-center q-header">
        <div class="text-h6 text-white">{{ states.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-pa-md full-width">
          <div class="masonry">
            <q-card
              v-for="(row, index) in financialStatus"
              :key="index"
              class="masonry-item"
              flat
              style="background: linear-gradient(15deg, #1e3c72, #2a5298)"
            >
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="text-subtitle1">{{ row.title }}: {{ row.data }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.masonry
  column-count: 3
  column-gap: 16px

.masonry-item
  break-inside: avoid
  margin-bottom: 16px

@media (max-width: 1200px)
  .masonry
    column-count: 3

@media (max-width: 900px)
  .masonry
    column-count: 2

@media (max-width: 600px)
  .masonry
    column-count: 1
</style>
