<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import DataTable from 'components/services/general/DataTable.vue'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const title = ref('')
const props = defineProps({
  id: Number,
})
const loading = ref(false)
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
      services.value = res.data.client?.services
      title.value = `Servicio(s) de ${res.data.client?.name} ${res.data.client?.surname}`
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
const servicesCount = computed(() => {
  return Object.keys(services.value).length
})
onMounted(() => {
  getServices()
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-header class="q-header">
      <q-toolbar>
        <q-btn flat round dense icon="menu" />
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn v-close-popup round dense icon="close" />
      </q-toolbar>
    </q-header>

    <FooterComponent />

    <q-page-container>
      <q-page padding class="q-pa-md bg-dark">
        <q-card class="custom-cards q-pa-sm" flat>
          <q-card-section>
            <template v-if="servicesCount <= 1">
              <div class="text-subtitle1 text-amber">No mostrar tabla</div>
            </template>

            <template v-else>
              <data-table :data="services" />
            </template>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
