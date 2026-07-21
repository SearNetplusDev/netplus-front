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
    animations: {
      enabled: true,
      easing: 'easeinount',
      speed: 900,
    },
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
    formatter(val) {
      return `${val.toFixed(0)}%`
    },
    style: {
      colors: ['#ffffff'],
      fontSize: '12px',
      fontWeight: 600,
    },
    dropShadow: {
      enabled: false,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          label: 'Total',
          color: '#94a3b8',
          formatter: function (w) {
            return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
          },
        },
        value: {
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: '700',
        },
      },
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
  tooltip: {
    theme: 'dark',
  },
  stroke: {
    colors: ['#1e293b'],
    width: 2,
  },
  colors: [
    '#3b82f6', // Emitidas
    '#f59e0b', // Pendientes
    '#22c55e', // Pagadas
    '#ef4444', // Vencidas
    '#64748b', // Canceladas
    '#8338ec', // Parcialmente pagadas
  ],
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: {
          width: '100%',
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
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
