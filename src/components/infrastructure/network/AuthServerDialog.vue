<script setup>
import { onMounted, reactive } from 'vue'
import { api } from 'src/utils/api.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showLoading, hideLoading } = useLoading()
const { validationRules, createField, createToggle } = useFields()
const ui_states = reactive({
  loading: false,
  title: '',
})
const { showNotification } = useNotifications()
const props = defineProps({
  id: Number,
})
const url = 'api/v1/infrastructure/network/servers/'
const fields = reactive({
  name: createField('Nombre', 'text', [validationRules.text_required]),
  user: createField('Usuario', 'text', [validationRules.text_required]),
  secret: createField('Contraseña', 'text', [validationRules.text_required]),
  ip: createField('Dirección IP', 'text', [
    validationRules.text_required,
    validationRules.valid_ip,
  ]),
  port: createField('Puerto', 'text', [validationRules.text_required, validationRules.valid_port]),
  status: createToggle('Estado'),
})
const { normalFields } = useFieldFilters(fields)
const getData = () => {
  showLoading()
  ui_states.loading = true
  ui_states.title = 'Obteniendo datos, espera un momento ....'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.server
      fields.name.data = itm.name
      fields.user.data = itm.user
      fields.secret.data = itm.secret
      fields.ip.data = itm.ip
      fields.port.data = itm.port
      fields.status.data = itm.status_id
      ui_states.title = `Editar datos del Servidor: ${itm.name}`
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        ui_states.loading = false
        hideLoading()
      }, 250)
    })
}
const sendData = async () => {
  ui_states.loading = true
  ui_states.title = 'Procesando datos, espera un momento...'
  showLoading()
  resetFieldErrors(fields)
  let request = props.id > 0 ? `${url}${props.id}` : url
  let method = props.id > 0 ? 'PUT' : 'POST'
  let params = buildFormData(fields, { _method: method })

  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Éxito', 'Datos almacenados correctamente', 'blue-grey-10')
    } else {
      showNotification('Error', 'Algo ha salido mal', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      ui_states.loading = false
      hideLoading()
    }, 150)
  }
}
onMounted(() => {
  if (props.id > 0) {
    getData()
  } else {
    ui_states.title = 'Registrar Servidor de Autenticación'
  }
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="sendData">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ ui_states.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="ui_states.loading"
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

      <FooterComponent />

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
                    <q-breadcrumbs-el
                      label="Infraestructura"
                      icon="mdi-office-building-cog-outline"
                    />
                    <q-breadcrumbs-el label="Redes" icon="mdi-lan-pending" />
                    <q-breadcrumbs-el
                      label="Servidores de autenticación"
                      icon="mdi-security-network"
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
                  v-for="(field, index) in normalFields"
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
                      v-if="!ui_states.loading"
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
                      v-if="!ui_states.loading"
                      :error="fields.status.error"
                      :error-message="fields.status['error-message']"
                    />
                  </div>
                  <q-skeleton
                    class="q-my-xs"
                    dark
                    type="QInput"
                    animation="fade"
                    v-if="ui_states.loading"
                  />
                </div>
              </div>
            </q-card-section>
            <!--    End input content   -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
