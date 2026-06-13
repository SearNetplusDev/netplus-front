<script setup>
import { reactive, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { createField, createToggle, validationRules } = useFields()
const props = defineProps({
  id: { type: Number, required: true },
})
const url = '/api/v1/accounting/options/events/'
const states = reactive({
  loading: false,
  title: 'Agregar Evento',
})
const fields = reactive({
  name: createField('Nombre', 'text', [validationRules.text_required]),
  code: createField('Código', 'text', [validationRules.text_required]),
  color: createField('Color', 'color', [validationRules.text_required]),
  status: createToggle('Estado'),
})
const getData = async () => {
  states.loading = true
  states.title = 'Obteniendo datos, espera un momento ...'
  showLoading()
  try {
    const {
      data: { event },
    } = await api.post(`${url}edit`, { id: props.id })

    if (event) {
      fields.name.data = event.name
      fields.code.data = event.code
      fields.color.data = event.color
      fields.status.data = event.status
      states.title = `Modificar información de ${event.name}`
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      states.loading = false
      hideLoading()
    }, 150)
  }
}
const sendData = async () => {
  states.loading = true
  states.title = 'Procesando datos, espera un momento ...'
  showLoading()
  resetFieldErrors(fields)
  let request = props.id > 0 ? `${url}${props.id}` : url
  let method = props.id > 0 ? 'PUT' : 'POST'
  let params = buildFormData(fields, { _method: method })
  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      states.title = `Modificar datos del evento ${data.event?.name}`
      showNotification('Éxito', 'Registro almacenado correctamente', 'blue-grey-10')
    } else {
      showNotification('Error', 'Verifica la información ingresada', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
    states.title = 'ERROR'
  } finally {
    setTimeout(() => {
      states.loading = false
      hideLoading()
    }, 150)
  }
}
onMounted(async () => {
  if (props.id > 0) await getData()
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="sendData">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ states.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="states.loading"
            :label="props.id === 0 ? 'Almacenar' : 'Actualizar'"
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
            <!--    Breadcrumbs   -->
            <q-card-section>
              <div class="fit row">
                <div class="col-12">
                  <q-breadcrumbs class="text-white" active-color="white" gutter="md">
                    <template v-slot:separator>
                      <q-icon size="1.5em" name="chevron_right" color="white" />
                    </template>
                    <q-breadcrumbs-el label="Contabilidad" icon="mdi-bank" />
                    <q-breadcrumbs-el label="Opciones" icon="mdi-cogs" />
                    <q-breadcrumbs-el label="Eventos" icon="mdi-format-list-group" />
                  </q-breadcrumbs>
                </div>
              </div>
            </q-card-section>
            <!--    End breadcrumbs   -->

            <q-separator dark class="q-my-sm" />

            <q-card-section>
              <div class="row wrap full-width justify-start items-start content-start">
                <div
                  v-for="(field, index) in fields"
                  :key="index"
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
                >
                  <template v-if="field.type === 'text'">
                    <q-input
                      v-model="field.data"
                      dark
                      dense
                      outlined
                      clearable
                      color="white"
                      lazy-rules
                      v-if="!states.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :disable="field.disabled || states.loading"
                    />
                  </template>

                  <template v-if="field.type === 'color'">
                    <q-input
                      v-model="field.data"
                      dense
                      dark
                      outlined
                      :label="field.label"
                      v-if="!states.loading"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :disable="field.disabled || states.loading"
                    >
                      <template v-slot:append>
                        <q-icon name="colorize" class="cursor-pointer">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-color v-model="field.data" format-model="hex" />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>

                    <q-badge
                      class="q-mt-sm text-weight-bold"
                      size
                      :label="field.data"
                      :style="{
                        backgroundColor: field.data,
                        color: '#fff',
                      }"
                      v-if="!states.loading"
                    />
                  </template>

                  <template v-if="field.type === 'toggle'">
                    <q-toggle
                      v-model="field.data"
                      :label="field.label"
                      checked-icon="check"
                      unchecked-icon="clear"
                      size="lg"
                      color="primary"
                      v-if="!states.loading"
                      :error="fields.status.error"
                      :error-message="fields.status['error-message']"
                    />
                  </template>

                  <q-skeleton
                    class="q-my-md"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="states.loading"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
