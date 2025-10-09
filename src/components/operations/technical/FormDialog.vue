<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import DeleteItemDialog from 'components/base/DeleteItemDialog.vue'

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
  showDeleteItem: false,
})
const deleteProps = ref([])
const filteredDevices = reactive({
  internet: [],
  iptv: [],
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

const devices = reactive({
  internet: [],
  iptv: [],
  addInternet: null,
  addIptv: null,
})
const getData = async () => {
  uiStates.loading = true
  showLoading()
  try {
    const { data } = await api.post(`/api/v1/operations/technical/edit`, { id: props.id })
    let origin = data.support
    uiStates.title = `Resolución ${origin.ticket_number} (${origin.type?.name})`
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

    devices.internet = origin.service?.internet_devices
    devices.iptv = origin.service?.iptv_devices
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
const showDeleteDialog = (type, deviceId, mac) => {
  let uri = ''
  uiStates.showDeleteItem = true
  type === 1
    ? (uri = '/api/v1/service/equipment/internet')
    : (uri = '/api/v1/services/equipment/iptv')

  deleteProps.value = {
    title: 'Desvincular Dispositivo',
    message: `¿Deseas desvincular el equipo con MAC ${mac} del servicio?`,
    id: deviceId,
    url: uri,
  }
}
const resetShowDeleteItem = () => {
  uiStates.showDeleteItem = false
  getData()
}

const filterInternetDevices = async (val, update) => {
  if (!val || val.length < 4) {
    update(() => {
      filteredDevices.internet = []
    })
    return
  }
  try {
    const { data } = await api.post('api/v1/infrastructure/equipment/inventory/internet/search/', {
      mac: val,
    })
    update(() => {
      filteredDevices.internet = data.equipment
    })
  } catch (err) {
    showNotification('Error', `${err.response?.data?.message}`, 'red-10')
  }
}
const clearInternetFilters = () => {
  filteredDevices.internet = devices.addInternet ?? []
}
const saveInternetDevice = async () => {
  uiStates.loading = true
  showLoading()
  try {
    const { data } = await api.post('api/v1/services/equipment/internet/', {
      equipment: devices.addInternet,
      service: support.data.service?.id,
    })
    if (data.saved) {
      showNotification('Éxito', `Equipo asignado al servicio`, 'blue-grey-10')
      await getData()
      devices.addInternet = null
    } else {
      showNotification('Error', 'Ha ocurrido un error, intentalo nuevamente.', 'red-10')
    }
  } catch (err) {
    showNotification('Error', `${err.response?.data?.message}`, 'red-10')
  } finally {
    setTimeout(() => {
      uiStates.loading = false
      hideLoading()
    }, 50)
  }
}

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

              <div
                class="row wrap full-width justify-start items-start content-start"
                v-if="support.data?.service !== null"
              >
                <template v-if="!uiStates.loading">
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

                  <!--  Installed Internet Devices   -->
                  <div class="col-xs-12 col-sm-12 col-md-2 q-ma-sm">
                    <q-card flat class="custom-cards" style="width: 100%">
                      <q-card-section class="q-header text-subtitle2 text-center">
                        Equipos Instalados
                      </q-card-section>
                      <q-card-section>
                        <template v-for="device in devices.internet" :key="device.id">
                          <div class="row q-my-xs">
                            <div class="col-1 text-bold">
                              {{ device.equipment?.type?.name }}
                            </div>
                            <div class="col-9 text-center">
                              <span class="copy-text" @click="copy(device.equipment?.mac_address)">
                                {{ device.equipment?.mac_address }}
                              </span>
                            </div>
                            <div class="col-2">
                              <q-btn
                                flat
                                round
                                icon="mdi-delete"
                                color="red"
                                size="sm"
                                @click="
                                  showDeleteDialog(1, device.id, device.equipment?.mac_address)
                                "
                              >
                                <q-tooltip
                                  transition-show="fade"
                                  transition-hide="flip-left"
                                  class="bg-grey-10"
                                >
                                  Remover dispositivo con MAC {{ device.equipment?.mac_address }}
                                </q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </template>
                      </q-card-section>

                      <q-card-section>
                        <q-select
                          v-model="devices.addInternet"
                          dark
                          dense
                          outlined
                          clearable
                          use-input
                          hide-selected
                          fill-input
                          color="white"
                          emit-value
                          map-options
                          transition-show="jump-up"
                          transition-hide="jump-down"
                          lazy-rules
                          input-debounce="0"
                          label="Dirección MAC (últimos 4 dígitos)"
                          :options="filteredDevices.internet"
                          :option-value="(opt) => opt.id"
                          :option-label="(opt) => opt.name"
                          @filter="filterInternetDevices"
                          @filter-abort="clearInternetFilters"
                        >
                          <template v-slot:no-option>
                            <q-item>
                              <q-item-section class="text-italic text-grey">
                                Sin resultados
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </q-card-section>
                      <q-card-actions align="around">
                        <q-btn flat label="buscar" />
                        <q-btn flat label="añadir" @click="saveInternetDevice()" />
                      </q-card-actions>
                    </q-card>
                  </div>
                  <!--  End Installed Internet Devices   -->

                  <!--  Installed IPTV Devices   -->
                  <div
                    class="col-xs-12 col-sm-12 col-md-2 q-ma-sm"
                    v-if="
                      support.data?.service?.internet?.profile?.iptv ||
                      support.data?.details?.profile?.iptv
                    "
                  >
                    <q-card flat class="custom-cards" style="width: 100%">
                      <q-card-section class="q-header text-subtitle2 text-center">
                        TV Box Instaladas
                      </q-card-section>
                      <q-card-section>
                        <template v-for="device in devices.iptv" :key="device.id">
                          <div class="row q-my-xs">
                            <div class="col-10 text-center">
                              <span class="copy-text" @click="copy(device.equipment?.mac_address)">
                                {{ device.equipment?.mac_address }}
                              </span>
                            </div>
                            <div class="col-2">
                              <q-btn
                                flat
                                round
                                icon="mdi-delete"
                                color="red"
                                size="sm"
                                @click="
                                  showDeleteDialog(2, device.id, device.equipment?.mac_address)
                                "
                              >
                                <q-tooltip
                                  transition-show="fade"
                                  transition-hide="flip-left"
                                  class="bg-grey-10"
                                >
                                  Remover dispositivo con MAC {{ device.equipment?.mac_address }}
                                </q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </template>
                      </q-card-section>

                      <q-card-actions align="around">
                        <q-btn flat label="buscar" />
                        <q-btn flat label="añadir" />
                      </q-card-actions>
                    </q-card>
                  </div>
                  <!--  End Installed IPTV Devices   -->
                </template>
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

  <template v-if="uiStates.showDeleteItem">
    <delete-item-dialog
      :data="deleteProps"
      :visible="uiStates.showDeleteItem"
      @hide-dialog="resetShowDeleteItem"
    />
  </template>
</template>
<style lang="sass" scoped></style>
