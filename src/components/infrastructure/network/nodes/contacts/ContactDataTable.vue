<script setup></script>

<template>
  <div class="fit row">
    <div class="col-12">
      <q-breadcrumbs class="text-white" gutter="md" active-color="white">
        <template v-slot:separator>
          <q-icon size="1.5em" name="chevron_right" color="white" />
        </template>
        <q-breadcrumbs-el label="Infraestructura" icon="mdi-office-building-cog-outline" />
        <q-breadcrumbs-el label="Redes" icon="mdi-lan-pending" />
        <q-breadcrumbs-el label="Nodos" icon="cell_tower" />
        <q-breadcrumbs-el label="Contactos" icon="mdi-clipboard-account-outline" />
      </q-breadcrumbs>

      <q-separator dark class="q-my-md" />
    </div>

    <div class="row fit content-end justify-end">
      <q-btn
        color="white"
        icon="add"
        flat
        :ripple="{ center: true, color: 'amber' }"
        label="agregar"
        align="around"
        @click="isVisible = true"
      />
    </div>

    <div class="row fit full-width content-start justify-start q-pa-md">
      <div class="col-12"></div>
    </div>
  </div>
</template>

<style scoped></style>
