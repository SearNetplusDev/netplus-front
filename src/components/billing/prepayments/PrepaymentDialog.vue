<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useNotifications } from 'src/utils/notification.js'
import PrepaymentForm from 'components/billing/prepayments/PrepaymentForm.vue'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { copy } = useClipboard()
const { formatLongDate } = useDateFormatter()
const props = defineProps({
  visible: { type: Boolean, required: true },
  client: { type: Number, required: true },
  name: { type: String, required: true },
})
const emit = defineEmits(['hide'])
const states = reactive({
  is_visible: props.visible,
  loading: false,
  title: `Abonos de ${props.name}`,
})
const columns = [
  { name: 'id', label: 'ID', align: 'center' },
  { name: 'status', label: 'Estado', align: 'center' },
  { name: 'method', label: 'Método de pago', align: 'center' },
  { name: 'amount', label: 'Cantidad inicial', align: 'left' },
  { name: 'remaining', label: 'Saldo restante', align: 'left' },
  { name: 'date', label: 'Fecha de registro', align: 'left' },
  { name: 'user', label: 'Usuario', align: 'left' },
]
const prepaymentsData = ref([])
const visibleForm = ref(false)
const url = `api/v1/billing/prepayments/list`
const getData = async () => {
  states.loading = true
  showLoading()
  try {
    const {
      data: { list },
    } = await api.post(`${url}`, { client: props.client, _method: 'POST' })
    if (list) {
      prepaymentsData.value = list
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      states.loading = false
      hideLoading()
    }, 150)
  }
}
const refreshDialog = () => {
  visibleForm.value = false
  getData()
}
onMounted(async () => {
  await getData()
})
</script>

<template>
  <q-dialog
    v-model="states.is_visible"
    persistent
    transition-show="slide-up"
    transition-hide="slide_down"
    backdrop-filter="blur(4px) saturate(150%)"
    maximized
    @hide="emit('hide')"
  >
    <q-card dark flat class="custom-cards" style="width: 95vw !important">
      <q-card-section class="row items-center q-header">
        <div class="text-h6 text-white">{{ states.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row fit content-end justify-end">
          <q-btn
            color="white"
            icon="add"
            flat
            :ripple="{ center: true, color: 'amber' }"
            label="agregar abono"
            align="around"
            @click="visibleForm = true"
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
              :rows="prepaymentsData"
              row-key="name"
              no-data-label="Sin abonos registrados"
            >
              <template v-slot:body-cell-id="props">
                <q-td key="id" :props="props" class="copy-text">
                  <div class="text-center">
                    <div @click="copy(props.row.id)">
                      {{ props.row.id }}
                    </div>
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
                <q-td key="status" :props="props">
                  <q-badge
                    class="text-bold q-pa-xs"
                    align="middle"
                    :label="props.row.payment_method?.name"
                    :style="{
                      backgroundColor: props.row.payment_method?.badge_color,
                      color: '#fff',
                    }"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-amount="props">
                <q-td key="amount" :props="props"> $ {{ props.row.amount }} </q-td>
              </template>

              <template v-slot:body-cell-remaining="props">
                <q-td key="remaining" :props="props"> $ {{ props.row.remaining_amount }}</q-td>
              </template>

              <template v-slot:body-cell-date="props">
                <q-td key="date" :props="props">{{ formatLongDate(props.row.payment_date) }}</q-td>
              </template>

              <template v-slot:body-cell-user="props">
                <q-td key="user" :props="props">
                  {{ props.row.user?.name ?? 'N/A' }}
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <template v-if="visibleForm">
      <prepayment-form :client="props.client" :visible="visibleForm" @hide="refreshDialog" />
    </template>
  </q-dialog>
</template>

<style scoped></style>
