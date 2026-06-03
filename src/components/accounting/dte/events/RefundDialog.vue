<script setup>
import { computed, reactive } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const dataViewer = useDataviewerStore()
const props = defineProps({
  data: { type: Object, required: true },
  visible: { type: Boolean, required: true },
})
const emit = defineEmits(['update:visible', 'hide-dialog'])
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
const states = reactive({
  loading: false,
})
const cancel = () => {
  emit('hide-dialog')
}
const sendData = async () => {
  states.loading = true
  dataViewer.fetch({ force: true })
}
</script>

<template>
  <q-dialog
    v-model="isVisible"
    dark
    persistent
    @hide="cancel"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card class="custom-cards q-pa-xs" dark>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ props.data.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section class="text-subtitle1">
        <div class="row wrap full-width">
          <q-form greedy @submit="sendData" class="full-width"> {{ props.data.id }}<br /> </q-form>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn icon="mdi-check" label="procesar" color="primary" type="submit" @click="sendData" />
        <q-btn icon="mdi-cancel" label="Cancelar" color="negative" @click="cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.custom-cards
  width: 50vw
  max-width: 50vw
  border-radius: 1em
</style>
