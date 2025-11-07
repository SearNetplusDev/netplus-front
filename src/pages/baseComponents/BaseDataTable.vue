<script setup>
import { computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import FilterTableComponent from 'components/base/FilterTableComponent.vue'

const useDataViewer = useDataviewerStore()
const props = defineProps({
  columns: Array,
})
const collection = computed(() => useDataViewer.get_data || [])
const paginate = computed({
  get() {
    return useDataViewer.pagination
  },
  set(newVal) {
    useDataViewer.setPagination(newVal)
  },
})
const onRequest = (prop) => {
  let { page, rowsPerPage, sortBy, descending, rowsNumber } = prop.pagination
  if (rowsPerPage !== paginate.value.rowsPerPage) {
    page = 1
  }
  let pagination = {
    sortBy: sortBy,
    descending: descending,
    filter_match: paginate.value.filterMatch,
    page: page,
    rowsPerPage: rowsPerPage,
    rowsNumber: rowsNumber,
  }
  useDataViewer.setPagination(pagination)
  useDataViewer.fetch({ force: true })
}
</script>

<template>
  <div class="q-pa-lg">
    <q-table
      dark
      dense
      flat
      binary-state-sort
      class="custom-table my-sticky-header-table my-sticky-last-column-table"
      row-key="name"
      color="white"
      :rows="collection || []"
      :columns="props.columns"
      @request="onRequest"
      v-model:pagination="paginate"
      no-data-label="Sin resultados"
    >
      <template v-slot:header="props">
        <FilterTableComponent :props="props" />
      </template>
      <template v-slot:body="props">
        <slot name="body" :props="props" />
      </template>
    </q-table>
  </div>
</template>

<style lang="sass" scoped>
.my-sticky-header-table
  //height: 69vh

  .q-table__top, .q-table__bottom, thead tr:first-child th
    //background-color: $custom-background

    thead tr th
      position: sticky
      z-index: 1

    thead tr:first-child th
      top: 0

    &.q-table--loading thead tr:last-child th
      top: 48px

    tbody
      scroll-margin-top: 48px

.my-sticky-last-column-table
  max-width: 98%

  thead tr:last-child th:last-child
    background-color: $custom-dark-background

  td:last-child
    background-color: $custom-dark-background

  th:last-child, td:last-child
    position: sticky
    right: 0
    z-index: 1
</style>
