<script setup>
import { reactive, defineAsyncComponent, ref } from 'vue'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'
import RealtimeDialog from 'components/monitoring/internet/RealtimeDialog.vue'

const SupportForm = defineAsyncComponent(() => import('components/supports/SupportFormDialog.vue'))
const ServiceContainer = defineAsyncComponent(
  () => import('components/services/general/MainContainer.vue'),
)
const { copy } = useClipboard()
const showServiceDialog = ref(false)
const serviceData = ref(null)
const ui_states = reactive({
  pppoe_user: null,
  showNavigation: false,
  showSupportForm: false,
  presetClient: null,
})
const columns = reactive([
  {
    name: 'financial_status',
    label: 'Estado financiero',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/billing/statuses',
    options: [],
    align: 'left',
  },
  { name: 'client', label: 'Cliente', align: 'left' },
  { name: 'branch', label: 'Sucursal', align: 'left' },
  { name: 'mobile', label: 'Teléfono', align: 'left' },
  { name: 'pppoe', label: 'Usuario PPPoe', align: 'left' },
  { name: 'ip', label: 'IP', align: 'left' },
  { name: 'mac', label: 'Caller', align: 'left' },
  { name: 'uptime', label: 'Tiempo de conexión', align: 'left' },
  { name: 'actions', label: '', align: 'center' },
])
const showRealtimeData = (user) => {
  ui_states.pppoe_user = user
  ui_states.showNavigation = true
}
const resetParams = () => {
  ui_states.pppoe_user = null
  ui_states.showNavigation = false
}
const openSupportForm = (client) => {
  if (!client) return
  ui_states.presetClient = {
    id: client.id,
    name: `${client.name} ${client.surname}`.trim(),
  }
  ui_states.showSupportForm = true
}
const resetSupportForm = () => {
  ui_states.showSupportForm = false
  ui_states.presetClient = null
}
const openService = (row) => {
  if (!row.service_id) return
  serviceData.value = {
    id: row.service_id,
    client_id: row.client_id || null,
    client: row.client,
  }
  showServiceDialog.value = true
}
const closeServiceDialog = () => {
  showServiceDialog.value = false
  serviceData.value = null
}
const openLink = (link) => {
  window.open(`http://${link}`, '_blank')
}
</script>
<template>
  <div>
    <!--    Diálogo de tiempo real    -->
    <template v-if="ui_states.showNavigation === true">
      <RealtimeDialog
        :user="ui_states.pppoe_user"
        v-model:visible="ui_states.showNavigation"
        @hide-dialog="resetParams"
      />
    </template>
    <!--    Fin diálogo de tiempo real    -->

    <!--    Diálogo de creación de soporte    -->
    <q-dialog v-model="ui_states.showSupportForm" maximized @hide="resetSupportForm">
      <SupportForm :id="0" :preset-client="ui_states.presetClient" />
    </q-dialog>
    <!--    Fin diálogo de creación de soporte    -->

    <!--    Diálogo para mostrar el servicio    -->
    <q-dialog v-model="showServiceDialog" maximized @hide="closeServiceDialog">
      <q-layout view="hHh LpR fFF" container class="bg-dark">
        <q-header class="q-header">
          <q-toolbar>
            <q-toolbar-title>
              Detalle del servicio # {{ serviceData?.id }}
              <span v-if="serviceData.client" class="text-weight-light">
                - {{ serviceData.client?.name }} {{ serviceData.client?.surname }}
              </span>
            </q-toolbar-title>
            <q-btn v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-card dark flat class="q-pa-xs">
            <q-card-section>
              <ServiceContainer :data="serviceData" :show-drawer="true" />
            </q-card-section>
          </q-card>
        </q-page-container>
      </q-layout>
    </q-dialog>
    <!--    Fin diálogo para mostrar el servicio    -->

    <base-data-table :columns="columns">
      <template v-slot:body="{ props }">
        <q-tr :props="props">
          <!--    Financial Status    -->
          <q-td key="financial_status" :props="props">
            <q-badge
              class="text-center text-weight-bold q-py-xs"
              :style="{
                backgroundColor: props.row.client?.financial_status?.status?.badge_color,
              }"
              :label="props.row.client?.financial_status?.status?.name"
            />
          </q-td>

          <!--    Client    -->
          <q-td key="client" class="text-left" :props="props">
            {{ props.row.client?.name }}
            {{ props.row.client?.surname }}
          </q-td>

          <!--    Branch    -->
          <q-td key="branch" class="text-left" :props="props">
            {{ props.row.client?.branch?.name }}
          </q-td>

          <!--    Phone   -->
          <q-td
            key="mobile"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row.client?.mobile?.number)"
          >
            {{ props.row.client?.mobile?.number }}
          </q-td>

          <!--    PPPoe User    -->
          <q-td
            key="pppoe"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row.pppoe_user)"
          >
            {{ props.row.pppoe_user }}
          </q-td>

          <!--    IP    -->
          <q-td
            key="ip"
            class="text-left copy-text"
            :props="props"
            @click="openLink(props.row.ip_address)"
          >
            {{ props.row.ip_address }}
          </q-td>

          <!--    Caller    -->
          <q-td
            key="mac"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row.caller_id)"
          >
            {{ props.row.caller_id }}
          </q-td>

          <!--    Uptime    -->
          <q-td key="uptime" class="text-left copy-text" :props="props">
            {{ props.row.uptime_human }}
          </q-td>

          <!--    Actions   -->
          <q-td key="actions" :props="props">
            <q-btn-group>
              <q-btn
                color="teal-10"
                size="sm"
                icon="mdi-web-sync"
                @click="showRealtimeData(props.row.pppoe_user)"
              >
                <q-tooltip transition-show="fade" transition-hide="slide-down" class="bg-grey-10">
                  Ver datos en tiempo real de {{ props.row.pppoe_user }}
                </q-tooltip>
              </q-btn>

              <q-btn
                color="blue-10"
                size="sm"
                icon="mdi-headset"
                :disable="!props.row.client"
                @click="openSupportForm(props.row.client)"
              >
                <q-tooltip transition-show="fade" transition-hide="slide-down" class="bg-grey-10">
                  Crear soporte para {{ props.row.client?.name }} {{ props.row.client?.surname }}
                </q-tooltip>
              </q-btn>

              <q-btn
                color="indigo-6"
                size="sm"
                icon="mdi-account-details"
                :disable="!props.row.service_id"
                @click="openService(props.row)"
              >
                <q-tooltip transition-show="fade" transition-hide="slide-down" class="bg-grey-10">
                  Ver datos del servicio (ID: {{ props.row.service_id }}) de
                  {{ props.row.client?.name }} {{ props.row.client?.surname }}
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-td>
        </q-tr>
      </template>
    </base-data-table>
  </div>
</template>
<style scoped lang="sass"></style>
