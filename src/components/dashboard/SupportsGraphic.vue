<script setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useChart } from 'src/utils/composables/charts/useChart.js'
import {
  baseChartChrome,
  chartTitle,
  CHART_PALETTE,
} from 'src/utils/composables/charts/useChartTheme.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { loading, fetchDashboardData } = useChart('/api/v1/dashboard/supports-data')
const monthName = new Date().toLocaleDateString('es-ES', { month: 'long' })
const chartOptions = ref({
  chart: {
    ...baseChartChrome({ id: 'supports-chart', type: 'area', height: 350, width: '100%' }),
    zoom: { enabled: false },
    animations: { enabled: true },
  },
  stroke: { curve: 'smooth', width: 3 },
  dataLabels: { enabled: false },
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
  markers: { size: 0, hover: { size: 6 } },
  grid: { borderColor: '#F1F1F1', strokeDasharray: 4 },
  title: chartTitle(`Soportes solucionados durante el mes de ${monthName}`),
  xaxis: { categories: [], title: { text: 'Día del mes' } },
  yaxis: { min: 0, forceNiceScale: true, title: { text: 'Soportes solucionados' } },
  legend: { position: 'top', horizontalAlign: 'left' },
  tooltip: {
    shared: true,
    intersect: false,
    x: { formatter: (val) => `Día ${val} de ${monthName}` },
  },
  colors: CHART_PALETTE.supports,
})
const series = ref([])
onMounted(() => {
  fetchDashboardData((data) => {
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: { ...chartOptions.value.xaxis, categories: data.categories },
    }
    series.value = data.series
  })
})
</script>
<template>
  <q-card flat class="custom-cards dashboard-widget">
    <q-inner-loading :showing="loading" />
    <apex-chart v-if="series.length" type="area" :options="chartOptions" :series="series" />
  </q-card>
</template>
<style lang="sass" scoped></style>
