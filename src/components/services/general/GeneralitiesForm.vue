<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import {
  handleSubmissionError,
  resetFieldErrors,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useSupportDataStore } from 'stores/client_services/supportData.js'
import LocaleEs from 'src/utils/composables/localeEs.js'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { createField, createToggle, validationRules } = useFields()
const supportStore = useSupportDataStore()
const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['record-created'])
const url = '/api/v1/services/'
const loading = ref(false)
const locale = LocaleEs
const fields = reactive({
  code: createField('Código', 'text'),
  name: createField('Nombre', 'text'),
  node: createField('Nodo', 'select', [validationRules.select_required()]),
  equipment: createField('Equipo', 'select', [validationRules.select_required()]),
  installation_date: createField('Fecha de instalación', 'date', [validationRules.text_required()]),
  technician: createField('Instalador', 'select', [validationRules.select_required()]),
  lat: createField('Latitud', 'text', [
    validationRules.text_required(),
    validationRules.latitude(),
  ]),
  long: createField('Longitud', 'text', [
    validationRules.text_required(),
    validationRules.longitude(),
  ]),
  state: createField('Departamento', 'select', [validationRules.select_required()]),
  municipality: createField('Municipio', 'select', [validationRules.select_required()]),
  district: createField('Distrito', 'select', [validationRules.select_required()]),
  separation: createToggle('Factura independiente'),
  status: createToggle('Estado'),
  address: createField('Dirección', 'text-area', [validationRules.text_required()]),
  comments: createField('Observaciones', 'text-area'),
})
const external = reactive({
  equipment: [],
  municipalities: [],
  districts: [],
})
const getOptions = (key) => {
  return (
    {
      node: supportStore.nodes,
      equipment: external.equipment,
      technician: supportStore.technicians,
      state: supportStore.states,
      municipality: external.municipalities,
      district: external.districts,
    }[key] || []
  )
}
const onSelectChange = (name, value) => {
  switch (name) {
    case 'node':
      handleNodeChange(value)
      break
    case 'equipment':
      handleEquipmentChange(value)
      break
    case 'technician':
      handleTechnicianChange(value)
      break
    case 'state':
      handleStateChange(value)
      break
    case 'municipality':
      handleMunicipalityChange(value)
      break
    case 'district':
      handleDistrictChange(value)
      break
  }
}
const handleNodeChange = (val) => {
  fields.node.data = val
  onNodeChange(true)
}
const handleEquipmentChange = (val) => {
  fields.equipment.data = val
}
const handleTechnicianChange = (val) => {
  fields.technician.data = val
}
const handleStateChange = (val) => {
  fields.state.data = val
  onStateChange(true)
}
const handleMunicipalityChange = (val) => {
  fields.municipality.data = val
  onMunicipalityChange(true)
}
const handleDistrictChange = (val) => {
  fields.district.data = val
}
const onNodeChange = async (reload) => {
  if (!fields.node.data) return

  if (reload) {
    fields.equipment.data = null
    external.equipment = []
  }

  try {
    external.equipment = await getSupportData(
      `api/v1/general/infrastructure/node/${fields.node.data}/equipment`,
    )
  } catch (err) {
    console.error('Error cargando equipos ', err)
    showNotification('Error', 'Error al cargar los equipos', 'red-10')
  }
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
const getServiceData = async () => {
  if (!props.service?.id) return
  loading.value = true
  showLoading()
  try {
    let params = new FormData()
    params.append('id', props.service?.id)
    const { data } = await api.post(`${url}edit`, params)
    let item = data.service
    fields.code.data = item.code
    fields.name.data = item.name
    fields.node.data = item.node_id
    fields.equipment.data = item.equipment_id
    fields.installation_date.data = item.installation_date
    fields.technician.data = item.technician_id
    fields.lat.data = item.latitude
    fields.long.data = item.longitude
    fields.state.data = item.state_id
    fields.municipality.data = item.municipality_id
    fields.district.data = item.district_id
    fields.separation.data = !!item.separate_billing
    fields.status.data = !!item.status_id
    fields.address.data = item.address
    fields.comments.data = item.comments
    await onNodeChange(false)
    await onStateChange(false)
    await onMunicipalityChange(false)
  } catch (err) {
    console.error(err)
    showNotification('Error', err, 'red-10')
  } finally {
    hideLoading()
    loading.value = false
  }
}
const sendData = async () => {
  let clientId = props.service?.client_id
  if (!clientId) {
    showNotification('Error', 'Cliente no identificado.', 'red-10')
    // return
  }
  resetFieldErrors(fields)
  Object.assign(fields, { client: { data: clientId } })
  let isUpdate = props.service?.id && props.service?.id > 0
  let params = buildFormData(fields, { _method: isUpdate ? 'PUT' : 'POST' })
  const request = isUpdate ? `${url}${props.service?.id}` : url
  loading.value = true
  showLoading()
  try {
    let { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Éxito', 'Registro almacenado correctamente', 'blue-grey-10')
      emit('record-created', { id: data.service?.id, client_id: data.service?.client_id })
    } else {
      showNotification('Error', 'Verifica la información ingresada', 'teal-10')
    }
  } catch (err) {
    console.error(err)
    handleSubmissionError(err, fields)
    showNotification('Error', err, 'red-10')
  } finally {
    hideLoading()
    loading.value = false
  }
}
onMounted(async () => {
  await supportStore.load()
  if (props.service?.id) await getServiceData()
})
</script>
<template>
  <div class="row wrap full-width justify-start items-start content-start">
    <q-form class="full-width" greedy @submit="sendData">
      <div class="row">
        <div
          class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
          v-for="(field, index) in fields"
          :key="index"
        >
          <!--    Text    -->
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

          <!--    Selects   -->
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
              @update:model-value="onSelectChange(index, $event)"
            />
          </div>

          <!-- Dates    -->
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
                    <q-date v-model="field.data" mask="YYYY-MM-DD" :locale="locale" color="blue-10">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="white" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!--    Toggles   -->
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
      <div class="row col-12">
        <div class="col-12 q-pa-sm">
          <q-input
            v-model="fields.address.data"
            outlined
            dark
            dense
            clearable
            type="textarea"
            label="Dirección"
            v-if="!loading"
            :error="fields.address.error"
            :error-message="fields.address['error-message']"
          />
          <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
        </div>
      </div>

      <div class="col-12 q-pa-sm">
        <q-input
          v-model="fields.comments.data"
          outlined
          dark
          dense
          clearable
          type="textarea"
          label="Observaciones"
          v-if="!loading"
          :error="fields.comments.error"
          :error-message="fields.comments['error-message']"
        />
        <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
      </div>

      <div class="full-width row wrap justify-end">
        <q-btn
          icon="save"
          :loading="loading"
          :label="props.service?.id ? 'actualizar datos' : 'almacenar'"
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
</template>
<style lang="sass" scoped></style>
