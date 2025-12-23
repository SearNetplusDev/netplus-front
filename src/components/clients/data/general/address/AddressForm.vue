<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useFields } from 'src/utils/composables/useFields.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'

const props = defineProps({
  client: Number,
  visible: Boolean,
  addressID: Number,
})
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { validationRules, createToggle, createField } = useFields()
const isVisible = ref(props.visible)
const loading = ref(false)
const title = ref('')
const url = '/api/v1/clients/addresses/'
const fields = reactive({
  neighborhood: createField('Barrio/Colonia/Cantón', 'text', [validationRules.text_required]),
  state: createField('Departamento', 'select', [validationRules.select_required]),
  municipality: createField('Municipio', 'select', [validationRules.select_required]),
  district: createField('Distrito', 'select', [validationRules.select_required]),
  country: createField('País', 'select', [validationRules.select_required]),
  status: createToggle('Estado'),
  address: createField('Dirección', 'area', [validationRules.text_required]),
})
const external = reactive({
  countries: [],
  states: [],
  municipalities: [],
  districts: [],
})
const getData = () => {
  showLoading()
  loading.value = true
  let data = new FormData()
  data.append('id', props.addressID)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let item = res.data.address
      fields.neighborhood.data = item.neighborhood
      fields.address.data = item.address
      fields.state.data = item.state_id
      fields.municipality.data = item.municipality_id
      fields.district.data = item.district_id
      fields.country.data = item.country_id
      fields.status.data = item.status_id
      title.value = `Editar Dirección: ${item.neighborhood}`
      if (item) {
        onStateChange(false)
        onMunicipalityChange(false)
      }
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        hideLoading()
        loading.value = false
      }, 500)
    })
}
const sendData = async () => {
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let request = props.addressID > 0 ? `${url}${props.addressID}` : url
  let method = props.addressID > 0 ? 'PUT' : 'POST'

  let params = buildFormData(fields, { _method: method })
  params.append('client', props.client)

  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
      isVisible.value = false
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
const getOptions = (key) => {
  return (
    {
      state: external.states,
      municipality: external.municipalities,
      district: external.districts,
      country: external.countries,
    }[key] || []
  )
}
const onSelectChange = (name, value) => {
  switch (name) {
    case 'state':
      handleStateChange(value)
      break
    case 'municipality':
      handleMunicipalityChange(value)
      break
    case 'district':
      handleDistrictChange(value)
      break
    case 'country':
      handleCountryChange(value)
      break
  }
}
const handleStateChange = (val) => {
  console.log(`Departamento seleccionado: ${val}`)
  fields.state.data = val
  onStateChange(true)
}
const handleMunicipalityChange = (val) => {
  console.log(`Municipio seleccionado: ${val}`)
  fields.municipality.data = val
  onMunicipalityChange(true)
}
const handleDistrictChange = (val) => {
  console.log(`Distrito seleccionado: ${val}`)
  fields.district.data = val
}
const handleCountryChange = (val) => {
  console.log(`País seleccionado: ${val}`)
  fields.country.data = val
}
const onStateChange = async (reload) => {
  if (!fields.state.data) return

  if (reload) {
    // Resetear a null en lugar de objetos
    fields.municipality.data = null
    fields.district.data = null
    external.municipalities = []
    external.districts = []
  }

  try {
    external.municipalities = await getSupportData(
      `api/v1/general/state/${fields.state.data}/municipalities`,
    )
  } catch (error) {
    console.error('Error cargando municipios:', error)
    showNotification('Error', 'Error al cargar municipios', 'red-10')
  }
}

const onMunicipalityChange = async (reload) => {
  // Condiciones simplificadas
  if (!fields.municipality.data) return

  if (reload) {
    // Resetear a null
    fields.district.data = null
    external.districts = []
  }

  try {
    external.districts = await getSupportData(
      `api/v1/general/municipality/${fields.municipality.data}/districts`,
    )
  } catch (error) {
    console.error('Error cargando distritos:', error)
    showNotification('Error', 'Error al cargar distritos', 'red-10')
  }
}
onMounted(async () => {
  external.countries = await getSupportData('/api/v1/general/countries')
  external.states = await getSupportData('/api/v1/general/states')
  if (props.addressID > 0) getData()
  title.value = 'Registrar dirección'
})
</script>

<template>
  <q-dialog
    v-model="isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="jump-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat style="width: 700px; max-width: 80vw" class="custom-cards">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form greedy @submit="sendData">
          <div class="row content-start items-start q-pa-sm fit">
            <div
              class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-sm"
              v-for="(field, name) in fields"
              :key="name"
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
                  :options="getOptions(name)"
                  :option-value="(opt) => opt.id"
                  :option-label="(opt) => opt.name"
                  @update:model-value="onSelectChange(name, $event)"
                />
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
                  :error="field.error"
                  :error-message="field['error-message']"
                />
              </div>
              <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
            </div>

            <div class="col-12">
              <q-input
                v-model="fields.address.data"
                outlined
                dark
                dense
                type="textarea"
                label="Dirección"
                v-if="!loading"
                :error="fields.status.error"
                :error-message="fields.status['error-message']"
              />
              <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
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
