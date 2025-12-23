<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'

const { showLoading, hideLoading } = useLoading()
const props = defineProps({
  visible: Boolean,
  uri: String,
})
const visible = ref(props.visible)
const src = ref('')
const getDocument = () => {
  showLoading()
  api({
    url: props.uri,
    responseType: 'blob',
    method: 'GET',
  })
    .then((res) => {
      let blob = new Blob([res.data], { type: 'application/pdf' })
      src.value = window.URL.createObjectURL(blob)
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      setTimeout(() => {
        hideLoading()
      }, 500)
    })
}
onMounted(() => {
  getDocument()
})
</script>

<template>
  <q-dialog v-model="visible" maximized persistent full-width full-height>
    <q-card dark flat class="custom-cards">
      <q-bar>
        <div class="text-h6">Vista previa PDF</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>

      <q-card-section class="q-pa-md justify-center items-center">
        <iframe :src="src" class="full-width iframe-95" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.iframe-95
  height: 93vh
  border: none
</style>
