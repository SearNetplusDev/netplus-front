<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useClientServicesStore } from 'stores/client_services/clientServices.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import DataTable from 'components/services/general/DataTable.vue'
import MainContainer from 'components/services/general/MainContainer.vue'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const props = defineProps({
  id: Number,
})
const store = useClientServicesStore()
const uiState = ref({
  drawer: false,
  mode: 'list', // list | detail | new
  selectedService: null,
})
const servicesCount = computed(() => store.serviceCount)
const showDrawerButton = computed(() => uiState.value.mode !== 'list')
const showBackButton = computed(() => uiState.value.mode === 'detail' && servicesCount.value > 1)
const title = computed(() => {
  if (!store.client) return ''
  return `Servicio(s) de ${store.client.name} ${store.client.surname}`
})
const loadServices = async () => {
  try {
    showLoading()
    await store.fetchServices(props.id)

    if (store.serviceCount === 0) {
      uiState.value.mode = 'new'
      uiState.value.selectedService = { id: null, client_id: store.client?.id }
    } else if (store.serviceCount === 1) {
      uiState.value.mode = 'detail'
      uiState.value.selectedService = store.services[0]
      uiState.value.drawer = true
    } else {
      uiState.value.mode = 'list'
      uiState.value.selectedService = null
      uiState.value.drawer = false
    }
  } catch (err) {
    console.error(err)
    showNotification('Error', err, 'red-10')
  } finally {
    hideLoading()
  }
}
const handleServiceClick = (service) => {
  uiState.value.mode = 'detail'
  uiState.value.selectedService = service
  uiState.value.drawer = true
}
onMounted(loadServices)
</script>
<template>
  <q-layout view="hHh LpR fFF" container>
    <q-header class="q-header">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="menu"
          @click="uiState.drawer = !uiState.drawer"
          v-if="showDrawerButton"
        />
        <q-btn
          flat
          round
          dense
          icon="mdi-arrow-left"
          @click="((uiState.mode = 'list'), (uiState.drawer = false))"
          v-if="showBackButton"
        />
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn v-close-popup round dense icon="close" />
      </q-toolbar>
    </q-header>

    <footer-component />

    <q-page-container>
      <q-page padding class="q-pa-md bg-dark">
        <q-card class="custom-cards q-pa-sm" flat>
          <q-card-section>
            <template v-if="uiState.mode === 'new'">
              <main-container
                :data="uiState.selectedService"
                :show-drawer="false"
                @service-updated="uiState.selectedService = $event"
              />
            </template>

            <template v-else-if="uiState.mode === 'detail'">
              <main-container
                :data="uiState.selectedService"
                :show-drawer="uiState.drawer"
                @service-updated="uiState.selectedService = $event"
              />
            </template>

            <template v-else>
              <data-table :data="store.services" @view-service="handleServiceClick" />
            </template>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<style lang="sass" scoped></style>
