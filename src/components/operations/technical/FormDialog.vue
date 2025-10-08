<script setup>
import { reactive, computed, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { copy } = useClipboard()
const { validationRules, createField } = useFields()
const props = defineProps({
  id: { type: Number, required: true },
})
const uiStates = reactive({
  title: 'Resolución de soportes',
  loading: false,
})
const fields = reactive({
  type: createField('Tipo de soporte', 'select', [validationRules.select_required], true),
  client: createField('Cliente', 'select', [validationRules.select_required], true),
  service: createField('Servicio', 'select', [validationRules.select_required], true),
  profile: createField('Perfil de navegación', 'select', [validationRules.select_required]),
  node: createField('Nodo', 'select', [validationRules.select_required]),
  equipment: createField('Equipo', 'select', [validationRules.select_required]),
  description: createField(
    'Descripción del soporte',
    'textarea',
    [validationRules.text_required],
    true,
  ),
  branch: createField('Sucursal', 'select', [validationRules.select_required], true),
  state: createField('Departamento', 'select', [validationRules.select_required]),
  municipality: createField('Municipio', 'select', [validationRules.select_required]),
  district: createField('Distrito', 'select', [validationRules.select_required]),
  address: createField('Dirección', 'textarea', [validationRules.text_required]),
  solution: createField('Solución', 'textarea', []),
  comments: createField('Observaciones', 'textarea', []),
  latitude: createField('Latitud', 'text', [
    validationRules.text_required,
    validationRules.latitude,
  ]),
  longitude: createField('Longitud', 'text', [
    validationRules.text_required,
    validationRules.longitude,
  ]),
  status: createField('Estado', 'select', [validationRules.select_required]),
})
const options = reactive({
  type: [],
  client: [],
  service: [],
  profile: [],
  node: [],
  equipment: [],
  branch: [],
  state: [],
  municipality: [],
  district: [],
  status: [],
})

// =====  Computed properties para separar los campos ===== //
const normalFields = computed(() => {
  const normalFieldTypes = ['select', 'select-filter', 'text']
  const filteredFields = {}

  Object.keys(fields).forEach((key) => {
    if (normalFieldTypes.includes(fields[key].type)) {
      filteredFields[key] = fields[key]
    }
  })

  return filteredFields
})

const textAreaFields = computed(() => {
  const filteredFields = {}

  Object.keys(fields).forEach((key) => {
    if (fields[key].type === 'textarea') {
      filteredFields[key] = fields[key]
    }
  })
  return filteredFields
})

const support = reactive({
  data: [],
})

const getData = async () => {
  uiStates.loading = true
  showLoading()
  try {
    const { data } = await api.post(`/api/v1/operations/technical/edit`, { id: props.id })
    uiStates.title = `Resolución ${data.support?.ticket_number} (${data.support?.type?.name})`
    let origin = data.support
    support.data = origin
    fields.type.data = origin.type_id
    fields.client.data = origin.client_id
    fields.service.data = origin.service_id
    fields.node.data = origin.service?.node_id
    fields.equipment.data = origin.service?.equipment_id
    fields.description.data = origin.description
    fields.branch.data = origin.branch_id
    fields.state.data = origin.state_id
    fields.municipality.data = origin.municipality_id
    fields.district.data = origin.district_id
    fields.address.data = origin.address
    fields.solution.data = origin.solution
    fields.comments.data = origin.comments
    fields.latitude.data = origin.service?.latitude
    fields.longitude.data = origin.service?.longitude
    fields.status.data = origin.status_id
    let supportWithDetails = [1, 2, 6, 7]
    if (supportWithDetails.includes(origin.type_id)) {
      fields.profile.data = origin.details?.internet_profile_id
    } else {
      fields.profile.data = origin.service?.internet?.internet_profile_id
    }
    await onNodeChange(false)
    await onStateChange(false)
    await onMunicipalityChange(false)
  } catch (err) {
    console.error(err)
  } finally {
    setTimeout(() => {
      uiStates.loading = false
      hideLoading()
    }, 250)
  }
}

const selectOptions = (field) => {
  return (
    {
      type: options.type,
      client: options.client,
      service: options.service,
      profile: options.profile,
      node: options.node,
      equipment: options.equipment,
      branch: options.branch,
      state: options.state,
      municipality: options.municipality,
      district: options.district,
      status: options.status,
    }[field] || []
  )
}

const onSelectChange = (name, val) => {
  switch (name) {
    case 'type':
      fields.type.data = val
      break
    case 'client':
      console.log(val)
      break
    case 'service':
      console.log(val)
      break
    case 'profile':
      fields.profile.data = val
      break
    case 'node':
      handleNodeChange(val)
      break
    case 'equipment':
      fields.equipment.data = val
      break
    case 'branch':
      fields.branch.data = val
      break
    case 'state':
      fields.state.data = val
      handleStateChange(val)
      break
    case 'municipality':
      handleMunicipalityChange(val)
      break
    case 'district':
      fields.district.data = val
      break
    case 'status':
      fields.status.data = val
      break
  }
}
const handleNodeChange = (val) => {
  fields.node.data = val
  onNodeChange(true)
}
const handleStateChange = (val) => {
  fields.state.data = val
  onStateChange(true)
}
const handleMunicipalityChange = (val) => {
  fields.municipality.data = val
  onMunicipalityChange(true)
}
const onNodeChange = async (reload) => {
  if (!fields.node.data) return

  if (reload) {
    fields.equipment.data = null
    options.equipment = []
  }
  try {
    options.equipment = await getSupportData(
      `api/v1/general/infrastructure/node/${fields.node.data}/equipment`,
    )
  } catch (err) {
    showNotification('Error', `${err.response?.data?.message}`, 'red-10')
  }
}
const onStateChange = async (reload) => {
  if (!fields.state.data) return

  if (reload) {
    fields.municipality.data = null
    fields.district.data = null
    options.municipality = []
    options.districts = []
  }

  try {
    options.municipality = await getSupportData(
      `api/v1/general/state/${fields.state.data}/municipalities`,
    )
  } catch (error) {
    console.error('Error cargando municipios:', error)
    showNotification('Error', `${error.response?.data?.message}`, 'red-10')
  }
}
const onMunicipalityChange = async (reload) => {
  if (!fields.municipality.data) return

  if (reload) {
    fields.district.data = null
    options.district = []
  }

  try {
    options.district = await getSupportData(
      `api/v1/general/municipality/${fields.municipality.data}/districts`,
    )
  } catch (error) {
    showNotification('Error', `${error.response?.data?.message}`, 'red-10')
  }
}
const sendData = async () => {}

onMounted(async () => {
  try {
    await getData()

    const [types, client, service, profiles, nodes, branches, states, statuses] = await Promise.all(
      [
        getSupportData('/api/v1/general/supports/types'),
        getSupportData(`/api/v1/clients/search/${fields.client.data}`),
        getSupportData(`/api/v1/services/client/${fields.client.data}`),
        getSupportData('/api/v1/general/profiles/internet'),
        getSupportData('api/v1/general/infrastructure/nodes'),
        getSupportData('/api/v1/general/branches'),
        getSupportData('/api/v1/general/states'),
        getSupportData('/api/v1/general/supports/status'),
      ],
    )
    options.type = types
    options.client = client
    options.service = service
    options.profile = profiles
    options.node = nodes
    options.branch = branches
    options.state = states
    options.status = statuses
  } catch (err) {
    console.error(err)
    showNotification('Error', `${err.response?.data?.message}`, 'red-10')
  }
})
</script>
<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="sendData">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ uiStates.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="uiStates.loading"
            :label="props.id > 0 ? 'Almacenar' : 'Almacenar'"
            type="submit"
            color="white"
          >
            <template v-slot:loading>
              <q-spinner-gears class="on-left" />
            </template>
          </q-btn>

          <q-btn v-close-popup round dense icon="close" />
        </q-toolbar>
      </q-header>

      <footer-component />

      <q-page-container>
        <q-page class="q-pa-md bg-dark">
          <q-card flat class="custom-cards q-pa-sm">
            <q-card-section>
              <div class="row wrap full-width justify-start items-center content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
                  v-for="(field, index) in normalFields"
                  :key="index"
                >
                  <!--  Normal Selects    -->
                  <template v-if="field.type === 'select'">
                    <q-select
                      dense
                      dark
                      clearable
                      outlined
                      color="white"
                      emit-value
                      map-options
                      transition-show="jump-up"
                      transition-hide="jump-down"
                      lazy-rules
                      v-model="field.data"
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="selectOptions(index)"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      @update:model-value="onSelectChange(index, $event)"
                      :disable="field.disabled"
                    />
                  </template>
                  <!--  End Normal Selects  -->

                  <!--    Text Inputs   -->
                  <template v-if="field.type === 'text'">
                    <q-input
                      dense
                      dark
                      outlined
                      clearable
                      color="white"
                      lazy-rules="ondemand"
                      v-model="field.data"
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :disable="field.disabled"
                    />
                  </template>
                  <!--    End Text Inputs   -->

                  <q-skeleton
                    class="q-my-md"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="uiStates.loading"
                  />
                </div>
              </div>

              <div class="row wrap full-width justify-start items-center content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-sm"
                  v-for="(field, index) in textAreaFields"
                  :key="index"
                >
                  <!--    Textarea Inputs   -->
                  <q-input
                    v-model="field.data"
                    dark
                    dense
                    outlined
                    clearable
                    type="textarea"
                    rows="4"
                    color="white"
                    v-if="!uiStates.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                    :disable="field.disabled"
                  />
                  <!--    End Textarea Inputs   -->
                  <q-skeleton
                    class="q-my-md"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="uiStates.loading"
                  />
                </div>
              </div>

              <div class="row wrap full-width justify-start items-center content-start">
                <!--  Internet Profile Data   -->
                <div class="col-xs-12 col-sm-12 col-md-2 q-ma-sm">
                  <q-card flat class="custom-cards" style="width: 100%">
                    <q-card-section class="q-header text-subtitle2 text-center">
                      Datos de Internet
                    </q-card-section>
                    <q-card-section class="text-subtitle2">
                      Nuevo Perfil: {{ support.data?.details?.profile?.name ?? 'N/A' }}
                    </q-card-section>
                    <q-card-section class="text-subtitle2">
                      Perfil Actual: {{ support.data?.service?.internet?.profile?.name ?? 'N/A' }}
                    </q-card-section>
                    <q-card-section class="text-subtitle2">
                      <q-btn
                        flat
                        bordered
                        text-color="white"
                        :label="support.data?.service?.internet?.user ?? 'Sin Servicio'"
                        class="full-width q-mb-xs"
                        icon="mdi-account"
                        no-caps
                        @click="copy(support.data?.service?.internet?.user ?? 'Sin Servicio')"
                      />
                      <q-btn
                        flat
                        bordered
                        text-color="white"
                        :label="support.data?.service?.internet?.secret ?? 'Sin Servicio'"
                        class="full-width q-mb-xs"
                        icon="mdi-key-variant"
                        no-caps
                        @click="copy(support.data?.service?.internet?.secret ?? 'Sin Servicio')"
                      />
                    </q-card-section>
                  </q-card>
                </div>
                <!--  End Internet Profile Data   -->
              </div>
            </q-card-section>

            <q-card-section>
              <pre>
              {{ support.data }}
            </pre
              >
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>
<style lang="sass" scoped></style>
