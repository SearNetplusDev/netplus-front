<script setup>
import { useMenuStore } from 'stores/menu-store.js'

const menuStore = useMenuStore()
</script>

<template>
  <q-page class="q-pa-md">
    <q-card flat class="custom-cards">
      {{ menuStore }}
      <q-separator class="q-my-md" />
      {{ menuStore.items }}
      <q-separator class="q-my-md" />
      {{ menuStore.items.data }}
      <q-card-section></q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped></style>
