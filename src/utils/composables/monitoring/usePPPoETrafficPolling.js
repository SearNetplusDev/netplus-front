import { ref, computed, onUnmounted } from 'vue'
import { api } from 'src/utils/api.js'

const isAbortError = (err) =>
  err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError'

/**
 * Encapsula el estado y el polling del tráfico PPPoE de un usuario:
 * petición inicial, actualización periodica, buffer del gráfico, y cancelación.
 * @param pppoeUser
 * @param client
 * @param pollIntervalMs
 * @param maxPoints
 * @returns {{navigationData: [null] extends [Ref] ? IfAny<null, Ref<null>, null> : Ref<UnwrapRef<null>, UnwrapRef<null> | null>, chartSeries: Ref<UnwrapRef<[{name: string, data: *[]},{name: string, data: *[]}]>, UnwrapRef<[{name: string, data: *[]},{name: string, data: *[]}]> | [{name: string, data: *[]},{name: string, data: *[]}]>, loading: Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>, hasData: ComputedRef<boolean>, currentRx: ComputedRef<number>, currentTx: ComputedRef<number>, fetchInitial: (function(): Promise<null|*|undefined>)|*, stop: stop}}
 */
export function usePPPoETrafficPolling({
  pppoeUser,
  client,
  pollIntervalMs = 1000,
  maxPoints = 60,
}) {
  const navigationData = ref(null)
  const chartSeries = ref([
    { name: 'Descarga', data: [] },
    { name: 'Subida', data: [] },
  ])
  const loading = ref(false)

  let active = false
  let timer = null
  let inFlight = false
  let abortController = null

  const hasData = computed(() => Boolean(navigationData.value?.pppoe_user))
  const currentRx = computed(() => Number(navigationData.value?.traffic?.rx_bps ?? 0))
  const currentTx = computed(() => Number(navigationData.value?.traffic?.tx_bps ?? 0))

  const pushPoint = (traffic) => {
    const x = Date.now()
    const [rxSeries, txSeries] = chartSeries.value

    rxSeries.data.push({ x, y: Number(traffic?.rx_bps ?? 0) })
    txSeries.data.push({ x, y: Number(traffic?.tx_bps ?? 0) })

    if (rxSeries.data.length > maxPoints) rxSeries.data.shift()
    if (txSeries.data.length > maxPoints) txSeries.data.shift()
  }

  const requestTraffic = async () => {
    abortController = new AbortController()
    try {
      const { data } = await api.post(
        `/api/v1/monitoring/internet/pppoe`,
        { pppoe_user: pppoeUser.value, _method: 'POST' },
        { signal: abortController.signal },
      )
      return data?.response
    } finally {
      abortController = null
    }
  }

  const stop = () => {
    active = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  const tick = async () => {
    if (!active || inFlight) return
    inFlight = true
    try {
      const response = await requestTraffic()
      if (!active || !response) return
      navigationData.value = response
      if (hasData.value) pushPoint(response.traffic)
    } catch (err) {
      if (!isAbortError(err) && active) {
        console.error(`Error al refrescar el tráfico PPPoE de ${client.value}: ${err}`)
      }
    } finally {
      inFlight = false
    }
  }

  const loop = async () => {
    if (!active) return
    await tick()
    if (!active) return

    if (!hasData.value) {
      stop()
      return
    }
    timer = setTimeout(loop, pollIntervalMs)
  }

  const start = () => {
    stop()
    active = true
    timer = setTimeout(loop, pollIntervalMs)
  }

  /**
   * Petición Inicial. Arranca el polling automáticamente si hay sesión activa.
   * Relanza errores reales (no de cancelación) para que el caller notifique.
   * @returns {Promise<*|null>}
   */
  const fetchInitial = async () => {
    loading.value = true
    active = true
    try {
      const response = await requestTraffic()
      if (!active) return null

      navigationData.value = response ?? null

      if (hasData.value) {
        pushPoint(response.traffic)
        start()
      }
      return response
    } catch (err) {
      if (isAbortError(err)) return null
      throw err
    } finally {
      loading.value = false
    }
  }

  onUnmounted(stop)

  return {
    navigationData,
    chartSeries,
    loading,
    hasData,
    currentRx,
    currentTx,
    fetchInitial,
    stop,
  }
}
