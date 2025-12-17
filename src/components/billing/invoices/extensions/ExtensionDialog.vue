<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { api } from 'boot/axios.js'
import ExtensionForm from 'components/billing/invoices/extensions/ExtensionForm.vue'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  invoice: {
    type: Number,
    required: true,
  },
})
const ui_states = reactive({
  loading: false,
  title: 'No hay nada que ver por acá.',
  current_extension: 0,
  form_visible: false,
})
const is_visible = ref(props.visible)
const uri = '/api/v1/billing/extensions/data'
const columns = [
  { name: 'status', label: 'Estado', align: 'center' },
  { name: 'previous_date', label: 'Fecha de expiración', align: 'left' },
  { name: 'extended_date', label: 'Fecha extensión', align: 'left' },
  { name: 'user', label: 'Asignado por', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
]
const extensions = ref([])
const get_data = async () => {
  ui_states.loading = true
  ui_states.title = 'Procesando datos, espera un momento...'
  showLoading()

  try {
    const { data } = await api.post(uri, { _method: 'POST', invoice_id: props.invoice })
    if (data) {
      ui_states.title = `Extensiones de la factura ${data.data?.period}`
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
const calling_form = () => {
  ui_states.form_visible = true
}
const reset_form = async () => {
  ui_states.current_extension = 0
  ui_states.form_visible = false
  await get_data()
}
onMounted(async () => {
  await get_data()
})
</script>
<template>
  <q-dialog
    v-model="is_visible"
    persistent
    transition-show="slide_up"
    transition-hide="slide-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat class="custom-cards" style="width: 900px; max-width: 80vw">
      <q-card-section class="row items-center q-pb-none">
        <q-btn
          color="primary"
          label="Asignar extensión"
          @click="calling_form"
          v-if="!ui_states.form_visible"
        />
        <q-space />
        <div class="text-h6 text-white">{{ ui_states.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section v-if="!ui_states.form_visible">
        <q-table
          flat
          binary-state-sort
          class="secondary-table"
          :columns="columns"
          :rows="extensions"
          no-data-label="Sin extensiones asignadas."
        ></q-table>
      </q-card-section>

      <q-card-section v-if="ui_states.form_visible">
        <extension-form
          :invoice="props.invoice"
          :extension="ui_states.current_extension"
          @cancel="reset_form"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style></style>
