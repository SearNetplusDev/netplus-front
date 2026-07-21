<script setup>
import { reactive, onMounted, ref, defineAsyncComponent } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const loading = ref(true)
const chartOptions = reactive({
  chart: {
    width: 200,
    height: 300,
    type: 'pie',
    background: 'transparent',
    foreColor: '#e2e8f0',
  },
  title: {
    text: 'Tipos de clientes',
    align: 'center',
    style: {
      color: '#f8fafc',
      fontSize: '18px',
      fontWeight: '600',
    },
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    labels: {
      color: '#cbd5e1',
    },
    markers: {
      width: 12,
      height: 12,
      radius: 12,
    },
    itemMargin: {
      horizontal: 12,
      vertical: 8,
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      colors: ['#ffffff'],
      fontSize: '13px',
      fontWeight: 'bold',
    },
  },
  plotOptions: {
    pie: {
      customScale: 0.9,
      size: '68%',
    },
  },
  tooltip: { theme: 'dark' },
  stroke: { colors: ['#1e293b'] },
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  labels: [],
  responsive: [
    {
      breakpoint: 480,
      options: {
        legend: { position: 'bottom' },
      },
    },
  ],
})
const chartSeries = ref([])
const getData = async () => {
  showLoading()
  loading.value = true
  try {
    const { data } = await api.get(`/api/v1/dashboard/client-types`)
    if (data) {
      chartOptions.labels = data.labels
      chartSeries.value = data.data
    } else {
      showNotification('Error', 'Algo ha salido mal.', 'red-10')
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      hideLoading()
      loading.value = false
    }, 150)
  }
}
onMounted(async () => {
  await getData()
})
</script>

<template>
  <q-card flat class="custom-cards">
    <q-inner-loading :showing="loading" />
    <ApexChart v-if="chartSeries.length" type="pie" :options="chartOptions" :series="chartSeries" />
  </q-card>
</template>

<style scoped></style>
