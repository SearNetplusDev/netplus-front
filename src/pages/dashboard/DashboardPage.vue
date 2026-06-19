<script setup>
import { useAuthStore } from 'stores/auth.js'
import ClientTypes from 'components/dashboard/ClientTypes.vue'
import CPUMetrics from 'components/dashboard/CPUMetrics.vue'

const auth = useAuthStore()
</script>

<template>
  <q-page class="q-pa-md">
    <q-card flat class="custom-cards">
      <q-card-section>
        <div class="text-amber text-h6">Bienvenid@ {{ auth.user.name }}</div>
      </q-card-section>

      <div class="row full-width q-pa-md">
        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 q-ma-sm">
          <ClientTypes />
        </div>

        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 q-ma-sm">
          <c-p-u-metrics />
        </div>
      </div>

      <div class="row full-width q-pa-md"></div>
    </q-card>
  </q-page>
</template>

<style scoped></style>
