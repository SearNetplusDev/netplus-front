<script setup>
import { reactive, onMounted, watch } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import { useFields } from 'src/utils/composables/useFields.js'

const props = defineProps({
  id: { type: Number, required: true },
  service: { type: Number, required: true },
  visible: { type: Boolean, required: true },
})
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { validationRules, createField } = useFields()
const uiStates = reactive({
  isVisible: props.visible,
  loading: false,
  title: 'Asignar TV BOX',
  isEditMode: false,
})
const uri = '/api/v1/services/equipment/iptv/'
const fields = reactive({
  equipment: createField('Dirección MAC', 'select', [validationRules.select_required]),
  email: createField(
    'Correo electrónico',
    'text',
    [validationRules.text_required, validationRules.email],
    true,
  ),
  email_password: createField(
    'Contraseña del correo',
    'password',
    [validationRules.text_required],
    true,
  ),
  iptv_password: createField('Contraseña de activación', 'password', [
    validationRules.text_required,
  ]),
  comments: createField('Observaciones', 'text-area'),
})
const devices = reactive({
  raw: [],
  filtered: [],
  selectedOption: null,
})
const loadSuggestedEmail = async () => {
  try {
    const { data } = await api.post(`${uri}suggested-email`)
    if (data.suggested_email) {
      fields.email.data = data.suggested_email.email
      fields.email_password.data = data.suggested_email.email_password
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message || err.message || 'Error inesperado',
      'red-10',
    )
  }
}
const filter = (val, update) => {
  const url = 'api/v1/infrastructure/equipment/inventory/iptv/search'
  if (uiStates.isEditMode && (!val || val.length === 0)) {
    update(() => {
      devices.filtered = devices.selectedOption ? [devices.selectedOption] : []
    })
    return
  }
  if (!val || val.length < 4) {
    update(() => {
      // devices.filtered = []
      devices.filtered =
        uiStates.isEditMode && devices.selectedOption ? [devices.selectedOption] : []
    })
    return
  }
  update(async () => {
    try {
      const { data } = await api.post(url, { mac: val })
      const searchResults = data.equipment ?? []
      if (uiStates.isEditMode && devices.selectedOption) {
        const existsInResults = searchResults.some((item) => item.id === devices.selectedOption.id)
        devices.filtered = existsInResults
          ? searchResults
          : [devices.selectedOption, ...searchResults]
      } else {
        devices.filtered = searchResults
      }
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.message || err.message || 'Error inesperado'
      showNotification('Error', message, 'red-10')
    }
  })
}
const clearFilters = () => {
  if (uiStates.isEditMode && devices.selectedOption) {
    devices.filtered = [devices.selectedOption]
  } else {
    devices.filtered = devices.raw
  }
}
const getData = async () => {
  uiStates.loading = true
  uiStates.isEditMode = true
  showLoading()
  try {
    const { data } = await api.post(`${uri}edit`, { id: props.id })
    fields.equipment.data = data.equipment?.equipment_id
    fields.email.data = data.equipment?.email
    fields.email_password.data = data.equipment?.email_password
    fields.iptv_password.data = data.equipment?.iptv_password
    fields.comments.data = data.equipment?.comments

    if (data.equipment?.equipment) {
      devices.selectedOption = {
        id: data.equipment.equipment.id,
        name: data.equipment.equipment.mac_address,
      }
      devices.filtered = [devices.selectedOption]
    }

    uiStates.title = `Modificar datos de la TV BOX con MAC ${data.equipment?.equipment?.mac_address}`
  } catch (err) {
    console.error(err)
    const message = err.response?.data?.message || err.message || 'Error inesperado'
    showNotification('Error', message, 'red-10')
  } finally {
    setTimeout(() => {
      uiStates.loading = false
      hideLoading()
    }, 150)
  }
}
const loadInitialOptions = async () => {
  if (devices.filtered.length > 0) return
  try {
    const { data } = await api.post('api/v1/infrastructure/equipment/inventory/iptv/search', {
      mac: '',
    })
    devices.filtered = data.equipment ?? []
  } catch (err) {
    console.error('Error cargando opciones iniciales: ', err)
  }
}
const onSelectPopupShow = () => {
  if (!uiStates.isEditMode && devices.filtered.length === 0) {
    loadInitialOptions()
  }
}
const sendData = async () => {
  uiStates.loading = true
  uiStates.title = 'Procesando datos, espera un momento ...'
  showLoading()
  resetFieldErrors(fields)
  Object.assign(fields, { service: { data: props.service } })
  let isUpdate = props.id > 0 && props.service
  let params = buildFormData(fields, { _method: isUpdate ? 'PUT' : 'POST' })
  let request = isUpdate ? `${uri}${props.id}` : uri
  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      uiStates.title = `Modificar datos de la TV BOX con MAC ${data.equipment?.equipment?.mac_address}`
      showNotification('Éxito', 'Registro almacenado correctamente', 'blue-grey-10')
      uiStates.isVisible = false
    } else {
      showNotification('Error', 'Verifica la información ingresada', 'red-10')
    }
  } catch (err) {
    console.error(err)
    handleSubmissionError(err, fields)
    const message = err.response?.data?.message || err.message || 'Error inesperado'
    showNotification('Error', message, 'red-10')
  } finally {
    setTimeout(() => {
      uiStates.loading = false
      hideLoading()
    }, 300)
  }
}
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal && !props.id) {
      await loadSuggestedEmail()
    }
  },
)
onMounted(() => {
  if (props.id > 0) {
    getData()
  } else {
    uiStates.isEditMode = false
    devices.selectedOption = null
    loadSuggestedEmail()
  }
})
</script>

<template>
  <q-dialog
    v-model="uiStates.isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat style="width: 700px; max-width: 95vw" class="custom-cards">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ uiStates.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form class="full-width" greedy @submit="sendData">
          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-sm"
              v-for="(field, index) in fields"
              :key="index"
            >
              <template v-if="field.type === 'select'">
                <q-select
                  v-model="field.data"
                  dark
                  outlined
                  dense
                  clearable
                  autofocus
                  color="white"
                  emit-value
                  map-options
                  transition-show="flip-up"
                  transition-hide="flip-down"
                  lazy-rules
                  use-input
                  input-debounce="0"
                  v-if="!uiStates.loading"
                  :label="field.label"
                  :rules="field.rules"
                  :error="field.error"
                  :error-message="field['error-message']"
                  :options="devices.filtered"
                  :option-value="(opt) => opt.id"
                  :option-label="(opt) => opt.name"
                  @filter="filter"
                  @filter-abort="clearFilters"
                  @popup-show="onSelectPopupShow"
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

              <template v-if="field.type === 'text'">
                <q-input
                  dense
                  dark
                  outlined
                  clearable
                  lazy-rules
                  type="email"
                  v-model="field.data"
                  v-if="!uiStates.loading"
                  :rules="field.rules"
                  :label="field.label"
                  :error="field.error"
                  :error-message="field['error-message']"
                  :disable="field.disabled"
                />
              </template>

              <template v-if="field.type === 'password'">
                <q-input
                  dense
                  dark
                  outlined
                  clearable
                  lazy-rules
                  :type="!field.show ? 'password' : 'text'"
                  v-model="field.data"
                  v-if="!uiStates.loading"
                  :rules="field.rules"
                  :label="field.label"
                  :error="field.error"
                  :error-message="field['error-message']"
                  :disable="field.disabled"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="!field.show ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="field.show = !field.show"
                    />
                  </template>
                </q-input>
              </template>

              <q-skeleton
                v-if="uiStates.loading"
                class="q-my-xs"
                dark
                animation="fade"
                type="QInput"
              />
            </div>
          </div>

          <div class="row content-start items-start q-pa-sm fit">
            <div class="col-12">
              <q-input
                v-model="fields.comments.data"
                dark
                dense
                outlined
                clearable
                lazy-rules
                color="white"
                type="textarea"
                v-if="!uiStates.loading"
                :label="fields.comments.label"
                :error="fields.comments.error"
                :error-message="fields.comments['error-message']"
              />
              <q-skeleton
                v-if="uiStates.loading"
                class="q-my-xs"
                dark
                animation="fade"
                type="QInput"
              />
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
