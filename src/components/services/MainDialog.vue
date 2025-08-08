<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import DataTable from 'components/services/general/DataTable.vue'
import MainContainer from 'components/services/general/MainContainer.vue'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const title = ref('')
const props = defineProps({
  id: Number,
})
const loading = ref(false)
const drawer = ref(false)
const data = ref([])
const services = ref([])
const getServices = () => {
  loading.value = true
  showLoading()
  let uri = `/api/v1/services/client/`
  let params = new FormData()
  params.append('client', props.id)
  api
    .post(uri, params)
    .then((res) => {
      data.value = res.data.client
      services.value = res.data.client?.services || []
      title.value = `Servicio(s) de ${res.data.client?.name} ${res.data.client?.surname}`

      const count = services.value.length
      if (count === 1) {
        selectedService.value = services.value[0]
        drawer.value = true
      } else {
        drawer.value = false
        selectedService.value = { client_id: res.data.client?.id }
        showServiceDetails.value = false
      }
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 300)
    })
}
const selectedService = ref({})
const showServiceDetails = ref(false)
const handleServiceClick = (service) => {
  selectedService.value = service
  showServiceDetails.value = true
  drawer.value = true
}
const servicesCount = computed(() => {
  return services.value.length
})
const showDrawerButton = computed(() => {
  return servicesCount.value === 1 || showServiceDetails.value
})
const showBackButton = computed(() => {
  return showServiceDetails.value && servicesCount.value >= 2
})
onMounted(() => {
  getServices()
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-header class="q-header">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="drawer = !drawer" v-if="showDrawerButton" />
        <q-btn
          flat
          round
          dense
          icon="mdi-arrow-left"
          @click="((showServiceDetails = false), (drawer = false))"
          v-if="showBackButton"
        />
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn v-close-popup round dense icon="close" />
      </q-toolbar>
    </q-header>

    <FooterComponent />

    <q-page-container>
      <q-page padding class="q-pa-md bg-dark">
        <q-card class="custom-cards q-pa-sm" flat>
          <q-card-section>
            <template v-if="servicesCount === 0">
              <main-container :data="selectedService" :show-drawer="false" />
            </template>
            <template v-else-if="servicesCount === 1 || showServiceDetails">
              <main-container :data="selectedService" :show-drawer="drawer" />
            </template>

            <template v-else>
              <data-table :data="services" @view-service="handleServiceClick" />
            </template>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
