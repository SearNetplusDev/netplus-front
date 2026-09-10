<script setup>
import { computed, reactive, onMounted } from 'vue'
import { getSupportData } from 'src/utils/composables/getData.js'

const data = reactive({
  loading: false,
  clients: 0,
  services: 0,
  incomes: 0,
  pending: 0,
})
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))
}
const stats = computed(() => [
  {
    key: 'clients',
    label: 'Clientes activos',
    value: data.clients,
    icon: 'people',
    color: 'primary',
    description: 'Clientes con servicio activo',
    formatter: (val) => Number(val).toLocaleString('en-US'),
  },
  {
    key: 'services',
    label: 'Servicios activos',
    value: data.services,
    icon: 'wifi',
    color: 'info',
    description: 'Servicios actualmente activos',
    formatter: (val) => Number(val).toLocaleString('en-US'),
  },
  {
    key: 'incomes',
    label: 'Ingresos durante el mes',
    value: data.incomes,
    icon: 'payments',
    color: 'positive',
    description: 'Pagos recibidos durante el período',
    formatter: formatCurrency,
  },
  {
    key: 'pending',
    label: 'Pendiente por ingresar',
    value: data.pending,
    icon: 'pending_actions',
    color: 'warning',
    description: 'Saldo pendiente por ingresar en el período',
    formatter: formatCurrency,
  },
])
const getStats = async () => {
  data.loading = true
  try {
    const [clients, services, incomes, pending] = await Promise.all([
      getSupportData('api/v1/dashboard/stats/active-clients'),
      getSupportData('api/v1/dashboard/stats/active-services'),
      getSupportData('api/v1/dashboard/stats/incomes'),
      getSupportData('api/v1/dashboard/stats/pending-incomes'),
    ])
    data.clients = clients ?? 0
    data.services = services ?? 0
    data.incomes = incomes ?? 0
    data.pending = pending ?? 0
  } catch (err) {
    console.error('Error cargando las estadísticas del dashboard:', err)
  } finally {
    data.loading = false
  }
}

onMounted(async () => {
  await getStats()
})
</script>

<template>
  <q-card flat class="custom-cards q-pa-md">
    <div class="row q-col-gutter-md">
      <div v-for="stat in stats" :key="stat.key" class="col-12 col-sm-6 col-md-3">
        <q-card flat class="stat-card" :class="`stat-card--${stat.color}`">
          <q-inner-loading :showing="data.loading">
            <q-spinner color="primary" size="32px" />
          </q-inner-loading>

          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="text-caption text-grey-5">
                  {{ stat.label }}
                </div>

                <div class="stat-value q-mt-xs">
                  {{ stat.formatter(stat.value) }}
                </div>
              </div>

              <q-avatar size="48px" :color="stat.color" text-color="white">
                <q-icon :name="stat.icon" size="25px" />
              </q-avatar>
            </div>

            <div class="row items-center q-mt-md">
              <q-icon name="info" size="16px" class="q-mr-xs text-grey-6" />
              <span class="text-caption text-grey-6">
                {{ stat.description }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-card>
</template>

<style scoped lang="sass">
$card-bg: #1e293b
$card-border: rgba(148, 163, 184, 0.12)
$card-border-hover: rgba(148, 163, 184, 0.25)
$card-radius:12px
$text-light: #f8fafc

.custom-cards
  background: transparent

.stat-card
  position: relative
  min-height: 145px
  overflow: hidden
  border: 1px solid $card-border
  border-radius: $card-radius
  background: $card-bg
  transition: transform 0.2 ease, box-shadow 0.2s ease, border-color 0.2s ease
  &:hover
    transform: translateY(-2px)
    border-color: $card-border-hover
    box-shadow: 0 8px 25px rgba(0,0,0,0.18)
  &--primary
    border-left: 3px solid var(--q-primary)
  &--info
    border-left: 3px solid var(--q-info)
  &--positive
    border-left: 3px solid var(--q-positive)
  &--warning
    border-left: 3px solid var(--q-warning)

.stat-value
  font-size: 1.8rem
  line-height: 1.2
  font-weight: 700
  color: $text-light
</style>
