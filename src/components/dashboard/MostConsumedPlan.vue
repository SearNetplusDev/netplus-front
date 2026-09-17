<script setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useChart } from 'src/utils/composables/charts/useChart.js'
import { baseChartChrome, chartTitle } from 'src/utils/composables/charts/useChartTheme.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { loading, fetchDashboardData } = useChart('/api/v1/dashboard/top-profiles')

const chartOptions = ref({
  chart: baseChartChrome({ id: 'consumed-plans', height: 350, width: '100%' }),
  title: chartTitle('Top 10 planes más contratados'),
  xaxis: {
    axisBorder: { color: '#94A3B8' },
    axisTick: { color: '#94A3B8' },
    categories: [],
    labels: { style: { colors: '#F8FAFC', fontSize: '12px' } },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#F8FAFC',
        fontSize: '12px',
      },
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
    },
  },
  responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
})
const chartSeries = ref([{ name: 'Total de servicios', data: [] }])
onMounted(() => {
  fetchDashboardData((data) => {
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: { ...chartOptions.value.xaxis, categories: data.labels },
    }
    chartSeries.value = [{ name: 'Total de servicios', data: data.data }]
  })
})
</script>
<template>
  <q-card flat class="custom-cards dashboard-widget">
    <q-inner-loading :showing="loading" />
    <apex-chart
      v-if="chartSeries.length"
      type="bar"
      :options="chartOptions"
      :series="chartSeries"
    />
  </q-card>
</template>
<style lang="sass" scoped></style>
