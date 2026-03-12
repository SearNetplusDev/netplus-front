<script setup>
import { onMounted } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from 'pages/accounting/dte/DataTable.vue'

const dataViewer = useDataviewerStore()
const filter = {
  title: 'Filtrar',
  url: '/accounting/dte/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Filtrado por DTE',
      opened: true,
      filters: [
        { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Número de control', name: 'control_number', type: 'string' },
        { title: 'Código generación', name: 'generation_code', type: 'string' },
        { title: 'Sello de recepción', name: 'reception_code', type: 'string' },
        { title: 'Fecha de emisión', name: 'generation_date', type: 'date' },
      ],
    },
    {
      name: 'Filtrado por Cliente',
      opened: false,
      filters: [
        { title: 'Nombres', name: 'client.name', type: 'string' },
        { title: 'Apellidos', name: 'client.surname', type: 'string' },
      ],
    },
  ],
}
onMounted(() => {
  dataViewer.setDataViewer({
    ...dataViewer.dataViewer,
    allowCreate: true,
  })
})
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
