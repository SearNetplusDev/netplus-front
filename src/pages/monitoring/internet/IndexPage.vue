<script setup>
import { onMounted } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import BasePage from 'pages/baseComponents/BasePage.vue'
import BaseFilters from 'pages/baseComponents/BaseFilters.vue'
import DataTable from 'pages/monitoring/internet/DataTable.vue'

const dataViewer = useDataviewerStore()
const filter = {
  title: 'Filtrar',
  url: '/monitoring/internet/',
  orderables: [{ title: 'ID', name: 'id' }],
  filterGroups: [
    {
      name: 'Mikrotik',
      opened: true,
      filters: [
        // { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Usuario PPPoe', name: 'pppoe_user', type: 'string' },
      ],
    },
    {
      name: 'En base a datos de cliente',
      opened: false,
      filters: [
        // { title: 'ID', name: 'id', type: 'numeric' },
        { title: 'Nombres', name: 'internet_service.service.client.name', type: 'string' },
        { title: 'Apellidos', name: 'internet_service.service.client.surname', type: 'string' },
        { title: 'DUI', name: 'internet_service.service.client.dui.number', type: 'string' },
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
