<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from './DataTable.vue'

const filter = {
  title: 'Filtrar',
  url: '/supports/',
  nuevo: '/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Filtrado en base a datos del soporte',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Número de Ticket', name: 'ticket_number', type: 'string' },
        { title: 'Fecha Creación', name: 'creation_date', type: 'date' },
        { title: 'Fecha Solución', name: 'closet_at', type: 'date' },
      ],
    },
    {
      name: 'Filtrado en base a datos del cliente',
      opened: false,
      filters: [
        { title: 'ID', name: 'client.id', type: 'numeric' },
        { title: 'Nombres', name: 'client.name', type: 'string' },
        { title: 'Apellidos', name: 'client.surname', type: 'string' },
        { title: 'DUI', name: 'client.dui.number', type: 'string' },
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
