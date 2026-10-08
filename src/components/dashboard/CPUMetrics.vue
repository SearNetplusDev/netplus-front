<script setup>
import { computed, onMounted, ref, defineAsyncComponent } from 'vue'
import { useChart } from 'src/utils/composables/charts/useChart.js'
import {
  baseChartChrome,
  chartLegend,
  colorByThreshold,
} from 'src/utils/composables/charts/useChartTheme.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { loading, fetchDashboardData } = useChart('/api/v1/dashboard/resources')
const servers = ref([])
const serverName = (s) => s.server?.name ?? s.system?.name ?? s.system?.boad_name ?? '???'
const buildOptions = (labels, values) => ({
  chart: baseChartChrome({ type: 'radialBar', width: '100%', height: 280 }),
  labels,
  colors: values.map((v) => colorByThreshold(v)),
  plotOptions: {
    radialBar: {
      track: { background: '#334155' },
      dataLabels: {
        name: { fontsize: '14px' },
        value: { fontsize: '16px', color: '#fff' },
        total: {
          show: true,
          label: 'Promedio',
          color: '#fff',
          formatter: (val) => {
            const totals = val.globals.seriesTotals
            const avg = totals.reduce((a, b) => a + b, 0) / totals.length
            return avg.toFixed(2) + '%'
          },
        },
      },
    },
  },
  legend: chartLegend,
})
const cards = computed(() =>
  servers.value.map((s, index) => {
    const offline = s.online === false
    const metrics = [
      { label: 'CPU', value: s.cpu?.load_pct },
      { label: 'RAM', value: s.memory?.used_pct },
      { label: 'ROM', value: s.storage?.used_pct },
    ].filter((m) => m.value !== undefined && m.value !== null)
    const values = metrics.map((m) => Number(Number(m.value).toFixed(2)))
    const options = buildOptions(
      metrics.map((m) => m.label),
      values,
    )

    return {
      key: `${s.server?.id ?? index}-${options.colors.join('')}`,
      name: serverName(s),
      offline,
      error: s.error,
      series: values,
      options,
      details: [
        s.system?.board_name,
        s.system?.version ? `RouterOS ${s.system.version}` : null,
        s.system?.uptime ? `Uptime ${s.system?.uptime}` : null,
      ].filter(Boolean),
      hardware: s.cpu
        ? `${s.cpu.count} CPU • ${s.cpu.frequency_mhz} MHz • ` +
          `${s.memory?.used_mb ?? 0}/${s.memory?.total_mb ?? 0} MB RAM`
        : null,
    }
  }),
)
onMounted(() => {
  fetchDashboardData((response) => {
    servers.value = response.data ?? []
  })
})
</script>
<template>
  <div class="cpu-metrics">
    <q-inner-loading :showing="loading" />

    <div class="row q-col-gutter-lg">
      <div v-for="card in cards" :key="card.key" class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <q-card flat class="custom-cards dashboard-widget">
          <div class="server-title">{{ card.name }}</div>

          <div v-if="card.details.length" class="server-subtitle">
            {{ card.details.join(' · ') }}
          </div>

          <div v-if="card.offline" class="server-offline">
            <q-icon name="cloud_off" size="32px" />
            <div>Equipo sin conexión</div>
            <div v-if="card.error" class="server-offline-error">{{ card.error }}</div>
          </div>

          <apex-chart
            v-else-if="card.series.length"
            type="radialBar"
            :options="card.options"
            :series="card.series"
          />

          <div v-if="card.hardware && !card.offline" class="server-subtitle q-pb-none">
            {{ card.hardware }}
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>
<style lang="sass" scoped>
.cpu-metrics
  position: relative
  min-height: 120px

.server-title
  padding: 14px 16px 0
  text-align: center
  color: #f8fafc
  font-weight: 600
  font-size: 16px

.server-subtitle
  padding: 4px 16px 0
  text-align: center
  color: #94A3B8
  font-size: 16px

.server-offline
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 6px
  min-height: 240px
  color: #EF4444

.server-offline-error
  max-width: 90%
  text-align: center
  color: #94A3B8
  font-size: 11px
</style>
