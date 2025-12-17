<script setup>
import { reactive, watch } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import {
  buildFormData,
  resetFieldErrors,
  handleSubmissionError,
} from 'src/utils/composables/useFormHandler.js'
import LocaleEs from 'src/utils/composables/localeEs.js'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { validationRules, createField, createToggle } = useFields()
const props = defineProps({
  invoice: {
    type: Number,
    required: true,
  },
  extension: {
    type: Number,
    required: true,
  },
})
const emit = defineEmits(['cancel'])
const uri = '/api/v1/billing/extensions/'
const ui_states = reactive({
  loading: false,
})
const locale = LocaleEs
const fields = reactive({
  previous_due_date: createField(
    'Fecha de vencimiento',
    'date',
    [validationRules.text_required],
    true,
  ),
  days: createField(
    'Días asignados',
    'text',
    [validationRules.text_required, validationRules.extension_days],
    false,
    '#',
  ),
  reason: createField('Observaciones', 'textarea', [validationRules.text_required]),
  status: createToggle('Estado'),
})
const { normalFields, textAreaFields } = useFieldFilters(fields)
const get_invoice_due_date = async () => {
  ui_states.loading = true
  showLoading()
  try {
    const { data } = await api.get(`/api/v1/billing/invoices/${props.invoice}/due-date`)
    if (data?.due_date) fields.previous_due_date.data = data?.due_date
  } catch (err) {
    showNotification('Error', err.response?.data?.message ?? err.message, 'red-10')
  } finally {
    setTimeout(() => {
      ui_states.loading = false
      hideLoading()
    }, 150)
  }
}
const get_data = async () => {
  ui_states.loading = true
  showLoading()

  try {
    const { data } = await api.post(`${uri}${props.extension}`, { _method: 'GET' })
    if (data) {
      let item = data.extension
      fields.previous_due_date.data = item.previous_due_date
      fields.days.data = item.days
      fields.reason.data = item.reason
      fields.status.data = item.status_id
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
const send_data = async () => {
  ui_states.loading = true
  showLoading()
  resetFieldErrors(fields)
  let request = props.extension > 0 ? `${uri}${props.extension}` : uri
  let method = props.extension > 0 ? 'PUT' : 'POST'
  let params = buildFormData(fields, { _method: method, invoice: props.invoice })
  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Éxito', 'Extensión asignada correctamente', 'blue-grey-10')
      emit('cancel')
    } else {
      showNotification('Error', 'Algo ha salido mal.', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
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
watch(
  () => props.extension,
  async (val) => {
    resetFieldErrors(fields)

    if (val > 0) {
      await get_data()
    } else {
      await get_invoice_due_date()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="q-pa-xs">
    <q-form greedy @submit="send_data">
      <div class="row wrap full-width justify-start items-center content-start">
        <div
          class="col-xs-12 col-sm-12 col-md-4 col-lg-4 q-pa-sm"
          v-for="(field, index) in normalFields"
          :key="index"
        >
          <template v-if="field.type === 'date'">
            <q-input
              dark
              dense
              outlined
              v-model="field.data"
              v-if="!ui_states.loading"
              :rules="field.rules"
              :label="field.label"
              :error="field.error"
              :error-message="field['error-message']"
              :disable="field.disabled"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transiton-show="scale" transition-hide="scale">
                    <q-date v-model="field.data" mask="YYYY-MM-DD" :locale="locale" color="blue-10">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="white" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </template>

          <template v-if="field.type === 'text'">
            <q-input
              dense
              dark
              outlined
              clearable
              lazy-rules
              v-model="field.data"
              v-if="!ui_states.loading"
              :mask="field.mask"
              :rules="field.rules"
              :label="field.label"
              :error="field.error"
              :error-message="field['error-message']"
              :disable="field.disabled"
            />
          </template>

          <template v-if="field.type === 'toggle'">
            <q-toggle
              v-model="field.data"
              :label="field.label"
              checked-icon="check"
              unchecked-icon="clear"
              size="lg"
              color="primary"
              v-if="!ui_states.loading"
              :error="fields.status.error"
              :error-message="fields.status['error-message']"
            />
          </template>

          <q-skeleton
            v-if="ui_states.loading"
            class="q-my-xs"
            dark
            animation="fade"
            type="QInput"
          />
        </div>
      </div>

      <div class="row wrap full-width justify-start items-center content-start">
        <div
          class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm"
          v-for="(field, index) in textAreaFields"
          :key="index"
        >
          <template v-if="field.type === 'textarea'">
            <q-input
              v-model="field.data"
              type="textarea"
              dark
              dense
              outlined
              clearable
              rows="4"
              color="white"
              v-if="!ui_states.loading"
              :label="field.label"
              :rules="field.rules"
              :error="field.error"
              :error-message="field['error-message']"
              :disable="field.disabled || ui_states.loading"
            />
          </template>

          <q-skeleton
            v-if="ui_states.loading"
            class="q-my-xs"
            dark
            animation="fade"
            type="QInput"
          />
        </div>
      </div>

      <div class="row content-end justify-end">
        <q-btn flat label="Cancelar" @click="emit('cancel')" />
        <q-btn flat label="Almacenar" type="submit" />
      </div>
    </q-form>
  </div>
</template>

<style scoped></style>
