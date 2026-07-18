<script setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const loading = ref(true)
const options = { month: 'long' }
const monthName = new Date().toLocaleDateString('es-ES', options)
const chartOptions = ref({
  chart: {
    id: 'supports',
    foreColor: '#f8fafc',
    background: 'transparent',
    type: 'area',
    height: 300,
    width: 200,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    animations: {
      enabled: true,
    },
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      inverseColor: false,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  markers: {
    size: 0,
    hover: {
      size: 6,
    },
  },
  grid: {
    borderColor: '#f1f1f1',
    strokeDashArray: 4,
  },
  title: {
    text: `Soportes solucionados el mes de ${monthName}`,
    align: 'center',
    style: {
      color: '#f8fafc',
      fontSize: '18px',
      fontWeight: '600',
    },
  },
  xaxis: {
    categories: [],
    title: {
      text: 'Día del mes',
    },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    title: {
      text: 'Soportes solucionados',
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
  },
  tooltip: {
    shared: true,
    intersect: false,
    x: {
      formatter: (val) => `Día ${val}`,
    },
  },
  colors: ['#00E396', '#FEB019', '#008FFB', '#FF4560'],
})
const series = ref([])
const loadChart = async () => {
  showLoading()
  loading.value = true
  try {
    const { data } = await api.get('/api/v1/dashboard/supports-data')
    if (data) {
      chartOptions.value = {
        xaxis: {
          ...chartOptions.value.xaxis,
          categories: data.categories,
        },
      }
      series.value = data.series
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      loading.value = false
      hideLoading()
    }, 150)
  }
}
onMounted(async () => {
  await loadChart()
})
</script>

<template>
  <q-card flat class="custom-cards">
    <q-inner-loading :showing="loading" />
    <apex-chart type="area" :options="chartOptions" :series="series" />
  </q-card>
</template>

<style scoped></style>
