<script setup>
import { onMounted, reactive } from 'vue'
import { useOperationFields } from 'src/utils/composables/operations/technical/useOperationFields.js'
import {
  external,
  loadInitialData,
} from 'src/utils/composables/operations/technical/useOperationLoaders.js'
import { useOperationsForm } from 'src/utils/composables/operations/technical/useOperationForm.js'
import { useOperationUtils } from 'src/utils/composables/operations/technical/useOperationUtils.js'
import { useNotifications } from 'src/utils/notification.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const props = defineProps({
  id: { type: Number, required: true },
})
const uiStates = reactive({
  title: '',
  loading: false,
})
const { showNotification } = useNotifications()
const { fields } = useOperationFields()
const { getData, sendData, selectClient, setupWatchers, toggleLoading } = useOperationsForm(
  fields,
  uiStates,
  props,
)
const { regularFields, textAreaFields, selectOptions } = useOperationUtils(fields)
onMounted(async () => {
  toggleLoading(true, 'Cargando ...')
  try {
    await loadInitialData()
    setupWatchers()
    await getData()
  } catch (err) {
    console.error(err)
    showNotification('Error', 'Error al cargar datos iniciales', 'red-10')
  } finally {
    toggleLoading(false, 'Resolución de soportes')
  }
})
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
          <q-card flat class="custom-cards q-pa-sm">
            <!--    Input Content   -->
            <q-card-section>
              <div class="row wrap full-width justify-start items-center content-start">
                <!--    Campos "cortos" -->
                <div
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
                  v-for="[index, field] in regularFields"
                  :key="index"
                >
                  <!-- Render Select Inputs   -->
                  <template v-if="field.type === 'select'">
                    <q-select
                      v-model="field.data"
                      dense
                      dark
                      outlined
                      clearable
                      color="white"
                      emit-value
                      map-options
                      transition-show="jump-up"
                      transition-hide="jump-down"
                      lazy-rules
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="selectOptions(index)"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      :disable="field.disabled"
                    />
                  </template>

                  <!--    Render Select Filter   -->
                  <template v-if="field.type === 'select-filter'">
                    <q-select
                      v-model="field.data"
                      dense
                      dark
                      outlined
                      clearable
                      color="white"
                      emit-value
                      map-options
                      transition-show="jump-up"
                      transition-hide="jump-down"
                      lazy-rules
                      use-input
                      input-debounce="0"
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="external.filtered_client"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      @filter="selectClient"
                      :disable="field.disabled"
                    />
                  </template>

                  <!--  Render Text Input    -->
                  <template v-if="field.type === 'text'">
                    <q-input
                      v-model="field.data"
                      dense
                      dark
                      outlined
                      clearable
                      color="white"
                      lazy-rules
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :disable="field.disabled"
                    />
                  </template>

                  <q-skeleton
                    class="q-my-xs"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="uiStates.loading"
                  />
                </div>

                <!-- Render Text Areas -->
                <div
                  class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-sm"
                  v-for="[index, field] in textAreaFields"
                  :key="`textarea-${index}`"
                >
                  <q-input
                    v-model="field.data"
                    dark
                    dense
                    outlined
                    clearable
                    type="textarea"
                    rows="4"
                    color="white"
                    v-if="!uiStates.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                    :disable="field.disabled"
                  />

                  <q-skeleton
                    class="q-my-xs"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="uiStates.loading"
                  />
                </div>
              </div>
            </q-card-section>
            <!--    End Input Content   -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
