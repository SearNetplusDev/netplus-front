<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from 'pages/configuration/geography/countries/DataTable.vue'

const filter = {
  title: 'Filtrar',
  url: '/configuration/geography/countries/',
  nuevo: '/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Criterio de búsqueda',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Nombre en español', name: 'es_name', type: 'string' },
        { title: 'Nombre en inglés', name: 'en_name', type: 'string' },
        { title: 'ISO 2', name: 'iso_2', type: 'string' },
        { title: 'ISO 3', name: 'iso_3', type: 'string' },
        { title: 'Prefijo telefónico', name: 'phone_prefix', type: 'numeric' },
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
    <template v-slot:data-table>
      <DataTable />
    </template>
  </BasePage>
</template>

<style scoped></style>
