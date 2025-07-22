<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from 'pages/clients/DataTable.vue'

const filter = {
  title: 'Filtro',
  url: '/clients/',
  nuevo: '/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Criterio de búsqueda',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Nombres', name: 'name', type: 'string' },
        { title: 'Apellidos', name: 'surname', type: 'string' },
        { title: 'DUI', name: 'dui.number', type: 'string' },
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
      <data-table />
    </template>
  </BasePage>
</template>

<style scoped></style>
