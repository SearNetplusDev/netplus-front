<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BasePageFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from 'pages/accounting/options/events/DataTable.vue'

const filter = {
  title: 'Filtra',
  url: '/accounting/options/events/',
  nuevo: '/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Criterio de búsqueda',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Nombre', name: 'name', type: 'string' },
        { title: 'Código', name: 'code', type: 'string' },
      ],
    },
  ],
}
</script>

<template>
  <BasePage>
    <template v-slot:filter>
      <BasePageFilters sort-by="id" :filter="filter" />
    </template>

    <template v-slot:data-table>
      <DataTable />
    </template>
  </BasePage>
</template>

<style scoped></style>
