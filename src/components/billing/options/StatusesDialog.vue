<script setup>
import { reactive, onMounted } from 'vue'
import { api } from 'boot/axios.js'
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
  id: Number,
})
const url = 'api/v1/billing/options/statuses/'
const uiStates = reactive({
  loading: false,
  title: 'Crear estado',
})
const fields = reactive({
  name: createField('Nombre', 'text', [validationRules.text_required()]),
  color: createField('Color', 'color', []),
  status: createToggle('Estado'),
})
const getData = async () => {
  uiStates.loading = true
  uiStates.title = 'Obteniendo datos, espera un momento...'
  showLoading()
  let uri = `${url}edit`
  try {
    const { data } = await api.post(uri, { id: props.id })
    if (data.status) {
      fields.name.data = data.status?.name
      fields.color.data = data.status?.badge_color
      fields.status.data = data.status?.status_id
      uiStates.title = `Editar los datos del estado ${data.status?.name}`
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message || err.message || 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      uiStates.loading = false
      hideLoading()
    }, 150)
  }
}
const sendData = async () => {
  uiStates.loading = true
  uiStates.title = 'Procesando datos, espera un momento...'
  showLoading()
  resetFieldErrors(fields)
  let request = props.id > 0 ? `${url}${props.id}` : url
  let method = props.id > 0 ? 'PUT' : 'POST'
  let params = buildFormData(fields, { _method: method })
  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      uiStates.title = `Editar los datos del estado ${data.status?.name}`
      showNotification('Éxito', 'Registro almacenado correctamente', 'blue-grey-10')
    } else {
      showNotification('Error', 'Verifica la información ingresada', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification(
      'Error',
      err.response?.data?.message || err.message || 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      uiStates.loading = false
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
          <q-toolbar-title>{{ uiStates.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="uiStates.loading"
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
                    <q-breadcrumbs-el label="Facturación" icon="paid" />
                    <q-breadcrumbs-el label="Opciones" icon="construction" />
                    <q-breadcrumbs-el
                      label="Estados de factura"
                      icon="mdi-invoice-multiple-outline"
                    />
                  </q-breadcrumbs>
                </div>
              </div>
            </q-card-section>
            <!--    End breadcrumbs   -->

            <q-separator dark class="q-my-sm" />

            <!--    Input content   -->
            <q-card-section>
              <div class="row wrap full-width justify-start items-start content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-md"
                  v-for="(field, index) in fields"
                  :key="index"
                >
                  <div v-if="field.type === 'text'">
                    <q-input
                      dense
                      dark
                      outlined
                      clearable
                      lazy-rules
                      v-model="field.data"
                      v-if="!uiStates.loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                    />
                  </div>

                  <div v-if="field.type === 'toggle'">
                    <q-toggle
                      v-model="field.data"
                      :label="field.label"
                      checked-icon="check"
                      unchecked-icon="clear"
                      size="lg"
                      color="primary"
                      v-if="!uiStates.loading"
                      :error="fields.status.error"
                      :error-message="fields.status['error-message']"
                    />
                  </div>

                  <template v-if="field.type === 'color'">
                    <q-input
                      v-model="field.data"
                      dense
                      dark
                      outlined
                      :label="field.label"
                      v-if="!uiStates.loading"
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
              </div>
            </q-card-section>
            <!--    End Input content   -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
