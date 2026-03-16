<script setup>
import { onMounted, reactive } from 'vue'
import { api } from 'src/utils/api.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useNotifications } from 'src/utils/notification.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const props = defineProps({
  id: { type: Number, required: true },
})
const states = reactive({
  title: 'Emitir Documento Tributario Electrónico',
  loading: false,
})
const { showNotification } = useNotifications()
const { createField, createDynamicList, validationRules } = useFields()
const fields = reactive({
  type: createField('Tipo de DTE', 'select', [validationRules.text_required]),
  client: createField('Cliente', 'select-filter', [validationRules.text_required]),
  documentBody: createDynamicList('Datos', [
    {
      key: 'description',
      label: 'Descripción',
      type: 'text',
      rules: [validationRules.text_required],
    },
    {
      key: 'unit_price',
      label: 'Precio Unitario',
      type: 'text',
      rules: [validationRules.text_required, validationRules.money_two_decimal],
    },
    {
      key: 'quantity',
      label: 'Cantidad',
      type: 'text',
      rules: [validationRules.text_required],
    },
    {
      key: 'iva',
      label: 'IVA',
      type: 'computed',
      computed: (row) => {
        const price = parseFloat(row.unit_price) || 0
        const qty = parseFloat(row.quantity) || 0
        const total = price * qty
        const iva = (total / 1.13) * 0.13
        return iva.toFixed(2)
      },
    },
    {
      key: 'total',
      label: 'Total',
      type: 'computed',
      computed: (row) => {
        const price = parseFloat(row.unit_price) || 0
        const qty = parseFloat(row.quantity) || 0
        return (price * qty).toFixed(2)
      },
    },
  ]),
})
const { normalFields, dynamicFields } = useFieldFilters(fields)
const external = reactive({
  types: [],
  client: [],
})
const initial_data = async () => {
  states.loading = true

  try {
    const [types] = await Promise.all([await getSupportData('/api/v1/general/billing/documents')])
    external.types = types
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      states.loading = false
    }, 150)
  }
}
const searchClient = async (val, update) => {
  if (!val || val.length < 4) {
    update(() => (external.client = []))
  }

  update(async () => {
    try {
      const { data } = await api.post('/api/v1/clients/search', { client: val, _method: 'POST' })
      external.client = data.clients || []
    } catch (err) {
      showNotification(
        'Error',
        err.response?.data?.message ?? err.message ?? 'Error inesperado',
        'red-10',
      )
    }
  })
}
const emitDocument = async () => {
  const payload = fields.documentBody.resolvePayload()
  console.log(`ID: ${props.id}`)
  console.log('Payload: ', JSON.stringify(payload))
  console.log('Fields: ', JSON.stringify(fields))
}
onMounted(async () => {
  await initial_data()
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="emitDocument">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ states.title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="states.loading"
            label="Emitir"
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
            <q-card-section class="row content-start items-start q-pa-sm">
              <div
                v-for="(field, index) in normalFields"
                :key="index"
                class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
              >
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
                    v-if="!states.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                    :options="external.types"
                    :option-value="(option) => option.id"
                    :option-label="(option) => option.name"
                    :disable="field.disabled"
                  />
                </template>

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
                    v-if="!states.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                    :options="external.client"
                    :option-value="(option) => option.id"
                    :option-label="(option) => option.name"
                    @filter="searchClient"
                    :disable="field.disabled"
                  />
                </template>

                <q-skeleton dark type="QInput" animation="fade" v-if="states.loading" />
              </div>
            </q-card-section>

            <q-separator dark class="q-mx-sm" />

            <!--    Campos dinámicos    -->
            <q-card-section v-for="(field, index) in dynamicFields" :key="index">
              <p class="text-white text-weight-medium q-mb-sm">Cuerpo del documento</p>

              <div
                class="row q-gutter-xs q-mb-xs text-white text-caption text-weight-bold"
                v-if="!states.loading"
              >
                <div class="col-1 text-center">#</div>
                <div v-for="col in field.columns" :key="col.key" class="col">
                  {{ col.label }}
                </div>
                <div class="col-1" />
              </div>

              <template v-if="!states.loading">
                <div
                  v-for="(row, rowIndex) in field.data"
                  :key="rowIndex"
                  class="row items-center q-gutter-xs q-mb-sm"
                >
                  <div class="col-1 text-center text-white text-caption">{{ row._line }}</div>

                  <div v-for="col in field.columns" :key="col.key" class="col q-px-sm">
                    <!--    Inputs solo lectura   -->
                    <q-input
                      v-if="col.type === 'computed'"
                      dense
                      dark
                      outlined
                      disable
                      hide-bottom-space
                      :model-value="col.computed(row)"
                      :label="col.label"
                    />

                    <!--  Editables   -->
                    <q-input
                      v-else
                      dense
                      dark
                      outlined
                      clearable
                      lazy-rules
                      v-model="row[col.key]"
                      :label="col.label"
                      :type="col.type"
                      :rules="col.rules"
                      :mask="col.mask"
                      hide-bottom-space
                    />
                  </div>

                  <div class="col-1 row justify-center q-gutter-xs">
                    <q-btn
                      v-if="rowIndex === field.data.length - 1"
                      round
                      dense
                      color="primary"
                      icon="mdi-plus"
                      size="sm"
                      @click="field.addItem()"
                    />

                    <q-btn
                      v-if="rowIndex > 0"
                      round
                      dense
                      color="negative"
                      icon="mdi-minus"
                      size="sm"
                      @click="field.removeItem(rowIndex)"
                    />
                  </div>
                </div>
              </template>
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
