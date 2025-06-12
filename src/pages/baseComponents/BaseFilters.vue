<script setup>
import { computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import FilterComponent from 'components/base/FilterComponent.vue'

const props = defineProps({
  filter: Object,
  sortBy: String,
})
const useDataViewer = useDataviewerStore()
useDataViewer.setFilterable(props.filter)
const pagination = {
  sortBy: props.sortBy,
  descending: true,
  filter_match: useDataViewer.get_pagination.filter_match,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
}
useDataViewer.setPagination(pagination)
useDataViewer.fetch(true)
const dataViewer = computed(() => useDataViewer.get_dataViewer)
</script>

<template>
  <FilterComponent v-if="dataViewer.filter" />
</template>

<style scoped></style>
