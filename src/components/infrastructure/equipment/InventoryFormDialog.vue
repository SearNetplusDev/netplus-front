<script setup>
import { onMounted, ref, reactive } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showLoading, hideLoading } = useLoading()
const title = ref('')
const loading = ref(false)
const { showNotification } = useNotifications()
const props = defineProps({
  id: Number,
})
const url = 'api/v1/infrastructure/equipment/inventory/'
const validationRules = {
  text_required: (val) => (val && val.length > 0) || 'Campo requerido',
  select_required: (val) => (val !== null && val !== '') || 'Campo requerido',
  mac: (val) =>
    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$|^[0-9A-Fa-f]{12}$/.test(
      val,
    ) || 'Formato inválido',
}
const createField = (label, type, rules = []) => ({
  data: null,
  error: false,
  label,
  type,
  rules,
})
const fields = reactive({
  type: createField('Tipo de equipo', 'select', [validationRules.select_required]),
  brand: createField('Marca', 'select', [validationRules.select_required]),
  model: createField('Modelo', 'select-filter', [validationRules.select_required]),
  branch: createField('Sucursal', 'select', [validationRules.select_required]),
  mac: createField('Dirección MAC', 'text', [validationRules.text_required, validationRules.mac]),
  serial: createField('Serial', 'text', [validationRules.text_required]),
  status: createField('Estado', 'select', [validationRules.select_required]),
  comments: createField('Comentarios', 'textarea'),
})
const external = reactive({
  types: [],
  brands: [],
  models: [],
  branches: [],
  status: [],
  filteredModels: [],
})
const selectOptions = (key) => {
  return (
    {
      type: external.types,
      brand: external.brands,
      // model: external.models,
      branch: external.branches,
      status: external.status,
    }[key] || []
  )
}
const filterModels = (val, update) => {
  if (val === '') {
    update(() => {
      external.filteredModels = external.models
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    external.filteredModels = external.models.filter(
      (model) => model.name.toLowerCase().indexOf(needle) > -1,
    )
  })
}
const clearModelFilter = () => {
  external.filteredModels.value = external.models
}
const getData = () => {
  showLoading()
  loading.value = true
  title.value = 'Obteniedo datos, espera un momento...'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = (res.data.fields.name.data = itm.name)
      title.value = `Editar datos del  ${itm.name}`
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
const sendData = () => {
  let params = new FormData()
  title.value = 'Procesando datos, espera un momento...'
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  props.id > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')
  let request = props.id > 0 ? `${url}${props.id}` : url

  api
    .post(request, params)
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
      } else {
        showNotification('Error', 'Verifica la información ingresada', 'teal-10')
      }
    })
    .catch((err) => {
      handleSubmissionError(err, fields)
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 1000)
    })
}
onMounted(async () => {
  if (props.id > 0) getData()
  external.branches = await getSupportData('/api/v1/general/branches')
  external.brands = await getSupportData('api/v1/general/infrastructure/brands')
  external.models = await getSupportData('api/v1/general/infrastructure/models')
  external.types = await getSupportData('api/v1/general/infrastructure/types')
  external.status = await getSupportData('api/v1/general/infrastructure/status')
  external.filteredModels= external.models
  title.value = 'Registrar equipos'
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
                    <q-breadcrumbs-el
                      label="Infraestructura"
                      icon="mdi-office-building-cog-outline"
                    />
                    <q-breadcrumbs-el label="Equipos" icon="mdi-access-point-network" />
                    <q-breadcrumbs-el label="Inventario" icon="inventory" />
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
                  <!--    Input Text    -->
                  <div v-if="field.type === 'text'">
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
                  </div>

                  <!--    Input Select    -->
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
                      :options="selectOptions(index)"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                    />
                  </div>

                  <div v-if="field.type === 'select-filter'">
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
                      use-input
                      input-debounce="0"
                      v-if="!loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      :options="external.filteredModels"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      @filter="filterModels"
                      @filter-abort="clearModelFilter"
                    />
                  </div>

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
