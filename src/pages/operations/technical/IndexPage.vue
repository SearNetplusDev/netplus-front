<script setup>
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from './DataTable.vue'
import { onMounted } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const dataViewer = useDataviewerStore()
const filter = {
  title: 'Filtrar',
  url: '/operations/technical/',
  nuevo: '',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Filtrado en base a datos del soporte',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Número de Ticket', name: 'ticket_number', type: 'string' },
        { title: 'Fecha Creación', name: 'creation_date', type: 'date' },
        { title: 'Fecha Solución', name: 'closed_at', type: 'date' },
      ],
    },
    {
      name: 'Filtrado en base a datos del cliente',
      opened: false,
      filters: [
        { title: 'Nombres', name: 'client.name', type: 'string' },
        { title: 'Apellidos', name: 'client.surname', type: 'string' },
        { title: 'DUI', name: 'client.dui.number', type: 'string' },
      ],
    },
  ],
}
onMounted(() => {
  dataViewer.setDataViewer({
    ...dataViewer.dataViewer,
    allowCreate: false,
  })
})
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
