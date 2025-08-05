<script setup>
import { onMounted } from 'vue'
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from './DataTable.vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const dataViewer = useDataviewerStore()
const filter = {
  title: 'Filtrar',
  url: '/services/',
  nuevo: '',
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
