<script setup>
import { reactive, onMounted, ref, defineAsyncComponent } from 'vue'
import { useChart } from 'src/utils/composables/charts/useChart.js'
import {
  baseChartChrome,
  chartLegend,
  colorByThreshold,
} from 'src/utils/composables/charts/useChartTheme.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { loading, fetchDashboardData } = useChart('/api/v1/dashboard/resources')
const chartOptions = reactive({
  chart: baseChartChrome({ type: 'radialBar', height: 300 }),
  labels: ['CPU', 'Memoria', 'Almacenamiento'],
  colors: ['#00b4d8', '#48cae4', '#90e0ef'],
  title: {
    text: '',
    align: 'center',
    style: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  },
  plotOptions: {
    radialBar: {
      size: '75%',
      track: { background: '#334155' },
      dataLabels: {
        name: { fontsize: '14px' },
        value: { fontsize: '16px', color: '#fff' },
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
  legend: chartLegend(),
})
const chartSeries = ref([])
onMounted(() => {
  fetchDashboardData((data) => {
    const { cpu, memory, storage, system } = data.data
    chartSeries.value = [
      cpu.load_pct,
      Number(memory.used_pct.toFixed(2)),
      Number(storage.used_pct.toFixed(2)),
    ]
    chartOptions.colors = [
      colorByThreshold(cpu.load_pct),
      colorByThreshold(memory.used_pct),
      colorByThreshold(storage.used_pct),
    ]
    chartOptions.title.text = `Estado de equipo ${system.board_name}`
  })
})
</script>

<template>
  <q-card flat class="custom-cards dashboard-widget">
    <q-inner-loading :showing="loading" />
    <apex-chart
      v-if="chartSeries.length"
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
