<script setup>
import { reactive, ref } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'

const props = defineProps({
  service: {
    type: Number,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
})
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const isVisible = ref(props.visible)
const uri = 'api/v1/infrastructure/equipment/inventory/search/'
const loading = ref(false)
const createField = (label, type, rules = []) => ({
  data: null,
  error: false,
  'error-message': '',
  label,
  type,
  rules,
})
const validationRules = {
  text_required: (val) => (val && val.length > 0) || 'Campo requerido',
  select_required: (val) => (val !== null && val !== '') || 'Campo requerido',
}

const fields = reactive({
  equipment: createField('MAC o Serial del equipo', 'input-select', [
    validationRules.select_required,
  ]),
})
const equipment = ref([])
const filteredEquipment = ref([])
const filterEquipment = (val, update) => {
  if (!val || val.length < 4) {
    update(() => {
      filteredEquipment.value = []
    })
    return
  }
  update(() => {
    let params = new FormData()
    params.append('mac', val)
    api
      .post(uri, params)
      .then((res) => {
        filteredEquipment.value = res.data.equipment ?? []
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {})
  })
}
const clearFilters = () => {
  filteredEquipment.value = equipment.value
}
const sendData = () => {
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let params = new FormData()
  let uri = 'api/v1/services/equipment/'
  params.append('equipment', fields.equipment.data)
  params.append('service', props.service)
  api
    .post(uri, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Éxito', `Equipo asignado al servicio`)
      } else {
        showNotification('Error', 'Verifica la información ingresada', 'teal-10')
      }
    })
    .catch((err) => {
      handleSubmissionError(err, fields)
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 300)
    })
}
</script>

<template>
  <q-dialog
    v-model="isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat style="width: 700px; max-width: 95vw" class="custom-cards">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Asignar equipo</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form class="full-width" greedy @submit="sendData">
          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-6 col-lg-7 q-pa-md"
              v-for="(field, index) in fields"
              :key="index"
            >
              <div v-if="field.type === 'input-select'">
                <q-select
                  v-model="field.data"
                  dark
                  outlined
                  dense
                  clearable
                  color="white"
                  emit-value
                  map-options
                  transition-show="flip-up"
                  transition-hide="flip-down"
                  lazy-rules
                  use-input
                  input-debounce="0"
                  v-if="!loading"
                  :label="field.label"
                  :rules="field.rules"
                  :error="field.error"
                  :error-message="field['error-message']"
                  :options="filteredEquipment"
                  :option-value="(opt) => opt.id"
                  :option-label="(opt) => opt.name"
                  @filter="filterEquipment"
                  @filter-abort="clearFilters"
                />
              </div>

              <q-skeleton v-if="loading" class="q-my-xs" dark animation="fade" type="QInput" />
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
