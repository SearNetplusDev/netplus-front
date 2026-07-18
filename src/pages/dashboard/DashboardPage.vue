<script setup>
import { useAuthStore } from 'stores/auth.js'
import ClientTypes from 'components/dashboard/ClientTypes.vue'
import CPUMetrics from 'components/dashboard/CPUMetrics.vue'
import MostConsumedPlan from 'components/dashboard/MostConsumedPlan.vue'
import SupportsGraphic from 'components/dashboard/SupportsGraphic.vue'

const auth = useAuthStore()
</script>

<template>
  <q-page class="q-pa-md">
    <q-card flat class="custom-cards">
      <q-card-section>
        <div class="text-amber text-h6">Bienvenid@ {{ auth.user.name }}</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md q-pa-md">
          <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4">
            <ClientTypes />
          </div>

          <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4">
            <CPUMetrics />
          </div>

          <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
            <MostConsumedPlan />
          </div>

          <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
            <SupportsGraphic />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped lang="sass"></style>
