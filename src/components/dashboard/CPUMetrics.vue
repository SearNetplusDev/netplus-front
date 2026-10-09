<script setup>
import { computed, ref, defineAsyncComponent, onMounted } from 'vue'
import { useChart } from 'src/utils/composables/charts/useChart.js'
import { baseChartChrome, darkTooltip } from 'src/utils/composables/charts/useChartTheme.js'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const { loading, fetchDashboardData } = useChart('/api/v1/dashboard/resources')

const servers = ref([])

const COLOR_OK = '#00E396'
const COLOR_WARN = '#FEB019'
const COLOR_DANGER = '#FF4560'

const METRICS = [
  { label: 'CPU', value: (server) => server.cpu?.load_pct },
  { label: 'RAM', value: (server) => server.memory?.used_pct },
  { label: 'Almacenamiento', value: (server) => server.storage?.used_pct },
]

const serverName = (server) =>
  server.server?.name ?? server.system?.name ?? server.system?.board_name ?? 'Equipo sin nombre'

const toPct = (value) =>
  value === undefined || value === null ? null : Number(Number(value).toFixed(2))

const escapeHtml = (text) =>
  String(text ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  )

const rows = computed(() =>
  servers.value
    .map((server) => {
      const offline = server.online === false

      return {
        raw: server,
        offline,
        name: serverName(server),
        displayName: offline ? `${serverName(server)} (sin conexión)` : serverName(server),
        values: METRICS.map((metric) => (offline ? null : toPct(metric.value(server)))),
      }
    })
    .reverse(),
)

const chartSeries = computed(() =>
  rows.value.map((row) => ({
    name: row.displayName,
    data: METRICS.map((metric, index) => ({
      x: metric.label,
      y: row.values[index],
    })),
  })),
)

const chartHeight = computed(() => Math.max(rows.value.length * 52 + 70, 160))

const metricDetail = (server, metricIndex) => {
  if (metricIndex === 0 && server.cpu) {
    return `${server.cpu.count} núcleo(s) • ${server.cpu.frequency_mhz} MHz`
  }

  if (metricIndex === 1 && server.memory) {
    return `${server.memory.used_mb} / ${server.memory.total_mb} MB`
  }

  if (metricIndex === 2 && server.storage?.total_mb) {
    const used = (server.storage.total_mb - server.storage.free_mb).toFixed(2)
    return `${used} / ${server.storage.total_mb} MB`
  }

  return ''
}

const customTooltip = ({ seriesIndex, dataPointIndex }) => {
  const row = rows.value[seriesIndex]
  if (!row) return ''

  const server = row.raw
  const value = row.values[dataPointIndex]
  const detail = metricDetail(server, dataPointIndex)

  const extra = [
    server.system?.board_name,
    server.system?.version,
    server.system?.uptime && `Uptime ${server.system.uptime}`,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' • ')

  const metricLabel = METRICS[dataPointIndex]?.label ?? 'Métrica'

  return `
    <div style="padding:10px 12px; font-size:12px; line-height:1.6; min-width:180px">
      <div style="font-weight:700; margin-bottom:4px">${escapeHtml(row.displayName)}</div>
      <div>${escapeHtml(metricLabel)}: <b>${value === null ? 'N/D' : `${value}%`}</b></div>
      ${detail ? `<div>${escapeHtml(detail)}</div>` : ''}
      ${extra ? `<div style="color:#94A3B8; margin-top:3px">${extra}</div>` : ''}
    </div>
  `
}

const chartOptions = computed(() => ({
  chart: {
    ...baseChartChrome({
      type: 'heatmap',
      width: '100%',
      height: chartHeight.value,
    }),
    parentHeightOffset: 0,
    animations: {
      enabled: true,
      speed: 350,
      animateGradually: {
        enabled: true,
        delay: 35,
      },
    },
  },
  plotOptions: {
    heatmap: {
      radius: 5,
      enableShades: false,
      distributed: false,
      colorScale: {
        ranges: [
          {
            from: 0,
            to: 74.99,
            color: COLOR_OK,
            name: 'Normal',
          },
          {
            from: 75,
            to: 89.99,
            color: COLOR_WARN,
            name: 'Alerta',
          },
          {
            from: 90,
            to: 100,
            color: COLOR_DANGER,
            name: 'Crítico',
          },
        ],
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (value) =>
      value === null || value === undefined || Number(value) < 0 ? '' : `${Math.round(value)}%`,
    style: {
      colors: ['#0B1120'],
      fontSize: '12px',
      fontWeight: 700,
    },
  },
  stroke: {
    width: 3,
    colors: ['#1E293B'],
  },
  xaxis: {
    position: 'top',
    labels: {
      offsetY: -2,
      style: {
        colors: ['#F8FAFC'],
        fontSize: '12px',
        fontWeight: 600,
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      maxWidth: 220,
      style: {
        colors: ['#CBD5E1'],
        fontSize: '12px',
        fontWeight: 500,
      },
    },
  },
  grid: {
    show: false,
    padding: {
      top: 4,
      right: 4,
      bottom: 0,
      left: 4,
    },
  },
  states: {
    hover: {
      filter: {
        type: 'lighten',
        value: 0.12,
      },
    },
    active: {
      filter: { type: 'none' },
    },
  },
  legend: { show: false },
  tooltip: darkTooltip({ custom: customTooltip }),
  noData: {
    text: 'No hay métricas disponibles',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      color: '#94A3B8',
      fontSize: '13px',
    },
  },
}))

onMounted(() => {
  fetchDashboardData((response) => {
    servers.value = response.data ?? []
  })
})
</script>

<template>
  <q-card flat class="custom-cards dashboard-widget heatmap-card">
    <q-inner-loading :showing="loading" />

    <div class="heatmap-header">
      <div class="heatmap-heading">
        <div class="heatmap-icon">
          <q-icon name="monitor_heart" size="20px" />
        </div>

        <div>
          <div class="heatmap-title">Recursos de servidores</div>
          <div class="heatmap-subtitle">Consumo de CPU, memoria y almacenamiento</div>
        </div>
      </div>

      <div class="heatmap-legend">
        <span class="legend-item">
          <i :style="{ background: COLOR_OK }" />
          Normal (&lt; 75%)
        </span>

        <span class="legend-item">
          <i :style="{ background: COLOR_WARN }" />
          Alerta (75–90%)
        </span>

        <span class="legend-item">
          <i :style="{ background: COLOR_DANGER }" />
          Crítico (&gt; 90%)
        </span>
      </div>
    </div>

    <apex-chart
      v-if="rows.length"
      type="heatmap"
      :height="chartHeight"
      :options="chartOptions"
      :series="chartSeries"
    />

    <div v-else-if="!loading" class="heatmap-empty">No hay servidores de autenticación activos</div>
  </q-card>
</template>

<style lang="sass" scoped>
.heatmap-card
  position: relative
  min-width: 0
  min-height: 160px
  padding: 18px
  border: 1px solid rgba(148, 163, 184, 0.12)
  border-radius: 14px
  background: #1E293B

.heatmap-header
  display: flex
  align-items: center
  justify-content: space-between
  flex-wrap: wrap
  gap: 16px
  margin-bottom: 12px

.heatmap-heading
  display: flex
  align-items: center
  gap: 12px

.heatmap-icon
  display: flex
  align-items: center
  justify-content: center
  width: 40px
  height: 40px
  flex-shrink: 0
  border-radius: 10px
  color: #38BDF8
  background: rgba(56, 189, 248, 0.12)

.heatmap-title
  color: #F8FAFC
  font-size: 15px
  font-weight: 600

.heatmap-subtitle
  margin-top: 4px
  color: #94A3B8
  font-size: 12px

.heatmap-legend
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 12px
  color: #CBD5E1
  font-size: 11px

.legend-item
  display: inline-flex
  align-items: center
  gap: 6px
  white-space: nowrap

  i
    display: inline-block
    width: 8px
    height: 8px
    flex-shrink: 0
    border-radius: 50%

.heatmap-empty
  padding: 40px 12px
  text-align: center
  color: #94A3B8
  font-size: 13px

@media (max-width: 600px)
  .heatmap-card
    padding: 12px

  .heatmap-header
    align-items: flex-start

  .heatmap-legend
    gap: 8px
</style>
