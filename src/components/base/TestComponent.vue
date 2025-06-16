<script setup>
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const useDataViewer = useDataviewerStore()
const columns = [
  { name: 'id', label: 'ID' },
  {
    name: 'status',
    label: 'Estado',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general-data/estados',
    options: [],
    align: 'left',
  },
  { name: 'name', label: 'Nombre' },
  { name: 'email', label: 'Correo electrónico' },
  { name: 'actions', label: '' },
]

useDataViewer.setColumns(columns)
</script>

<template>
  <div class="q-pa-md">
    <q-separator dark class="q-my-sm" />
    <span class="text-subtitle1">
      {{ useDataViewer.get_columns }}
    </span>

    <q-separator class="q-my-md" dark />
    <span class="text-subtitle1 text-positive">
      {{ useDataViewer.collection.data }}
    </span>
  </div>
</template>

<style scoped></style>
