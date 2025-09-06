<script setup>
import { reactive, onMounted } from 'vue'
import { useNotifications } from 'src/utils/notification.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const { showNotification } = useNotifications()
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})
const uiStates = reactive({
  title: 'Crear Soporte',
  loading: false,
})
// const url = '/api/v1/supports/'
const validationRules = {
  text_required: (val) => (val && val.length > 0) || 'Campo requerido',
  select_required: (val) => (val !== null && val !== '') || 'Campo requerido',
}
const createField = (label, type, rules = []) => ({
  data: null,
  error: false,
  label,
  type,
  rules,
})
const fields = reactive({
  type: createField('Tipo de soporte', 'select', [validationRules.select_required]),
})
const external = reactive({
  branches: [],
  statuses: [],
  technicians: [],
  types: [],
})
const selectOptions = (key) => {
  return (
    {
      type: external.types,
    }[key] || []
  )
}
const getData = () => {}
const sendData = async () => {}

onMounted(async () => {
  if (props.id > 0) getData()

  try {
    const [branches, statuses, technicians, types] = await Promise.all([
      getSupportData('/api/v1/general/branches'),
      getSupportData('/api/v1/general/supports/status'),
      getSupportData('/api/v1/general/management/users/technicians'),
      getSupportData('/api/v1/general/supports/types'),
    ])
    external.branches = branches
    external.statuses = statuses
    external.technicians = technicians
    external.types = types
  } catch (err) {
    console.error(err)
    showNotification('Error', err, 'red-10')
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
            <!--    Breadcrumbs   -->
            <q-card-section>
              <div class="fit row">
                <div class="col-12">
                  <q-breadcrumbs class="text-white" active-color="white" gutter="md">
                    <template v-slot:separator>
                      <q-icon size="1.5em" name="chevron_right" color="white" />
                    </template>
                    <q-breadcrumbs-el label="Soportes" icon="mdi-face-agent" />
                  </q-breadcrumbs>
                </div>
              </div>
            </q-card-section>
            <!--    End breadcrumbs   -->

            <q-separator dark class="q-my-sm" />

            <!--    Input Content   -->
            <q-card-section>
              <div class="row wrap full-width justify-start items-start content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-md"
                  v-for="(field, index) in fields"
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
            <!--    End Input Content -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
