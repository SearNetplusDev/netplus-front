<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import {
  handleSubmissionError,
  resetFieldErrors,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const props = defineProps({
  id: { type: Number, required: true },
})
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { createField, createToggle, validationRules } = useFields()
const title = ref('Agregar precio')
const loading = ref(false)
const uri = '/api/v1/supports/prices/'
const fields = reactive({
  type: createField('Tipo de soporte', 'select', [validationRules.select_required], false, '', {
    options: [],
  }),
  name: createField('Nombre', 'text', [validationRules.text_required]),
  description: createField('Descripción', 'textarea', []),
  price: createField('Precio', 'text', [
    validationRules.text_required,
    validationRules.money_two_decimal,
  ]),
  status: createToggle('Estado'),
})
const { normalFields, textAreaFields } = useFieldFilters(fields)
const PRICED_TYPE_IDS = [1, 2, 6, 7]
const loadTypes = async () => {
  try {
    showLoading()
    const types = await getSupportData('/api/v1/general/supports/types')
    fields.type.options = types
      .filter((itm) => PRICED_TYPE_IDS.includes(itm.id))
      .map((itm) => ({ label: itm.name, value: itm.id }))
  } finally {
    hideLoading()
  }
}
const getData = async () => {
  loading.value = true
  title.value = 'Obteniendo datos, espera un momento ...'
  showLoading()
  let params = new FormData()
  params.append('id', props.id)

  try {
    const { data } = await api.post(`${uri}edit`, params)

    if (data) {
      let item = data.data
      fields.type.data = item.type_id
      fields.name.data = item.name
      fields.description.data = item.description
      fields.price.data = item.price
      fields.status.data = item.status_id
      title.value = `Modificar los datos de ${item.name}`
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      hideLoading()
      loading.value = false
    }, 150)
  }
}
const sendData = async () => {
  loading.value = true
  title.value = 'Procesando datos, espera un momento ...'
  showLoading()
  resetFieldErrors(fields)
  let request = props.id > 0 ? `${uri}${props.id}` : uri
  let method = props.id > 0 ? 'PUT' : 'POST'
  let params = buildFormData(fields, { _method: method })

  try {
    const { data } = await api.post(request, params)

    if (data.saved) {
      showNotification('Éxito', 'Precio de soporte agregado correctamente.', 'blue-grey-10')
      title.value = `Modificar los datos de ${data.data.name}`
    } else {
      showNotification('Error', 'Algo ha salido mal.', 'red-10')
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
      loading.value = false
      hideLoading()
    }, 150)
  }
}
onMounted(() => {
  loadTypes()
  if (props.id > 0) getData()
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="sendData">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="loading"
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
                    <q-breadcrumbs-el label="Soportes" icon="mdi-face-agent" />
                    <q-breadcrumbs-el label="Precios" icon="mdi-cash" />
                  </q-breadcrumbs>
                </div>
              </div>
            </q-card-section>
            <!--    End breadcrumbs   -->

            <q-separator dark class="q-my-sm" />

            <!--  Contenido    -->
            <q-card-section>
              <div class="row wrap full-width justify-start items-start content-start">
                <div
                  v-for="(field, index) in normalFields"
                  :key="index"
                  class="col-xs-12 col-sm-12 col-md-3 col-lg-3 q-pa-sm"
                >
                  <template v-if="field.type === 'select'">
                    <q-select
                      v-model="field.data"
                      dark
                      dense
                      outlined
                      clearable
                      color="white"
                      emit-value
                      map-options
                      transition-show="flip-up"
                      transition-hide="flip-down"
                      lazy-rules
                      v-if="!loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['eror-message']"
                      :options="field.options"
                      :option-value="field.options.id"
                      :option-label="field.options.label"
                    />
                  </template>

                  <template v-if="field.type === 'text'">
                    <q-input
                      v-model="field.data"
                      dark
                      dense
                      outlined
                      clearable
                      lazy-rules
                      v-if="!loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :disable="field.disabled"
                      :mask="field.mask"
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
                      v-if="!loading"
                      :error="field.error"
                      :error-message="field['error-message']"
                    />
                  </template>

                  <q-skeleton v-if="loading" class="q-my-xs" dark animation="fade" type="QInput" />
                </div>

                <div class="row content-start items-start fit">
                  <div
                    v-for="(field, index) in textAreaFields"
                    :key="index"
                    class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm"
                  >
                    <template v-if="field.type === 'textarea'">
                      <q-input
                        v-model="field.data"
                        type="textarea"
                        dark
                        dense
                        outlined
                        clearable
                        rows="4"
                        color="white"
                        v-if="!loading"
                        :label="field.label"
                        :rules="field.rules"
                        :error="field.error"
                        :error-message="field['error-message']"
                        :disable="field.disabled || loading"
                      />
                    </template>
                    <q-skeleton
                      v-if="loading"
                      class="q-my-xs"
                      dark
                      animation="fade"
                      type="QInput"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
            <!--  Fin contenido    -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
