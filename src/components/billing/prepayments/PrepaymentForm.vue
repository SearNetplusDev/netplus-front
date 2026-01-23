<script setup>
import { reactive, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { validationRules, createField, createToggle } = useFields()
const props = defineProps({
  client: { type: Number, required: true },
  visible: { type: Boolean, required: true },
})
const emit = defineEmits(['hide'])
const states = reactive({
  isVisible: props.visible,
  loading: false,
  title: `Registrar abono`,
})
const fields = useFields({
  amount: createField('Cantidad a abonar', 'text', [
    validationRules.text_required,
    validationRules.money_two_decimal,
  ]),
  payment_method: createField('Método de pago', 'select', [validationRules.select_required]),
  comments: createField('Comentarios', 'textarea', [validationRules.text_required]),
  status: createToggle('Estado'),
})
const external = reactive({
  methods: [],
})
const { normalFields, textAreaFields } = useFieldFilters(fields)
const getInitialData = async () => {
  const [methods] = await Promise.all([getSupportData('/api/v1/general/billing/payment-methods')])
  external.methods = methods
}
const sendData = async () => {
  states.loading = true
  showLoading()
  resetFieldErrors(fields)
  let request = 'apí/v1/billing/prepayments'
  let params = buildFormData(fields, { _method: 'POST', client: props.client })

  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Éxito', 'Abono registrado correctamente', 'blue-grey-10')
      emit('hide')
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
      states.loading = false
      hideLoading()
    }, 150)
  }
}
onMounted(async () => {
  await getInitialData()
})
</script>

<template>
  <q-dialog
    v-model="states.isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card
      dark
      flat
      class="custom-cards"
      style="width: 50vw !important; max-width: 50vw !important"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ states.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form greedy @submit="sendData">
          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-sm"
              v-for="(field, index) in normalFields"
              :key="index"
            >
              <template v-if="field.type === 'text'"> </template>
            </div>
          </div>

          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm"
              v-for="(field, index) in textAreaFields"
              :key="index"
            >
              <template v-if="field.type === 'textarea'">
                <q-input
                  v-model="field.data"
                  outlined
                  dark
                  dense
                  type="textarea"
                  :label="field.label"
                  :error="field.error"
                  :error-message="field['error-message']"
                  v-if="!states.loading"
                />
              </template>

              <q-skeleton
                v-if="states.loading"
                class="q-my-xs"
                dark
                animation="fade"
                type="QInput"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
