<script setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const loading = ref(true)
const chartOptions = ref({
  chart: {
    id: 'consumed-plans',
    foreColor: '#f8fafc',
    width: 200,
    height: 300,
    background: 'transparent',
  },
  title: {
    text: 'Top 10 planes más contratados',
    align: 'center',
    style: {
      color: '#f8fafc',
      fontSize: '18px',
      fontWeight: '600',
    },
  },
  xaxis: {
    axisBorder: {
      color: '#94a3b8',
    },
    axisTick: {
      color: '#94a3b8',
    },
    categories: [],
    labels: {
      style: {
        colors: '#f8fafc',
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#f8fafc',
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
  responsive: [
    {
      breakpoint: 480,
      options: {
        legend: { position: 'bottom' },
      },
    },
  ],
})
const chartSeries = ref([{ name: 'Total de servicios', data: [] }])
const getData = async () => {
  showLoading()
  loading.value = true
  try {
    const { data } = await api.get('/api/v1/dashboard/top-profiles')
    if (data) {
      chartOptions.value = {
        xaxis: {
          ...chartOptions.value.xaxis,
          categories: data.labels,
        },
      }
      chartSeries.value = [{ name: 'Total de servicios', data: data.data }]
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
  await getData()
})
</script>

<template>
  <q-card flat class="custom-cards">
    <q-inner-loading :showing="loading" />
    <apex-chart type="bar" :options="chartOptions" :series="chartSeries" />
  </q-card>
</template>

<style scoped lang="sass"></style>
