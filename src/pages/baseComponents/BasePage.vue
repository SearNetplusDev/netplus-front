<script setup>
import { computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const useDataViewer = useDataviewerStore()
useDataViewer.cancelRequest()
useDataViewer.reset()
useDataViewer.setDataViewer({ show: true, filter: true, allowCreate: true, showForm: 0 })
useDataViewer.setAppliedFilters([])
const show = computed(() => useDataViewer.get_filterable.url !== '')
</script>

<template>
  <q-page class="q-pa-md">
    <q-card dark flat class="custom-cards">
      <q-card-section class="q-pa-none q-pb-md">
        <slot name="header" />
      </q-card-section>
      <q-card-section class="q-pa-none q-pb-md">
        <slot name="filter" />
      </q-card-section>
      <q-card-section class="q-pa-none" v-if="show">
        <slot name="data-table" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped></style>
