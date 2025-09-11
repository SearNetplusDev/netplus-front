<script setup>
import { reactive, onMounted } from 'vue'
import { useNotifications } from 'src/utils/notification.js'
import { useSupportFields } from 'src/utils/composables/supports/useSupportFields.js'
import { external, loadInitialData } from 'src/utils/composables/supports/useSupportLoaders.js'
import { useSupportForm } from 'src/utils/composables/supports/useSupportForm.js'
import { useSupportUtils } from 'src/utils/composables/supports/useSupportUtils.js'
import LocaleEs from 'src/utils/composables/localeEs.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const locale = LocaleEs

const props = defineProps({
  id: { type: Number, required: true },
})

const uiStates = reactive({
  title: 'Crear Soporte',
  loading: false,
})

const { showNotification } = useNotifications()
const { fields } = useSupportFields()
const { getData, sendData, selectClient, setupWatchers, toggleLoading } = useSupportForm(
  fields,
  uiStates,
  props,
)
const { regularFields, textAreaFields, selectOptions } = useSupportUtils(fields)

onMounted(async () => {
  toggleLoading(true, 'Cargando...')
  try {
    await loadInitialData()
    setupWatchers()
    if (props.id > 0) await getData()
  } catch (err) {
    console.error(err)
    showNotification('Error', 'Error al cargar datos iniciales', 'red-10')
  } finally {
    toggleLoading(false, 'Soportes')
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
                    />
                  </template>

                  <!--    Render Input Date   -->
                  <template v-if="field.type === 'date'">
                    <q-input
                      dark
                      dense
                      outlined
                      clearable
                      v-model="field.data"
                      v-if="!uiStates.loading"
                      :rules="field.rules"
                      :label="field.label"
                      :error="field.error"
                      :error-message="field['error-message']"
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy cover transiton-show="scale" transition-hide="scale">
                            <q-date
                              v-model="field.data"
                              mask="YYYY-MM-DD"
                              :locale="locale"
                              color="blue-10"
                            >
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Cerrar" color="white" flat />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </template>

                  <q-skeleton
                    class="q-my-xs"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="uiStates.loading"
                  />
                </div>
              </div>

              <!-- Render Text Areas -->
              <div class="row wrap full-width justify-start items-center content-start">
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
                  />
                </div>
              </div>
            </q-card-section>
            <!--    End Input Content -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>
<style lang="sass" scoped></style>
