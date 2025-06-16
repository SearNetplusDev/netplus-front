<script setup>
import { ref, defineEmits } from 'vue'
import { api } from 'boot/axios.js'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useNotifications } from 'src/utils/notification.js'

const dataViewer = useDataviewerStore()
const { showNotification } = useNotifications()
const props = defineProps({
  data: Object,
  visible: Boolean,
})
const isVisible = ref(props.visible)
const cancel = () => {
  isVisible.value = false
  event('hide-dialog')
}
const confirm = () => {
  let params = new FormData()
  params.append('id', props.data.id)
  params.append('_method', 'DELETE')
  api
    .post(props.data.url, params, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => {
      if (res.data.deleted) {
        dataViewer.fetch({ force: true })
        showNotification('Éxito', 'Registro eliminado', 'blue-grey-10')
      } else {
        showNotification('Error', 'Ha ocurrido un error al eliminar el registro', 'red-10')
      }
    })
    .catch((err) => {
      showNotification('Error', `${err}`, 'red-10')
    })
    .finally(() => {
      isVisible.value = false
      event('hide-dialog')
    })
}
const event = defineEmits(['hide-dialog'])
</script>

<template>
  <q-dialog v-model="isVisible" dark @hide="cancel" backdrop-filter="blur(4px) saturate(150%)">
    <q-card class="custom-cards q-pa-xs" dark>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ data.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section class="text-subtitle1">
        {{ data.message }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn icon="mdi-check" label="Eliminar" color="primary" @click="confirm" />
        <q-btn icon="mdi-cancel" label="Cancelar" color="negative" @click="cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.custom-cards
  width: 25vw
  max-width: 30vw
  border-radius: 1em
</style>
