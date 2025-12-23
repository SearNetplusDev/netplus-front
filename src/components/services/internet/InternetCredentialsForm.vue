<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { handleSubmissionError, resetFieldErrors } from 'src/utils/composables/useFormHandler.js'
import { getSupportData } from 'src/utils/composables/getData.js'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const props = defineProps({
  service: {
    type: Number,
    required: true,
  },
})
const url = '/api/v1/services/internet/'
const loading = ref(false)
const internetId = ref(0)
const createField = (label, type, rules = []) => ({
  data: null,
  error: false,
  'error-message': '',
  label,
  type,
  rules,
})
const createToggleField = (label) => ({
  data: false,
  error: false,
  'error-message': '',
  label,
  type: 'toggle',
})
const VALIDATION_RULES = {
  input_required: (val) => (val !== null && val !== '' && val !== undefined) || 'Campo requerido',
  select_required: (val) => (val !== null && val !== '') || 'Campo requerido',
}
const fields = reactive({
  profile: createField('Perfil de internet', 'select', [VALIDATION_RULES.select_required]),
  user: createField('Usuario', 'text', [VALIDATION_RULES.input_required]),
  password: createField('Contraseña', 'text', [VALIDATION_RULES.input_required]),
  status: createToggleField('Estado'),
})
const getData = () => {
  loading.value = true
  showLoading()
  let params = new FormData()
  params.append('service', props.service)
  api
    .post(url + 'read', params)
    .then((response) => {
      let item = response.data.internet
      if (!response.data.can_create) {
        internetId.value = item.id ?? 0
        fields.profile.data = item.internet_profile_id ?? null
        fields.user.data = item.user ?? null
        fields.password.data = item.secret ?? null
        fields.status.data = item.status_id ?? 0
      }
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 300)
    })
}
const sendData = () => {
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let status = fields.status.data ? 1 : 0
  let params = new FormData()
  params.append('service', props.service)
  params.append('profile', fields.profile.data)
  params.append('user', fields.user.data)
  params.append('password', fields.password.data)
  params.append('status', status)
  params.append('_method', internetId.value > 0 ? 'PUT' : 'POST')
  let request = internetId.value > 0 ? `${url}${internetId.value}` : url
  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
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
const internet_profiles = ref([])
const filtered_profiles = ref([])
const filterProfiles = (val, update) => {
  if (val === '') {
    update(() => {
      filtered_profiles.value = internet_profiles.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filtered_profiles.value = internet_profiles.value.filter(
      (model) => model.name.toLowerCase().indexOf(needle) > -1,
    )
  })
}
const clearFilters = () => {
  filtered_profiles.value = internet_profiles.value
}
onMounted(async () => {
  getData()
  internet_profiles.value = await getSupportData('/api/v1/general/profiles/internet')
  filtered_profiles.value = internet_profiles.value
})
</script>

<template>
  <div class="row wrap full-width justify-start items-start content-start">
    <q-form class="full-width" greedy @submit="sendData">
      <div class="row">
        <div
          class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-md"
          v-for="(field, index) in fields"
          :key="index"
        >
          <!--    Input Select    -->
          <div v-if="field.type === 'select'">
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
              :options="filtered_profiles"
              :option-value="(opt) => opt.id"
              :option-label="(opt) => opt.name"
              @filter="filterProfiles"
              @filter-abort="clearFilters"
            />
          </div>

          <!--    Input Text    -->
          <div v-if="field.type === 'text'">
            <q-input
              v-model="field.data"
              dark
              dense
              outlined
              clearable
              lazy-rules
              v-if="!loading"
              :rules="field.rules"
              :label="field.label"
              :error="field.error"
              :error-message="field['error-message']"
            />
          </div>

          <!--    Input Toggle    -->
          <div v-if="field.type === 'toggle'">
            <q-toggle
              v-model="field.data"
              :label="field.label"
              checked-icon="check"
              unchecked-icon="clear"
              size="lg"
              color="primary"
              v-if="!loading"
              :error="fields.status.error"
              :error-message="fields.status['error-message']"
            />
          </div>
          <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
        </div>
      </div>
      <div class="row full-width justify-end items-end content-end">
        <div class="full-width row wrap justify-end">
          <q-btn
            icon="save"
            :loading="loading"
            :label="internetId > 0 ? 'actualizar datos' : 'almacenar'"
            type="submit"
            color="primary"
          >
            <template v-slot:loading>
              <q-spinner-gears class="on-left" />
              Procesando
            </template>
          </q-btn>
        </div>
      </div>
    </q-form>
  </div>
</template>

<style scoped></style>
