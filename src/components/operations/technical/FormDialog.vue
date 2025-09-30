<script setup>
import { onMounted, reactive } from 'vue'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const props = defineProps({
  id: { type: Number, required: true },
})
const uiStates = reactive({
  title: '',
  loading: false,
})
const sendData = () => {}
onMounted(async () => {})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="sendData">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ uiStates.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="uiStates.loading"
            :label="props.id > 0 ? 'Actualizar' : 'Almacenar'"
            type="submit"
            color="white"
          >
            <template v-slot:loading>
              <q-spinner-gears class="on-left" />
            </template>
          </q-btn>

          <q-btn v-close-popup round dense icon="close" />
        </q-toolbar>
      </q-header>

      <footer-component />

      <q-page-container>
        <q-page class="q-pa-md bg-dark">
          <q-card flat class="custom-cards q-pa-sm"></q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
