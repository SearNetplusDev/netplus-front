<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from 'pages/billing/options/status/DataTable.vue'

const filter = {
  title: 'Filtrar',
  url: '/billing/options/statuses/',
  nuevo: '/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Criterio de búsqueda',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Nombre', name: 'name', type: 'string' },
      ],
    },
  ],
}
</script>

<template>
  <base-page>
    <template v-slot:filter>
      <base-filters sort-by="id" :filter="filter" />
    </template>

    <template v-slot:data-table>
      <data-table />
    </template>
  </base-page>
</template>

<style scoped></style>
