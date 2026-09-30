<script setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useChart } from 'src/utils/composables/charts/useChart.js'
import { useMoneyFormatter } from 'src/utils/composables/accounting/useMoneyFormatter.js'
import {
  CHART_PALETTE,
  baseChartChrome,
  chartTitle,
} from 'src/utils/composables/charts/useChartTheme.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { loading, fetchDashboardData } = useChart('/api/v1/dashboard/stats/daily-payments')
const { formatMoney } = useMoneyFormatter()
const chartOptions = ref({
  chart: baseChartChrome({ id: 'daily-payments', height: 350, width: '100%' }),
  title: chartTitle(`Ingresos mensuales correspondiente a pago de recibos`),
  subtitle: {
    text: '',
    align: 'center',
    style: { color: '#CBD5E1', fontSize: '13px' },
  },
  zoom: { enabled: false },
  colors: CHART_PALETTE.payments,
  stroke: { curve: 'smooth', width: 2 },
  // plotOptions: {
  //   bar: {
  //     borderRadius: 4,
  //     horizontal: false,
  //     columnWidth: '60%',
  //   },
  // },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  markers: {
    size: 4,
    strokeWidth: 0,
    hover: { size: 6 },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: [],
    title: { text: 'Día del mes', style: { color: '#CBD5E1' } },
    axisBorder: { color: '#94A3B8' },
    axisTick: { color: '#94A3B8' },
    labels: { style: { colors: '#F8FAFC', fontSize: '12px' } },
  },
  yaxis: {
    min: 0,
    labels: {
      style: { colors: '#F8FAFC', fontSize: '12px' },
      formatter: (value) => formatMoney(value),
    },
  },
  grid: { borderColor: '#334155', strokeDashArray: 4 },
  tooltip: {
    shared: true,
    intersect: false,
    x: { formatter: (val) => `Día ${val}` },
    y: { formatter: (val) => formatMoney(val) },
  },
  responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
})
const chartSeries = ref([{ name: 'Cantidad ingresada', data: [] }])

onMounted(() => {
  fetchDashboardData((data) => {
    chartOptions.value = {
      ...chartOptions.value,
      subtitle: {
        ...chartOptions.value.subtitle,
        text: `Total del mes: ${formatMoney(data.total)}`,
      },
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: data.categories,
      },
    }
    chartSeries.value = data.series
  })
})
</script>
<template>
  <q-card class="custom-cards dashboard-widget">
    <q-inner-loading :showing="loading" />

    <apex-chart
      v-if="chartSeries.length"
      type="area"
      :options="chartOptions"
      :series="chartSeries"
    />
  </q-card>
</template>
<style></style>
