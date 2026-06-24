<script setup>
import { reactive, onMounted, ref, defineAsyncComponent } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const chartOptions = reactive({
  chart: {
    type: 'radialBar',
    width: 200,
    height: 300,
    background: 'transparent',
    foreColor: '#e2e8f0',
  },
  labels: ['CPU', 'Memoria', 'Almacenamiento'],
  colors: ['#00B4D8', '#48CAE4', '#90E0EF'],
  title: {
    text: '',
    align: 'center',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#ffffff',
    },
  },
  plotOptions: {
    radialBar: {
      track: {
        background: '#334155',
      },
      dataLabels: {
        name: { fontSize: '14px' },
        value: { fontSize: '16px', color: '#ffffff' },
        total: {
          show: true,
          label: 'Promedio',
          color: '#ffffff',
          formatter: (val) => {
            const total = val.globals.seriesTotals.reduce((a, b) => a + b, 0)
            return (total / val.globals.seriesTotals.length).toFixed(2) + '%'
          },
        },
      },
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    labels: {
      colors: '#ffffff',
    },
  },
})
const chartSeries = ref([])
const colorByThreshold = (pct) => {
  if (pct > 90) return '#ff4560'
  if (pct > 75) return '#feb019'
  return ['#00e396']
}
const getData = async () => {
  showLoading()
  try {
    const { data } = await api.get('/api/v1/dashboard/resources')
    if (data?.data) {
      const { cpu, memory, storage, system } = data.data
      chartSeries.value = [
        cpu.load_pct,
        Number(memory.used_pct.toFixed(2)),
        Number(storage.used_pct.toFixed(2)),
      ]
      const dynamicColors = [
        colorByThreshold(cpu.load_pct),
        colorByThreshold(memory.used_pct),
        colorByThreshold(storage.used_pct),
      ]

      chartOptions.colors = [...dynamicColors]
      chartOptions.title.text = `Estado de equipo ${system.board_name}`
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
    }, 150)
  }
}
onMounted(async () => {
  await getData()
})
</script>

<template>
  <q-card flat class="custom-cards">
    <apex-chart
      type="radialBar"
      :options="chartOptions"
      :series="chartSeries"
      :key="JSON.stringify(chartOptions.colors)"
    />
  </q-card>
</template>

<style lang="sass" scoped>
.custom-header
  color: #f8fafc
  font-weight: 600
  font-size: 18px
</style>
