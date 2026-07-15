<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
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
})
const emit = defineEmits(['update:visible', 'hide-dialog'])
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
const ui_states = reactive({
  title: `Obteniendo datos de ${props.user}, espera un momento...`,
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
        ? `Datos de navegación de ${props.user}`
        : `${props.user} no tiene una sesión activa`
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
onMounted(async () => {
  await getData()
})
</script>

<template>
  <q-dialog
    v-model="isVisible"
    dark
    persistent
    @hide="emit('hide-dialog')"
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
                {{ formatBps(navigation_data.traffic?.rx_bps) }}
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
            <q-item-section side>{{ formatLongDateTime(navigation_data.fetched_at) }}</q-item-section>
          </q-item>
        </q-list>
        <!--    Fin Detalles    -->
      </q-card-section>

      <q-card-section v-else-if="!ui_states.loading && !hasData" class="text-center text-grey-5">
        <q-icon name="mdi-lan-disconnect" size="48px" class="q-mb-sm" />
        <div>Este usuario no tiene una sesión PPPoE activa en este momento.</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn icon="mdi-cancel" label="cerrar" color="negative" @click="emit('hide-dialog')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.custom-cards
  width: 50vw
  max-width: 50vw
  border-radius: 1em
</style>
