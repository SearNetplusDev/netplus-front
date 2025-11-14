<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import {
  handleSubmissionError,
  resetFieldErrors,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { createField, createToggle, validationRules } = useFields()
const title = ref('Agregar tipo de soporte')
const loading = ref(false)
const uri = '/api/v1/supports/types/'
const fields = reactive({
  name: createField('Nombre', 'text', [validationRules.text_required]),
  price: createField('Precio', 'numeric', [validationRules.text_required, validationRules.decimal]),
  badge: createField('Color', 'color', [validationRules.text_required()]),
  status: createToggle('Estado'),
})
const getData = () => {
  title.value = 'Obteniendo datos...'
  loading.value = true
  showLoading()
  let params = new FormData()
  params.append('id', props.id)
  api
    .post(`${uri}edit`, params)
    .then((res) => {
      let item = res.data.type
      fields.name.data = item.name
      fields.badge.data = item.badge_color
      fields.price.data = item.price
      fields.status.data = item.status_id
      title.value = 'Modificar información del soporte tipo: ' + item.name
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 300)
    })
}
const sendData = async () => {
  title.value = 'Procesando datos, espera un momento...'
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let method = props.id > 0 ? 'PUT' : 'POST'
  let request = props.id > 0 ? `${uri}${props.id}` : uri
  let params = buildFormData(fields, { _method: method })
  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      title.value = `Modificar información del tipo: ${data.type?.name}`
      showNotification('Éxito', 'Registro almacenado correctamente', 'blue-grey-10')
    } else {
      showNotification('Error', 'Verifica la información ingresada', 'teal-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    const message = err.response?.data?.message || err.message || 'Error inesperado'
    showNotification('Error', message, 'red-10')
  } finally {
    setTimeout(() => {
      loading.value = false
      hideLoading()
    }, 300)
  }
}
const formatPriceWith2Decimals = (value) => {
  if (!value || value === '') return ''
  const cleanValue = value.toString().replace(/[^\d.]/g, '')

  if (!cleanValue.includes('.')) {
    return cleanValue + '.00'
  }

  const parts = cleanValue.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1] || ''
  const formattedDecimals = decimalPart.padEnd(2, '0'.substring(0, 2))
  return `${integerPart}.${formattedDecimals}`
}
const handlePriceBlur = () => {
  if (fields.price.data && fields.price.data !== '') {
    fields.price.data = formatPriceWith2Decimals(fields.price.data)
  }
}
onMounted(() => {
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
                    <q-breadcrumbs-el label="Soportes" icon="mdi-face-agent" />
                    <q-breadcrumbs-el
                      label="Tipos"
                      icon="mdi-sort-alphabetical-ascending-variant"
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
                  <template v-if="field.type === 'text'">
                    <q-input
                      dense
                      dark
                      outlined
                      clearable
                      lazy-rules
                      v-model="field.data"
                      v-if="!loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                    />
                  </template>

                  <template v-if="field.type === 'numeric'">
                    <q-input
                      dense
                      dark
                      outlined
                      clearable
                      lazy-rules
                      v-model="field.data"
                      v-if="!loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      @blur="handlePriceBlur"
                    >
                      <template v-slot:prepend>
                        <q-icon name="mdi-currency-usd" />
                      </template>
                    </q-input>
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
                      :error="fields.status.error"
                      :error-message="fields.status['error-message']"
                    />
                  </template>

                  <template v-if="field.type === 'color'">
                    <q-input
                      v-model="field.data"
                      dense
                      dark
                      outlined
                      :label="field.label"
                      v-if="!loading"
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
                      v-if="!loading"
                    />
                  </template>
                  <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
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
