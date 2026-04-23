<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useNotifications } from 'src/utils/notification.js'
import PaymentForm from 'components/billing/payments/PaymentForm.vue'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { copy } = useClipboard()
const { formatLongDate } = useDateFormatter()
const props = defineProps({
  client: { type: Number, required: true },
  dte_type: { type: Number, required: true },
})
const ui_states = reactive({
  loading: false,
  current_item: 0,
  visible_form: false,
})
const columns = [
  { name: 'id', label: 'ID', align: 'center' },
  { name: 'status', label: 'Estado', align: 'center' },
  { name: 'method', label: 'Método de pago', align: 'center' },
  { name: 'amount', label: 'Cantidad pagada', align: 'left' },
  { name: 'date', label: 'Fecha de pago', align: 'left' },
  { name: 'user', label: 'Ingresado por', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const payments_data = ref([])
const url = `api/v1/billing/payments/list`
const get_data = async () => {
  ui_states.loading = true
  showLoading()

  try {
    const {
      data: { list },
    } = await api.post(url, { client: props.client, _method: 'POST' })
    if (list) {
      payments_data.value = list
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      ui_states.loading = false
      hideLoading()
    }, 150)
  }
}
const refresh_dialog = async () => {
  ui_states.current_item = 0
  ui_states.visible_form = false
  await get_data()
}
const generate_dte = async (payment_id) => {
  ui_states.loading = true
  showLoading()
  const uri = `api/v1/accounting/dte/create/${props.dte_type}`
  try {
    const { data } = await api.post(uri, { payment: payment_id, _method: 'POST' })
    const payment = payments_data.value.find((p) => p.id === payment_id)
    if (payment) payment.dte = data
    showNotification('Código Generación', data.control_number, 'grey-10')
    showNotification('Número de Control', data.generation_code, 'grey-10')
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      ui_states.loading = false
      hideLoading()
    }, 150)
  }
}
onMounted(async () => {
  await get_data()
})
</script>

<template>
  <q-card dark flat class="custom-cards" style="border: none !important">
    <q-card-section>
      <div class="row fit content-end justify-end">
        <q-btn
          color="white"
          icon="add"
          flat
          :ripple="{ center: true, color: 'amber' }"
          label="registrar pago"
          align="around"
          @click="ui_states.visible_form = true"
        />
      </div>
    </q-card-section>

    <q-card-section>
      <div class="row fit full-width content-start justify-start q-pa-md">
        <div class="col-12">
          <q-table
            dark
            flat
            binary-state-sort
            class="secondary-table"
            :columns="columns"
            :rows="payments_data"
            row-key="name"
            no-data-label="Sin pagos registrados"
          >
            <template v-slot:body-cell-id="props">
              <q-td key="id" :props="props" class="copy-text">
                <div class="text-center">
                  <span @click="copy(props.row.id)">{{ props.row.id }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td key="status" :props="props">
                <q-badge
                  class="text-bold q-pa-xs"
                  align="middle"
                  :color="props.row.status?.id ? 'primary' : 'red-10'"
                  :label="props.row.status?.name"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-method="props">
              <q-td key="method" :props="props">
                <q-badge
                  class="text-bold q-pa-xs"
                  align="middle"
                  :label="props.row.payment_method?.name"
                  :style="{ backgroundColor: props.row.payment_method?.badge_color, color: '#FFF' }"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-amount="props">
              <q-td key="amount" :props="props"> $ {{ props.row.amount }} </q-td>
            </template>

            <template v-slot:body-cell-date="props">
              <q-td key="date" :props="props"> {{ formatLongDate(props.row.payment_date) }} </q-td>
            </template>

            <template v-slot:body-cell-user="props">
              <q-td key="user" :props="props">{{ props.row.user?.name ?? 'N/A' }}</q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td key="actions" :props="props">
                <q-btn-group>
                  <q-btn
                    color="blue-grey-7"
                    icon="mdi-receipt-text-send-outline"
                    size="sm"
                    :disable="!!props.row.dte"
                    @click="generate_dte(props.row.id)"
                  >
                    <q-tooltip
                      transition-show="fade"
                      transition-hide="slide-down"
                      class="bg-grey-10"
                    >
                      Generar DTE
                    </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </q-card-section>
  </q-card>

  <template v-if="ui_states.visible_form">
    <payment-form :client="props.client" :visible="ui_states.visible_form" @hide="refresh_dialog" />
  </template>
</template>

<style lang="sass" scoped></style>
