<script setup>
import { defineAsyncComponent, ref, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

const apexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const loading = ref(true)
const chartOptions = ref({
  chart: {
    id: 'invoices-statuses-chart',
    foreColor: '#f8fafc',
    width: 200,
    height: 300,
    background: 'transparent',
    toolbar: false,
    type: 'donut',
  },
  title: {
    text: 'Estado de facturas',
    align: 'center',
    style: {
      color: '#f8fafc',
      fontSize: '18px',
      fontWeight: '600',
    },
  },
  labels: [],
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
      donut: {
        size: '60%',
      },
    },
  },
  legend: {
    position: 'bottom',
    labels: {
      color: '#cbd5e1',
    },
    fontSize: '14px',
  },
  tooltip: {
    theme: 'dark',
  },
  stroke: {
    colors: ['#1e293b'],
    width: 2,
  },
})
const chartSeries = ref([])
const getChartData = async () => {
  showLoading()
  loading.value = true
  try {
    const { data } = await api.get('/api/v1/dashboard/invoices-stats')
    if (data) {
      chartOptions.value = {
        // ...chartOptions.value,
        labels: data.labels,
      }
      chartSeries.value = data.series
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
  await getChartData()
})
</script>

<template>
  <q-card flat class="custom-cards">
    <q-inner-loading :showing="loading" />
    <apex-chart type="donut" :options="chartOptions" :series="chartSeries" />
  </q-card>
</template>

<style scoped></style>
