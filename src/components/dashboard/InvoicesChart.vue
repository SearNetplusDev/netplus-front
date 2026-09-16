<script setup>
import { defineAsyncComponent, ref, onMounted } from 'vue'
import { useChart } from 'src/utils/composables/charts/useChart.js'
import {
  baseChartChrome,
  chartTitle,
  chartLegend,
  darkTooltip,
  CHART_PALETTE,
} from 'src/utils/composables/charts/useChartTheme.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { loading, fetchDashboardData } = useChart('api/v1/dashboard/invoices-stats')
const chartOptions = ref({
  chart: {
    ...baseChartChrome({ id: 'invoices-statuses-chart', type: 'donut', height: 350 }),
    animations: { enabled: true, easing: 'easeinout', speed: 900 },
  },
  title: chartTitle('Estado de facturas'),
  labels: [],
  dataLabels: {
    enabled: true,
    formatter(val) {
      return val >= 5 ? `${val.toFixed(0)}%` : ''
    },
    style: {
      colors: ['#fff'],
      fontSize: '12px',
      fontWeight: 600,
    },
    dropShadow: { enabled: false },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          label: 'Total',
          color: '#94a3b8',
          formatter: (val) => val.globals.seriesTotals.reduce((a, b) => a + b, 0),
        },
        value: { color: '#fff', fontSize: '24px', fontWeight: 700 },
      },
    },
  },
  legend: chartLegend(),
  tooltip: darkTooltip(),
  stroke: { colors: ['#1e293b'], width: 2 },
  colors: CHART_PALETTE.invoices,
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: { width: '100%' },
        legend: { position: 'bottom' },
      },
    },
  ],
})
const chartSeries = ref([])
onMounted(() => {
  fetchDashboardData((data) => {
    chartOptions.value = {
      ...chartOptions.value,
      labels: data.labels,
      title: { ...chartOptions.value.title, text: `Estado de facturas del período ${data.period}` },
    }
    chartSeries.value = data.series
  })
})
</script>

<template>
  <q-card flat class="custom-cards dashboard-widget">
    <q-inner-loading :showing="loading" />
    <apex-chart
      v-if="chartSeries.length"
      type="donut"
      :options="chartOptions"
      :series="chartSeries"
    />
  </q-card>
</template>

<style scoped></style>
