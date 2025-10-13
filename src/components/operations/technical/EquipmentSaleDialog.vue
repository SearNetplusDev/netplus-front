<script setup>
import { reactive } from 'vue'
import { api } from 'boot/axios.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useNotifications } from 'src/utils/notification.js'
import {
  resetFieldErrors,
  buildFormData,
  handleSubmissionError,
} from 'src/utils/composables/useFormHandler.js'

const props = defineProps({
  visible: { type: Boolean, required: true },
  service: { type: Number, required: true },
  client: { type: Number, required: true },
})
const uiStates = reactive({
  isVisible: props.visible,
  loading: false,
})
const { validationRules, createField } = useFields()
const { showNotification } = useNotifications()
const fields = reactive({
  device: createField('MAC o Serial del equipo', 'select-input', [validationRules.select_required]),
})
const devices = reactive({
  filtered: [],
})
const filterDevices = async (val, update) => {
  const uri = '/api/v1/infrastructure/equipment/inventory/search'
  if (!val || val.length < 4) {
    update(() => {
      devices.filtered = []
    })
    return
  }

  update(async () => {
    try {
      const { data } = await api.post(uri, { mac: val })
      devices.filtered = data.device ?? []
    } catch (err) {
      console.error(err)
      showNotification('Error', `${err.response?.data?.message}`, 'red-10')
    }
  })
}
const clearFilters = () => {
  devices.filtered = []
}
const sendData = async () => {
  const uri = '/api/v1/infrastructure/equipment/inventory/sale'
  fields.client = {
    data: props.client,
  }
  fields.service = {
    data: props.service,
  }
  resetFieldErrors(fields)
  const params = buildFormData(fields, { _method: 'POST' })
  try {
    const { data } = await api.post(uri, params)
    if (data.saved) {
      showNotification('Éxito', 'Registro procesado correctamente', 'blue-grey-10')
      uiStates.isVisible = false
    } else {
      showNotification('Error', `Algo ha salido mal.`, 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification('Error', `${err.response?.data?.message}`, 'red-10')
  }
}
</script>

<template>
  <q-dialog
    v-model="uiStates.isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat style="width: 700px; max-width: 75vw" class="custom-cards">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Buscar Equipo</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-form class="full-width" greedy @submit="sendData">
          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-7 q-pa-sm"
              v-for="(field, index) in fields"
              :key="index"
            >
              <template v-if="field.type === 'select-input'">
                <q-select
                  v-model="field.data"
                  dark
                  dense
                  outlined
                  clearable
                  color="white"
                  use-input
                  emit-value
                  map-options
                  transition-show="flip-up"
                  transition-hide="flip-down"
                  lazy-rules
                  input-debounce="0"
                  :label="field.label"
                  :rules="field.rules"
                  :error="field.error"
                  :error-message="field['error-message']"
                  :options="devices.filtered"
                  :option-value="(opt) => opt.id"
                  :option-label="(opt) => opt.name"
                  @filter="filterDevices"
                  @filter-abort="clearFilters"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-italic text-grey">
                        Sin resultados
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </template>
            </div>
          </div>

          <div class="row content-end justify-end">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn flat label="Almacenar" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
