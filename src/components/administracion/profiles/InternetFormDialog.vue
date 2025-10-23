<script setup>
import { onMounted, ref, reactive, watch } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import LocaleEs from 'src/utils/composables/localeEs.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import { getSupportData } from 'src/utils/composables/getData.js'

const { showLoading, hideLoading } = useLoading()
const { createField, createToggle, validationRules } = useFields()
const title = ref('Registrar nuevo perfil de internet')
const loading = ref(false)
const { showNotification } = useNotifications()
const props = defineProps({
  id: Number,
})
const url = 'api/v1/management/profiles/internet/'
const locale = LocaleEs
const fields = reactive({
  name: createField('Nombre del perfil', 'text', [validationRules.text_required]),
  alias: createField('Alias del perfil', 'text', [validationRules.text_required]),
  mk_profile: createField('Perfil principal', 'select', [validationRules.select_required]),
  debt_profile: createField('Perfil deuda', 'select', [validationRules.select_required]),
  net_value: createField('Valor neto', 'text', [validationRules.text_required], true),
  iva: createField('IVA', 'text', [validationRules.text_required], true),
  price: createField('Precio', 'text-price', [
    validationRules.text_required,
    validationRules.money_format,
  ]),
  expiration: createField('Fecha de vencimiento', 'date', [validationRules.text_required]),
  iptv: createToggle('Tiene IPTV', 'toggle'),
  ftth: createToggle('Fibra óptica', 'toggle'),
  status: createToggle('Estado', 'toggle'),
  stb: createField('STB permitidas', 'text', [
    validationRules.number_stb,
    validationRules.text_required,
  ]),
  description: createField('Descripcion', 'text-area', [validationRules.text_required]),
})
const profiles = reactive({
  main: [],
  debt: [],
})
const getData = () => {
  showLoading()
  loading.value = true
  title.value = 'Obteniedo datos, espera un momento...'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.profile
      fields.name.data = itm.name
      fields.alias.data = itm.alias
      fields.description.data = itm.description
      fields.mk_profile.data = itm.mk_profile
      fields.debt_profile.data = itm.debt_profile
      fields.net_value.data = itm.net_value
      fields.iva.data = itm.iva
      fields.price.data = itm.price
      fields.expiration.data = itm.expiration_date
      fields.status.data = itm.status_id
      fields.iptv.data = itm.iptv
      fields.ftth.data = itm.ftth
      fields.stb.data = itm.allowed_stb
      title.value = `Editar datos del perfil ${itm.name}`
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 1000)
    })
}
const getOptions = (key) => {
  return (
    {
      mk_profile: profiles.main,
      debt_profile: profiles.debt,
    }[key] || []
  )
}
const sendData = async () => {
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let request = props.id > 0 ? `${url}${props.id}` : url
  let method = props.id > 0 ? 'PUT' : 'POST'
  title.value = 'Procesando datos, espera un momento...'
  const params = buildFormData(fields, { _method: method })
  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
    } else {
      showNotification('Error', 'Ha ocurrido un error', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification('Error', err.response?.data?.message || 'Error al guardar', 'red-10')
  } finally {
    setTimeout(() => {
      loading.value = false
      hideLoading()
    }, 150)
  }
}
const formatPriceWith8Decimals = (value) => {
  if (!value || value === '') return ''
  const cleanValue = value.toString().replace(/[^\d.]/g, '')

  if (!cleanValue.includes('.')) {
    return cleanValue + '.00000000'
  }

  const parts = cleanValue.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1] || ''
  const formattedDecimals = decimalPart.padEnd(8, '0'.substring(0, 8))
  return `${integerPart}.${formattedDecimals}`
}
const handlePriceBlur = () => {
  if (fields.price.data && fields.price.data !== '') {
    fields.price.data = formatPriceWith8Decimals(fields.price.data)
  }
}
watch(
  () => fields.price.data,
  (newPrice) => {
    if (newPrice && newPrice !== '') {
      const price = parseFloat(newPrice)
      if (!isNaN(price)) {
        fields.net_value.data = (price / 1.13).toFixed(8)
        fields.iva.data = ((price / 1.13) * 0.13).toFixed(8)
      }
    } else {
      fields.iva.data = '0.00000000'
      fields.net_value.data = '0.00000000'
    }
  },
)
const isFieldDisabled = (fieldName, field) => {
  if (fieldName === 'stb') {
    return field.disabled || !fields.iptv.data
  }
  return field.disabled
}
watch(
  () => fields.iptv.data,
  (newIptvVal) => {
    if (!newIptvVal) {
      fields.stb.data = '0'
      fields.stb.error = false
      fields.stb['error-message'] = ''
    }
  },
)
onMounted(async () => {
  if (props.id > 0) getData()

  profiles.main = await getSupportData('/api/v1/general/profiles/mikrotik')
  profiles.debt = await getSupportData('/api/v1/general/profiles/mikrotik')
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
                    <q-breadcrumbs-el label="Administración" icon="mdi-account-tie" />
                    <q-breadcrumbs-el label="Perfiles" icon="mdi-account-details-outline" />
                    <q-breadcrumbs-el label="Internet" icon="mdi-web" />
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
                      v-if="!loading"
                      :disable="isFieldDisabled(index, field)"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                    />
                  </div>

                  <div v-if="field.type === 'text-price'">
                    <q-input
                      dense
                      dark
                      outlined
                      clearable
                      lazy-rules
                      v-model="field.data"
                      v-if="!loading"
                      :disable="field.disabled"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      @blur="handlePriceBlur"
                    />
                  </div>

                  <div v-if="field.type === 'select'">
                    <q-select
                      v-model="field.data"
                      dense
                      dark
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
                      :error-message="field['error-message']"
                      :options="getOptions(index)"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                    />
                  </div>

                  <div v-if="field.type === 'date'">
                    <q-input
                      dark
                      dense
                      outlined
                      clearable
                      v-model="field.data"
                      v-if="!loading"
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
                  </div>

                  <div v-if="field.type === 'toggle'">
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
                  </div>
                  <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
                </div>

                <div class="col-12 q-pa-md">
                  <q-input
                    v-model="fields.description.data"
                    outlined
                    dark
                    dense
                    type="textarea"
                    label="Descripción"
                    v-if="!loading"
                    :error="fields.status.error"
                    :error-message="fields.status['error-message']"
                  />
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
