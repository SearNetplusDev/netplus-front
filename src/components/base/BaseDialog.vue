<script setup>
import { ref } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const dataViewer = useDataviewerStore()
const props = defineProps({
  id: Number,
  content: Object,
})
const isVisible = ref(true)
const reset = () => {
  dataViewer.setDataViewer({
    show: dataViewer.get_dataViewer.show,
    filter: dataViewer.get_dataViewer.filter,
    allowCreate: dataViewer.get_dataViewer.allowCreate,
    showForm: 0,
  })
}
</script>

<template>
  <q-dialog
    v-model="isVisible"
    dark
    persistent
    full-width
    transition-show="fade-in"
    transition-hide="fade-out"
    maximized
    @reset="reset"
  >
    <component :is="props.content" :id="props.id" />
  </q-dialog>
</template>

<style scoped></style>
