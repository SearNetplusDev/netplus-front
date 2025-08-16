<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from './DataTable.vue'

const filter = {
  title: 'Filtrar',
  url: '/infrastructure/equipment/inventory/',
  nuevo: '',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Criterio de búsqueda',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Dirección MAC', name: 'mac_address', type: 'string' },
        { title: 'Serial', name: 'serial_number', type: 'string' },
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
