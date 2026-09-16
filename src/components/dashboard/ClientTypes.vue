<script setup>
import { reactive, onMounted, ref, defineAsyncComponent } from 'vue'
import { useChart } from 'src/utils/composables/charts/useChart.js'
import {
  baseChartChrome,
  chartTitle,
  chartLegend,
  darkTooltip,
  whiteDataLabels,
  CHART_PALETTE,
} from 'src/utils/composables/charts/useChartTheme.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { loading, fetchDashboardData } = useChart('/api/v1/dashboard/client-types')

const chartOptions = reactive({
  chart: baseChartChrome({ type: 'pie', height: 300 }),
  title: chartTitle('Tipos de clientes'),
  legend: chartLegend(),
  dataLabels: whiteDataLabels(),
  plotOptions: { pie: { customScale: 0.9, size: '68%' } },
  tooltip: darkTooltip(),
  stroke: { colors: ['#1e293b'] },
  colors: CHART_PALETTE.clientTypes,
  labels: [],
  responsive: [{ breakpoint: 400, options: { legend: { position: 'bottom' } } }],
})
const chartSeries = ref([])
onMounted(() => {
  fetchDashboardData((data) => {
    chartOptions.labels = data.labels
    chartSeries.value = data.data
  })
})
</script>
<template>
  <q-card flat class="custom-cards dashboard-widget">
    <q-inner-loading :showing="loading" />
    <apex-chart
      v-if="chartSeries.length"
      type="pie"
      :options="chartOptions"
      :series="chartSeries"
    />
  </q-card>
</template>
<style scoped lang="sass"></style>
