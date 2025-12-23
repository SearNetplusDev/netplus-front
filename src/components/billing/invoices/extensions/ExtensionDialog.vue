<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useQuasar } from 'quasar'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'
import ExtensionForm from 'components/billing/invoices/extensions/ExtensionForm.vue'

const $q = useQuasar()
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { formatLongDate } = useDateFormatter()
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
      extensions.value = data.data?.extensions ?? []
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
const edit = (id) => {
  ui_states.form_visible = true
  ui_states.current_extension = id
}
const reset_form = async () => {
  ui_states.current_extension = 0
  ui_states.form_visible = false
  await get_data()
}
const show_reason = (text) => {
  $q.dialog({
    title: 'Razón de la extensión',
    message: text,
    color: 'white',
  })
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
          :disable="extensions.length >= 2"
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
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="status" :props="props">
                <q-badge
                  :color="props.row.status?.id ? 'primary' : 'red-10'"
                  :label="props.row.status?.id ? 'Aplicada' : 'Inactiva'"
                  class="text-center text-weight-bold q-py-xs"
                />
              </q-td>

              <q-td key="previous_date" :props="props">
                {{ formatLongDate(props.row.previous_due_date) }}
              </q-td>

              <q-td key="extended_date" :props="props">
                {{ formatLongDate(props.row.extended_due_date) }}
              </q-td>

              <q-td key="user" :props="props">
                {{ props.row.user?.name }}
              </q-td>

              <q-td key="actions" :props="props">
                <q-btn
                  size="sm"
                  class="q-mx-sm"
                  icon="mdi-message-reply-text"
                  flat
                  @click="show_reason(props.row.reason)"
                />
                <q-btn size="sm" color="primary" icon="mdi-pencil" @click="edit(props.row.id)" />
              </q-td>
            </q-tr>
          </template>
        </q-table>
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
