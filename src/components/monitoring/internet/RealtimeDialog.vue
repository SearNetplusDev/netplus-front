<script setup>
import { computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'
import { usePPPoETrafficPolling } from 'src/utils/composables/monitoring/usePPPoETrafficPolling.js'
import { useTrafficChartOptions } from 'src/utils/composables/monitoring/useTrafficChartOptions.js'
import { formatBps } from 'src/utils/composables/monitoring/formatBps.js'

const POLL_INTERVAL_MS = 1000
const MAX_POINTS = 60

const props = defineProps({
  user: { type: String, required: true },
  visible: { type: Boolean, required: true },
  client: { type: String, required: true },
})
const emit = defineEmits(['update:visible', 'hide-dialog'])

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { formatLongDateTime } = useDateFormatter()

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const { navigationData, chartSeries, loading, hasData, currentRx, currentTx, fetchInitial, stop } =
  usePPPoETrafficPolling({
    pppoeUser: computed(() => props.user),
    client: computed(() => props.client),
    pollIntervalMs: POLL_INTERVAL_MS,
    maxPoints: MAX_POINTS,
  })

const chartOptions = useTrafficChartOptions({
  maxPoints: MAX_POINTS,
  pollIntervalMs: POLL_INTERVAL_MS,
})

const title = computed(() => {
  if (loading.value) return `Obteniendo datos de ${props.user}, espera un momento...`
  if (hasData.value) return `Datos de navegación de ${props.user} (${props.client})`
  return `${props.user} no tiene una sesión activa (${props.client})`
})

const getData = async () => {
  showLoading()
  try {
    await fetchInitial()
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    hideLoading()
  }
}

const handleHide = () => {
  stop()
  emit('hide-dialog')
}

onMounted(getData)
</script>

<template>
  <q-dialog
    v-model="isVisible"
    dark
    persistent
    backdrop-filter="blur(4px) saturate(150%)"
    @hide="handleHide"
  >
    <q-card class="custom-card" dark>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense color="white" v-close-popup />
      </q-card-section>

      <q-card-section v-if="!loading && hasData" class="q-pt-md">
        <!-- ================================================================================= -->
        <!--    Encabezado: Usuario, IP, Perfil   -->
        <!-- ================================================================================= -->
        <div class="row items-center q-col-gutter-sm q-mb-md">
          <div class="col-auto">
            <q-avatar color="primary" text-color="white" icon="mdi-account-network" />
          </div>

          <div class="col">
            <div class="text-subtitle1 text-white">{{ navigationData.pppoe_user }}</div>
            <div class="text-caption text-grey-5">
              {{ navigationData.ip_address ?? 'Sin IP asignada' }}
            </div>
          </div>

          <div class="col-auto">
            <q-chip
              v-if="navigationData.profile"
              color="deep-purple-6"
              text-color="white"
              icon="mdi-shield-account"
              dense
            >
              {{ navigationData.profile }}
            </q-chip>
          </div>
        </div>

        <!-- ================================================================================= -->
        <!--    Tráfico Actual    -->
        <!-- ================================================================================= -->
        <div class="row q-col-gutter-sm q-mb-md">
          <!--    Descarga    -->
          <div class="col-6">
            <q-card flat bordered class="traffic-card traffic-download">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="light-green-9"
                    text-color="light-green-3"
                    icon="mdi-download-network"
                  />

                  <div class="q-ml-sm">
                    <div class="text-caption text-grey-5">Descarga</div>
                    <div class="text-h6 text-weight-medium text-white">
                      {{ formatBps(currentRx) }}
                    </div>
                  </div>
                  <q-space />

                  <q-icon name="mdi-arrow-down" color="light-green-5" size="20px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!--    Subida    -->
          <div class="col-6">
            <q-card flat bordered class="traffic-card traffic-upload">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="orange-9"
                    text-color="orange-3"
                    icon="mdi-upload-network"
                  />

                  <div class="q-ml-sm">
                    <div class="text-caption text-grey-5">Subida</div>
                    <div class="text-h6 text-weight-medium text-white">
                      {{ formatBps(currentTx) }}
                    </div>
                  </div>
                  <q-space />

                  <q-icon name="mdi-arrow-up" color="orange-5" size="20px" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- ================================================================================= -->
        <!--    Gráfico en tiempo real    -->
        <!-- ================================================================================= -->
        <q-card flat bordered class="traffic-chart q-mb-md">
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div>
                <div class="text-subtitle2 text-white">Tráfico en tiempo real</div>
                <div class="text-caption text-grey-6">Últimos {{ MAX_POINTS }} segundos</div>
              </div>

              <q-space />

              <div class="row items-center q-gutter-xs">
                <span class="live-dot" />
                <span class="text-caption text-grey-5">EN VIVO</span>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-sm">
            <VueApexCharts type="area" height="240" :options="chartOptions" :series="chartSeries" />
          </q-card-section>
        </q-card>

        <!-- ================================================================================= -->
        <!--    Detalles de conexión    -->
        <!-- ================================================================================= -->
        <q-list dense separator dark>
          <!--    Uptime    -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-clock-outline" color="grey-5" />
            </q-item-section>
            <q-item-section>Tiempo de conexión</q-item-section>
            <q-item-section side>{{ navigationData.uptime ?? '-' }}</q-item-section>
          </q-item>

          <!--    Caller ID    -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-phone-outline" color="grey-5" />
            </q-item-section>
            <q-item-section>Caller ID</q-item-section>
            <q-item-section side>{{ navigationData.caller_id ?? '-' }}</q-item-section>
          </q-item>

          <!--    Servicio     -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-lan-connect" color="grey-5" />
            </q-item-section>
            <q-item-section>Servicio</q-item-section>
            <q-item-section side>{{ navigationData.service ?? '-' }}</q-item-section>
          </q-item>

          <!--    Última petición     -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-update" color="grey-5" />
            </q-item-section>
            <q-item-section>Consultado</q-item-section>
            <q-item-section side>
              {{ formatLongDateTime(navigationData.fetched_at) }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section v-else-if="!loading && !hasData" class="text-center text-grey-5 q-pa-xl">
        <q-icon name="mdi-lan-disconnect" size="56px" class="q-mb-md" />

        <div class="text-subtitle1">Sin sesión PPPoE activa</div>
        <div class="text-caption q-mt-xs">
          Este usuario no tiene una sesión PPPoE activa en este momento.
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn icon="mdi-cancel" label="cerrar" color="red-10" unelevated @click="handleHide" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.custom-card
  width: 95vw
  max-width: 900px
  border-radius: 1em
  background: #111827

.traffic-card
  background: #1e293b
  border-color: rgba(255,255,255,0.08)
  border-radius: 10px
  transition: all 0.2s ease
  &:hover
    border-color: rgba(255,255,255,0.16)

.traffic-download
  border-left: 3px solid #8bc34a

.traffic-upload
  border-left: 3px solid #ff9800

.traffic-chart
  background: #1e293b
  border-color: rgba(255,255,255,0.08)
  border-radius: 12px

.live-dot
  width: 7px
  height: 7px
  border-radius: 50%
  background: #8bc34a
  box-shadow: 0 0 8px rgba(139,195,74,0.8)
  animation: live-pulse 1.5s infinite
  @keyframes live-pulse
    0%
      opacity: 1
      transform: scale(1)
    50%
      opacity: 0.45
      transform: scale(0.8)
    100%
      opacity: 1
      transform: scale(1)

@media (max-width: 600px)
  .custom-card
    width: 100vw
    max-width: 100vw
    border-radius: 12px 12px 0 0

  .traffic-card
    font-size: 1rem
</style>
