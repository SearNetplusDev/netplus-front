<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from 'stores/auth.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'

import ClientTypes from 'components/dashboard/ClientTypes.vue'
import CPUMetrics from 'components/dashboard/CPUMetrics.vue'
import MostConsumedPlan from 'components/dashboard/MostConsumedPlan.vue'
import SupportsGraphic from 'components/dashboard/SupportsGraphic.vue'
import InvoicesChart from 'components/dashboard/InvoicesChart.vue'
import StatsCard from 'components/dashboard/StatsCard.vue'

const auth = useAuthStore()
const now = ref(new Date())
const { formatDateTime } = useDateFormatter()

onMounted(() => {
  const interval = setInterval(() => {
    now.value = new Date()
  }, 1000)

  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <q-page class="dashboard-page q-pa-md">
    <!-- Header -->
    <section class="dashboard-header">
      <div>
        <div class="dashboard-title">Bienvenido, {{ auth.user.name }}</div>

        <div class="dashboard-subtitle">Resumen general de operaciones</div>
      </div>

      <div class="dashboard-period">
        <q-icon name="calendar_month" size="18px" />
        <span>{{ formatDateTime(now) }}</span>
      </div>
    </section>

    <!-- Indicadores -->
    <section>
      <div class="dashboard-section-header">
        <div class="dashboard-section-title">Indicadores generales</div>

        <div class="dashboard-section-description">Estado actual de la operación</div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12">
          <StatsCard />
        </div>
      </div>
    </section>

    <!-- Gráficos -->
    <section class="q-mt-xl">
      <div class="dashboard-section-header">
        <div class="dashboard-section-title">Análisis operativo</div>

        <div class="dashboard-section-description">
          Clientes, facturación, infraestructura y soporte
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-4">
          <ClientTypes />
        </div>

        <div class="col-12 col-md-4">
          <InvoicesChart />
        </div>

        <div class="col-12 col-md-4">
          <CPUMetrics />
        </div>

        <div class="col-12 col-lg-6">
          <MostConsumedPlan />
        </div>

        <div class="col-12 col-lg-6">
          <SupportsGraphic />
        </div>
      </div>
    </section>
  </q-page>
</template>

<style scoped lang="sass">

.dashboard-page
  background: #0B1120

.dashboard-header
  display: flex
  align-items: center
  justify-content: space-between
  gap: 20px
  margin-bottom: 24px
  padding: 20px 22px
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.10), rgba(30, 41, 59, 0.40))
  border: 1px solid rgba(59, 130, 246, 0.12)
  border-radius: 14px

.dashboard-title
  font-size: 22px
  font-weight: 700
  color: #F8FAFC

.dashboard-subtitle
  margin-top: 5px
  font-size: 13px
  color: #94A3B8

.dashboard-period
  display: flex
  align-items: center
  gap: 8px
  padding: 8px 12px
  border: 1px solid rgba(148, 163, 184, 0.12)
  border-radius: 8px
  color: #94A3B8
  font-size: 12px
  white-space: nowrap

.dashboard-section-header
  margin-bottom: 12px

.dashboard-section-title
  color: #F8FAFC
  font-size: 15px
  font-weight: 600

.dashboard-section-description
  margin-top: 3px
  color: #64748B
  font-size: 11px

@media (max-width: 700px)
  .dashboard-page
    padding: 12px

  .dashboard-header
    align-items: flex-start
    padding: 16px

  .dashboard-title
    font-size: 19px

  .dashboard-period
    display: none
</style>
