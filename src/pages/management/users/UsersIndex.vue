<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
/*
 * Import Filter and datatable too
 * */

const filter = {
  title: 'Filtro',
  url: '/administracion/usuarios/',
  nuevo: '/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Usuario',
      opened: true,
      filters: [
        { title: 'Nombre', name: 'name', type: 'string' },
        { title: 'Correo', name: 'email', type: 'string' },
      ],
    },
  ],
}
</script>

<template>
  <BasePage>
    <template v-slot:filter>
      <BaseFilters sort-by="id" :filter="filter" />
    </template>
    <template v-slot:data-table></template>
  </BasePage>
</template>

<style scoped></style>
