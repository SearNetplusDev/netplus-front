<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { formatLongDateTime } = useDateFormatter()
const props = defineProps({
  user: { type: String, required: true },
  visible: { type: Boolean, required: true },
  client: { type: String, required: true },
})
const emit = defineEmits(['update:visible', 'hide-dialog'])
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
const ui_states = reactive({
  title: `Obteniendo datos de ${props.user}, espera un momento....`,
  loading: false,
})
const navigation_data = ref([])
const hasData = computed(() => navigation_data.value?.pppoe_user)
const formatBps = (bps) => {
  if (bps === null || bps === undefined) return '-'
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(1)} Kbps`
  return `${bps} bps`
}
const POll_INTERVAL_MS = 1000
const MAX_POINTS = 60
let pollTimer = null
const chartSeries = reactive([
  { name: 'Descarga', data: [] },
  { name: 'Subida', data: [] },
])
const chartOptions = computed(() => ({
  chart: {
    id: 'realtime-traffic',
    type: 'line',
    background: 'transparent',
    animations: {
      enabled: true,
      easing: 'linear',
      dynamicAnimation: { speed: POll_INTERVAL_MS },
    },
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  theme: { mode: 'dark' },
  colors: ['#7cb342', '#ffa726'],
  stroke: { curve: 'smooth', width: 2 },
  markers: { size: 0 },
  grid: { borderColor: '#424242' },
  xaxis: {
    type: 'datetime',
    range: MAX_POINTS * POll_INTERVAL_MS,
    labels: { datetimeUTC: false, style: { colors: '#bdbdbd' } },
  },
  yaxis: {
    labels: {
      style: { colors: '#bdbdbd' },
      formatter: (val) => formatBps(val),
    },
  },
  tooltip: {
    theme: 'dark',
    x: { format: 'HH:mm:ss' },
    y: { formatter: (val) => formatBps(val) },
  },
  legend: { labels: { colors: '#bdbdbd' } },
}))
const pushTrafficPoint = (traffic) => {
  const timestamp = Date.now()
  const rx = traffic?.rx_bps ?? 0
  const tx = traffic?.tx_bps ?? 0
  chartSeries[0].data.push({ x: timestamp, y: rx })
  chartSeries[1].data.push({ x: timestamp, y: tx })
  if (chartSeries[0].data.length > MAX_POINTS) chartSeries[0].data.shift()
  if (chartSeries[1].data.length > MAX_POINTS) chartSeries[1].data.shift()
}
const fetchTraffic = async () => {
  try {
    const {
      data: { response },
    } = await api.post('/api/v1/monitoring/internet/pppoe', {
      pppoe_user: props.user,
      _method: 'POST',
    })
    if (response) {
      navigation_data.value = response
      if (hasData.value) {
        pushTrafficPoint(response.traffic)
      }
    }
  } catch (err) {
    console.error('Error al refrescar el tráfico PPPoe', err)
  }
}
const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(fetchTraffic, POll_INTERVAL_MS)
}
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}
const getData = async () => {
  ui_states.loading = true
  showLoading()
  try {
    const {
      data: { response },
    } = await api.post('/api/v1/monitoring/internet/pppoe', {
      pppoe_user: props.user,
      _method: 'POST',
    })

    if (response) {
      navigation_data.value = response
      ui_states.title = hasData.value
        ? `Datos de navegación de ${props.user} (${props.client})`
        : `${props.user} no tiene una sesión activa`

      if (hasData.value) {
        pushTrafficPoint(response.traffic)
        startPolling()
      }
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
    ui_states.title = 'Ha ocurrido un error'
  } finally {
    setTimeout(() => {
      ui_states.loading = false
      hideLoading()
    }, 150)
  }
}
const handleHide = () => {
  stopPolling()
  emit('hide-dialog')
}
onMounted(async () => {
  await getData()
})
onUnmounted(() => {
  stopPolling()
})
</script>
<template>
  <q-dialog
    v-model="isVisible"
    dark
    persistent
    @hide="handleHide"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card class="custom-cards q-pa-xs" dark>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ ui_states.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section v-if="!ui_states.loading && hasData">
        <!--    Encabezado: Usuario, IP, Perfil   -->
        <div class="row items-center q-col-gutter-sm q-mb-md">
          <div class="col-auto">
            <q-avatar color="primary" text-color="white" icon="mdi-account-network" />
          </div>

          <div class="col">
            <div class="text-subtitle1 text-white">{{ navigation_data.pppoe_user }}</div>
            <div class="text-caption text-grey-5">
              {{ navigation_data.ip_address ?? 'Sin IP asignada' }}
            </div>
          </div>

          <div class="col-auto">
            <q-chip
              v-if="navigation_data.profile"
              color="deep-purple-6"
              text-color="white"
              icon="mdi-shield-account"
              dense
            >
              {{ navigation_data.profile }}
            </q-chip>
          </div>
        </div>
        <!--    Fin Encabezado    -->

        <!--    Tráfico RX/TX   -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-6">
            <q-card flat bordered class="bg-grey-9 q-pa-sm text-center">
              <q-icon name="mdi-download-network" color="light-green-5" size="24px" />
              <div class="text-caption text-grey-5">Descarga</div>
              <div class="text-subtitle2 text-white">
                {{ formatBps(navigation_data?.traffic?.rx_bps) }}
              </div>
            </q-card>
          </div>

          <div class="col-6">
            <q-card flat bordered class="bg-grey-9 q-pa-sm text-center">
              <q-icon name="mdi-upload-network" color="orange-5" size="24px" />
              <div class="text-caption text-grey-5">Subida</div>
              <div class="text-subtitle2 text-white">
                {{ formatBps(navigation_data.traffic?.tx_bps) }}
              </div>
            </q-card>
          </div>
        </div>
        <!--    Fin Tráfico RX/TX   -->

        <!--  Gráfica     -->
        <q-card flat bordered class="bg-grey-9 q-pa-sm q-mb-md">
          <VueApexCharts type="line" height="220" :options="chartOptions" :series="chartSeries" />
        </q-card>
        <!--  Fin Gráfica     -->

        <!--    Detalles    -->
        <q-list dense separator dark>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-clock-outline" color="grey-5" />
            </q-item-section>
            <q-item-section>Tiempo de conexión</q-item-section>
            <q-item-section side>{{ navigation_data.uptime ?? '-' }}</q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-phone-outline" color="grey-5" />
            </q-item-section>
            <q-item-section>Caller ID</q-item-section>
            <q-item-section side>{{ navigation_data.caller_id ?? '-' }}</q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-lan-connect" color="grey-5" />
            </q-item-section>
            <q-item-section>Servicio</q-item-section>
            <q-item-section side>{{ navigation_data.service ?? '-' }}</q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-update" color="grey-5" />
            </q-item-section>
            <q-item-section>Consultado</q-item-section>
            <q-item-section side>{{
              formatLongDateTime(navigation_data.fetched_at)
            }}</q-item-section>
          </q-item>
        </q-list>
        <!--    Fin Detalles    -->
      </q-card-section>

      <q-card-section v-else-if="!ui_states.loading && !hasData" class="text-center text-grey-5">
        <q-icon name="mdi-lan-disconnect" size="48px" class="q-mb-sm" />
        <div>Este usuario no tiene una sesión PPPoE activa en este momento.</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn icon="mdi-cancel" label="cerrar" color="negative" @click="handleHide" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style lang="sass" scoped>
.custom-cards
  width: 95vw
  max-width: 900px
  border-radius: 1em
</style>
