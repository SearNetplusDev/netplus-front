<script setup>
import { reactive, onMounted, ref } from 'vue'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useNotifications } from 'src/utils/notification.js'
import { useClipboard } from 'src/utils/clipboard.js'
import { useFormState } from 'src/utils/composables/operations/useFormState.js'
import { useDeviceManagement } from 'src/utils/composables/operations/useDeviceManagement.js'
import { useSupportData } from 'src/utils/composables/operations/useSupportData.js'
import { useLocationData } from 'src/utils/composables/operations/useLocationData.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import { useSupportFields } from 'src/utils/composables/operations/useSupportFields.js'
import { useSelectHandler } from 'src/utils/composables/operations/useSelectHandler.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import DeleteItemDialog from 'components/base/DeleteItemDialog.vue'
import EquipmentFormDialog from 'components/services/equipments/EquipmentFormDialog.vue'
import TvBoxFormDialog from 'components/services/iptv/FormDialog.vue'
import EquipmentSaleDialog from 'components/operations/technical/EquipmentSaleDialog.vue'
import DeviceManagementSection from 'components/operations/technical/DeviceManagementSection.vue'

const props = defineProps({
  id: { type: Number, required: true },
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
  technician: [],
})

// =====  Composables =====
const { showNotification } = useNotifications()
const { copy } = useClipboard()
const { state: uiStates, setTitle } = useFormState()
const { devices, setDevices } = useDeviceManagement()
const { fetchSupportData, saveSupportData /*, deleteDevice*/ } = useSupportData()
const { fields, mapSupportToFields /*, resetFields*/ } = useSupportFields()
const { normalFields, textAreaFields } = useFieldFilters(fields)
const { onNodeChange, onStateChange, onMunicipalityChange, loadAllLocationData } = useLocationData(
  fields,
  options,
)
const { handleSelectChange } = useSelectHandler(fields, {
  onNodeChange,
  onStateChange,
  onMunicipalityChange,
})

// =====  States  =====
const support = reactive({ data: {} })
const deleteProps = ref({})

// =====  Methods =====
const getData = async () => {
  uiStates.loading = true
  const supportData = await fetchSupportData(props.id)

  if (!supportData) {
    uiStates.loading = false
    return
  }
  support.data = supportData
  setTitle(supportData.ticket_number, supportData.type?.name)
  mapSupportToFields(supportData)
  setDevices(
    supportData.service?.internet_devices,
    supportData.service?.iptv_devices,
    supportData.service?.sold_devices,
  )

  await loadAllLocationData()
  uiStates.loading = false
}

const handleSave = async () => {
  uiStates.loading = true
  const success = await saveSupportData(props.id, fields)

  if (success) {
    await getData()
  }

  uiStates.loading = false
}
const showDeleteDialog = (type, deviceId, mac) => {
  const uri = type === 1 ? '/api/v1/services/equipment/internet' : '/api/v1/services/equipment/iptv'
  deleteProps.value = {
    title: 'Desvincular dispositivo',
    message: `¿Deseas desvincular el equipo con MAC ${mac} del servicio?`,
    id: deviceId,
    url: uri,
  }
  uiStates.showDeleteItem = true
}
const handleDialogClose = () => {
  uiStates.showDeleteItem = false
  getData()
}
const refreshComponent = () => {
  uiStates.showSearchInternetDevicesDialog = false
  uiStates.showSearchIptvDevicesDialog = false
  uiStates.showSearchSaleDevicesDialog = false
  getData()
}
const selectOptions = (field) => options[field] || []
const loadInitialData = async () => {
  try {
    const [types, client, service, profiles, nodes, branches, states, statuses, technicians] =
      await Promise.all([
        getSupportData('/api/v1/general/supports/types'),
        getSupportData(`/api/v1/clients/search/${fields.client.data}`),
        getSupportData(`/api/v1/services/client/${fields.client.data}`),
        getSupportData('/api/v1/general/profiles/internet'),
        getSupportData('api/v1/general/infrastructure/nodes'),
        getSupportData('/api/v1/general/branches'),
        getSupportData('/api/v1/general/states'),
        getSupportData('/api/v1/general/supports/status'),
        getSupportData('/api/v1/general/management/users/technicians'),
      ])

    Object.assign(options, {
      type: types,
      client,
      service,
      profile: profiles,
      node: nodes,
      branch: branches,
      state: states,
      status: statuses,
      technician: technicians,
    })
  } catch (err) {
    showNotification('Error', err.response?.data?.message || 'Error cargando datos', 'red-10')
  }
}
onMounted(async () => {
  await getData()
  await loadInitialData()
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="handleSave">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ uiStates.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="uiStates.loading"
            label="Procesar"
            type="submit"
            color="white"
          >
            <template #loading>
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
              <!--    Normal Fields   -->
              <div class="row wrap full-width justify-start items-center content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
                  v-for="(field, index) in normalFields"
                  :key="index"
                >
                  <template v-if="field.type === 'select'">
                    <q-select
                      v-model="field.data"
                      dense
                      dark
                      clearable
                      outlined
                      color="white"
                      emit-value
                      map-options
                      lazy-rules
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="selectOptions(index)"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      :disable="field.disabled || uiStates.loading"
                      @update:model-value="handleSelectChange(index, $event)"
                    />
                  </template>

                  <template v-if="field.type === 'text'">
                    <q-input
                      v-model="field.data"
                      dark
                      dense
                      outlined
                      clearable
                      color="white"
                      lazy-rules="ondemand"
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :disable="field.disabled || uiStates.loading"
                    />
                  </template>

                  <q-skeleton
                    class="q-my-md"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="uiStates.loading"
                  />
                </div>
              </div>
              <!--    End Normal Fields   -->

              <!--    Textarea Fields   -->
              <div class="row wrap full-width justify-start items-center content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-sm"
                  v-for="(field, index) in textAreaFields"
                  :key="index"
                >
                  <q-input
                    v-model="field.data"
                    type="textarea"
                    dark
                    dense
                    outlined
                    clearable
                    rows="4"
                    color="white"
                    v-if="!uiStates.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                    :disable="field.disabled || uiStates.loading"
                  />
                  <q-skeleton v-if="uiStates.loading" type="QInput" dark animation="fade" />
                </div>
              </div>
              <!--    End Textarea Fields -->

              <!--    Device management section   -->
              <device-management-section
                v-if="support.data?.service && !uiStates.loading"
                :support-data="support.data"
                :devices="devices"
                @show-delete-dialog="showDeleteDialog"
                @show-internet-devices-dialog="uiStates.showSearchInternetDevicesDialog = true"
                @show-iptv-devices-dialog="uiStates.showSearchIptvDevicesDialog = true"
                @show-sale-devices-dialog="uiStates.showSearchSaleDevicesDialog = true"
                @copy="copy"
              />
              <!--    End Device management section   -->
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>

  <delete-item-dialog
    v-if="uiStates.showDeleteItem"
    :data="deleteProps"
    :visible="uiStates.showDeleteItem"
    @hide-dialog="handleDialogClose"
  />

  <equipment-form-dialog
    v-if="uiStates.showSearchInternetDevicesDialog"
    :visible="uiStates.showSearchInternetDevicesDialog"
    :service="support.data.service?.id"
    @hide="refreshComponent"
  />

  <tv-box-form-dialog
    v-if="uiStates.showSearchIptvDevicesDialog"
    :id="0"
    :visible="uiStates.showSearchIptvDevicesDialog"
    :service="support.data.service?.id"
    @hide="refreshComponent"
  />

  <equipment-sale-dialog
    v-if="uiStates.showSearchSaleDevicesDialog"
    :visible="uiStates.showSearchSaleDevicesDialog"
    :service="support.data.service?.id"
    :client="support.data.service?.client_id"
  />
</template>

<style lang="sass" scoped></style>
