<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { api } from 'boot/axios.js'
import localeEs from 'src/utils/composables/localeEs.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'

const loading = ref(false)
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { validationRules, createField, createToggle } = useFields()
const props = defineProps({
  client: Number,
})
const url = 'api/v1/clients/'
const fields = reactive({
  name: createField('Nombres', 'text', [validationRules.text_required]),
  surname: createField('Apellidos', 'text', [validationRules.text_required]),
  gender: createField('Género', 'select', [validationRules.select_required]),
  birthdate: createField('Fecha de nacimiento', 'date', []),
  marital: createField('Estado Civil', 'select', [validationRules.select_required]),
  branch: createField('Sucursal', 'select', [validationRules.select_required]),
  type: createField('Tipo de Cliente', 'select', [validationRules.select_required]),
  profession: createField('Profesión u Oficio', 'text', []),
  country: createField('País', 'select', [validationRules.select_required]),
  document: createField('Documento a emitir', 'select', [validationRules.select_required]),
  entity: createToggle('Persona Jurídica'),
  status: createToggle('Estado'),
  comment: createField('Observaciones', 'area', []),
})
const external = reactive({
  gender: [],
  marital: [],
  branch: [],
  type: [],
  country: [],
  document: [],
})
const locale = localeEs
const getOptions = (key) => {
  return (
    {
      gender: external.gender,
      marital: external.marital,
      branch: external.branch,
      type: external.type,
      country: external.country,
      document: external.document,
    }[key] || []
  )
}
const emit = defineEmits(['loadDrawer', 'updateTitle'])
const getData = () => {
  showLoading()
  loading.value = true
  let data = new FormData()
  data.append('id', props.client)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.client
      fields.name.data = itm.name
      fields.surname.data = itm.surname
      fields.gender.data = itm.gender_id
      fields.birthdate.data = itm.birthdate
      fields.marital.data = itm.marital_status_id
      fields.branch.data = itm.branch_id
      fields.type.data = itm.client_type_id
      fields.profession.data = itm.profession
      fields.country.data = itm.country_id
      fields.document.data = itm.document_type_id
      fields.entity.data = itm.legal_entity
      fields.comment.data = itm.comments
      fields.status.data = itm.status_id
      sendTitle(`${itm.name} ${itm.surname}`)
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 500)
    })
}
const sendTitle = (name) => {
  emit('updateTitle', name)
}
const sendData = async () => {
  loading.value = true
  let request = props.client > 0 ? `${url}${props.client}` : url
  let method = props.client > 0 ? 'PUT' : 'POST'
  showLoading()
  resetFieldErrors(fields)
  const params = buildFormData(fields, { _method: method })

  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
      emit('loadDrawer', data.client.id)
      sendTitle(`${data.client.name} ${data.client.surname}`)
    } else {
      showNotification('Error', 'Verifica la información ingresada', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification('Error', err.response?.data?.message || 'Error al guardar', 'red-10')
  } finally {
    setTimeout(() => {
      loading.value = false
      hideLoading()
    }, 150)
  }
}
//  Observa cambios en la propiedad cliente, de haberlos ejecuta getData
watch(
  () => props.client,
  (newValue, oldValue) => {
    if (newValue > 0 && newValue !== oldValue) getData()
  },
)
onMounted(async () => {
  if (props.client > 0) {
    getData()
  }
  external.gender = await getSupportData('/api/v1/general/genders')
  external.marital = await getSupportData('/api/v1/general/marital')
  external.branch = await getSupportData('/api/v1/general/branches')
  external.type = await getSupportData('/api/v1/general/client/types')
  external.country = await getSupportData('/api/v1/general/countries')
  external.document = await getSupportData('/api/v1/general/billing/documents')
})
</script>

<template>
  <div class="fit row">
    <div class="col-12">
      <q-breadcrumbs class="text-white" gutter="md" active-color="white">
        <template v-slot:separator>
          <q-icon size="1.5em" name="chevron_right" color="white" />
        </template>
        <q-breadcrumbs-el label="Clientes" icon="mdi-account" />
        <q-breadcrumbs-el label="Datos Personales" icon="contacts" />
      </q-breadcrumbs>

      <q-separator dark class="q-my-md" />

      <q-form greedy @submit="sendData">
        <div class="col-12 fit row">
          <div
            class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-md"
            v-for="(field, index) in fields"
            :key="index"
          >
            <div v-if="field.type === 'text'">
              <q-input
                dense
                dark
                outlined
                clearable
                lazy-rules
                v-model="field.data"
                v-if="!loading"
                :rules="field.rules"
                :label="field.label"
                :error="field.error"
                :error-message="field['error-message']"
              />
            </div>

            <div v-if="field.type === 'select'">
              <q-select
                v-model="field.data"
                dense
                dark
                outlined
                clearable
                color="white"
                emit-value
                map-options
                transition-show="flip-up"
                transition-hide="flip-down"
                lazy-rules
                v-if="!loading"
                :label="field.label"
                :rules="field.rules"
                :error="field.error"
                :error-message="field['error-message']"
                :options="getOptions(index)"
                :option-value="(opt) => opt.id"
                :option-label="(opt) => opt.name"
              />
            </div>

            <div v-if="field.type === 'date'">
              <q-input
                dark
                dense
                outlined
                v-model="field.data"
                v-if="!loading"
                :rules="field.rules"
                :label="field.label"
                :error="field.error"
                :error-message="field['error-message']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transiton-show="scale" transition-hide="scale">
                      <q-date
                        v-model="field.data"
                        mask="YYYY-MM-DD"
                        :locale="locale"
                        color="blue-10"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="white" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

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

            <q-skeleton v-if="loading" class="q-my-xs" dark animation="fade" type="QInput" />
          </div>

          <div class="col-12">
            <q-input
              v-model="fields.comment.data"
              outlined
              dark
              dense
              clearable
              type="textarea"
              label="Observaciones"
              v-if="!loading"
              :error="fields.comment.error"
              :error-message="fields.comment['error-message']"
            />
            <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
          </div>
        </div>

        <div class="full-width row wrap justify-end">
          <q-btn
            icon="save"
            :loading="loading"
            :label="props.client === 0 ? 'almacenar' : 'Actualizar datos'"
            type="submit"
            color="primary"
          >
            <template v-slot:loading>
              <q-spinner-gears class="on-left" />
              Loading...
            </template>
          </q-btn>
        </div>
      </q-form>
    </div>
  </div>
</template>

<style scoped></style>
