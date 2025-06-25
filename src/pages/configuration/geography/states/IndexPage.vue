<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from 'pages/configuration/geography/states/DataTable.vue'

const filter = {
  title: 'Filtrar',
  url: '/configuration/geography/states/',
  nuevo: '/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Departamento',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Nombre', name: 'name', type: 'string' },
        { title: 'Código', name: 'iso_code', type: 'string' },
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
