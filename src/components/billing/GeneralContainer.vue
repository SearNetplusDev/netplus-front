<script setup>
import { reactive, ref } from 'vue'
import PaymentDialog from 'components/billing/payments/PaymentDialog.vue'
import PrepaymentDialog from 'components/billing/prepayments/PrepaymentDialog.vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
  client: { type: Number, required: true },
  name: { type: String, required: true },
})
const emit = defineEmits(['hide'])
const states = reactive({
  visible: props.visible,
  loading: false,
  title: `Pagos/Abonos de ${props.name}`,
})
const tab = ref('payments')
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
        <q-tabs v-model="tab" align="justify" narrow-indicator>
          <q-tab name="payments" label="Pagos" />
          <q-tab name="prepayments" label="Abonos" />
        </q-tabs>

        <q-separator class="q-my-xs" />

        <q-tab-panels v-model="tab" animated class="bg-transparent">
          <q-tab-panel name="payments">
            <payment-dialog :client="props.client" />
          </q-tab-panel>

          <q-tab-panel name="prepayments">
            <prepayment-dialog :client="props.client" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
