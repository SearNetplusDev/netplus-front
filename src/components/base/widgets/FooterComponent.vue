<script setup>
import { ref } from 'vue'

const version = ref('1.0.0')
const today = new Date()
const currentYear = ref(today.getFullYear())
</script>

<template>
  <q-footer reveal class="q-pa-none">
    <q-toolbar class="q-pa-none q-ma-none" style="min-height: 30px">
      <q-toolbar-title class="text-center text-subtitle2">
        ISP v{{ version }} || All rights reserved to Netplus 2021 - {{ currentYear }} &trade;
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>
</template>

<style scoped></style>
