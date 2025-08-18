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
const uploadedFile = ref(null)
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
const createConditionalFields = () => {
  const baseFields = {
    type: createField('Tipo de equipo', 'select', [validationRules.select_required]),
    brand: createField('Marca', 'select', [validationRules.select_required]),
    model: createField('Modelo', 'select-filter', [validationRules.select_required]),
    branch: createField('Sucursal', 'select', [validationRules.select_required]),
    status: createField('Estado', 'select', [validationRules.select_required]),
  }

  if (props.id > 0) {
    baseFields.mac = createField('Dirección MAC', 'text', [
      validationRules.text_required,
      validationRules.mac,
    ])
    baseFields.serial = createField('Serial', 'text', [validationRules.text_required])
  }
  baseFields.comments = createField('Comentarios', 'textarea')
  return baseFields
}
const fields = reactive(createConditionalFields())

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
const onFileAdded = (file) => {
  uploadedFile.value = file[0]
  console.log('Archivo seleccionado: ', file[0])
}
const onFileRemoved = () => {
  uploadedFile.value = null
  console.log('Archivo removido')
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
      let itm = res.data.equipment
      fields.brand.data = itm.brand_id
      fields.type.data = itm.type_id
      fields.model.data = itm.model_id
      fields.branch.data = itm.branch_id
      fields.mac.data = itm.mac_address
      fields.serial.data = itm.serial_number
      fields.status.data = itm.status_id
      fields.comments.data = itm.comments
      title.value = `Editar datos del equipo  ${itm.mac_address}`
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

  Object.keys(fields).forEach((key) => {
    if (fields[key].data !== null && fields[key].data !== '') {
      params.append(key, fields[key].data)
    }
  })

  if (props.id === 0 && uploadedFile.value) {
    params.append('file', uploadedFile.value)
  }
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
  title.value = 'Registrar equipos'
  if (props.id > 0) getData()
  external.branches = await getSupportData('/api/v1/general/branches')
  external.brands = await getSupportData('api/v1/general/infrastructure/brands')
  external.models = await getSupportData('api/v1/general/infrastructure/models')
  external.types = await getSupportData('api/v1/general/infrastructure/types')
  external.status = await getSupportData('api/v1/general/infrastructure/status')
  external.filteredModels = external.models
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
                  <template v-if="index !== 'comments'">
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

                    <q-skeleton
                      class="q-my-xs"
                      dark
                      type="QInput"
                      animation="fade"
                      v-if="loading"
                    />
                  </template>
                </div>
              </div>

              <div v-if="props.id === 0" class="row wrap full-width items-start content-start">
                <div class="col-12 col-xs-12 col-sm-12 col-md-4 q-pa-md">
                  <q-uploader
                    v-if="!loading"
                    label="Subir archivo de inventario"
                    dark
                    flat
                    color="blue-grey-8"
                    text-color="white"
                    accept=".xlsx, .xls, .csv"
                    max-file-size="10485760"
                    @added="onFileAdded"
                    @removed="onFileRemoved"
                    style="max-width: 100%; width: 100%"
                    :auto-upload="false"
                  >
                    <template v-slot:header="scope">
                      <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                        <q-icon name="cloud_upload" class="q-mr-sm" />
                        <div class="col">
                          <div class="q-uploader__title">Subir archivo</div>
                          <div class="q-uploader__subtitle">
                            {{ scope.files.length }} archivo - {{ scope.uploadSizeLabel }}
                          </div>
                        </div>
                        <q-btn
                          v-if="scope.canAddFiles"
                          type="a"
                          icon="add_box"
                          @click="scope.pickFiles"
                          round
                          dense
                          flat
                        >
                          <q-uploader-add-trigger />
                        </q-btn>
                      </div>
                    </template>

                    <template v-slot:list="scope">
                      <q-list separator>
                        <q-item v-for="file in scope.files" :key="file.__key">
                          <q-item-section>
                            <q-item-label class="full-width ellipsis">
                              {{ file.name }}
                            </q-item-label>
                            <q-item-label caption> Estado: {{ file.__status }}</q-item-label>
                          </q-item-section>

                          <q-item-section v-if="file.__img" thumbnail class="gt-xs">
                            <img :src="file.__img.src" style="width: 48px; height: 48px" />
                          </q-item-section>

                          <q-item-section side>
                            <q-btn
                              class="gt-xs"
                              size="12px"
                              dense
                              flat
                              round
                              icon="delete"
                              @click="scope.removeFile(file)"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </template>
                  </q-uploader>

                  <q-skeleton
                    class="q-my-xs"
                    dark
                    type="rect"
                    height="150px"
                    animation="fade"
                    v-if="loading"
                  />
                </div>
              </div>

              <div class="row q-mt-md">
                <div class="col-12 q-pa-md">
                  <q-input
                    v-model="fields.comments.data"
                    dense
                    dark
                    clearable
                    outlined
                    lazy-rules
                    rows="6"
                    type="textarea"
                    v-if="!loading"
                    :label="fields.comments.label"
                    :rules="fields.comments.rules"
                    :error="fields.comments.error"
                    :error-message="fields.comments['error-message']"
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
