<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { api } from 'src/utils/api.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useNotifications } from 'src/utils/notification.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const states = reactive({
  title: 'Emitir Documento Tributario Electrónico',
  loading: false,
})
const { showNotification } = useNotifications()
const { createField, createDynamicList, validationRules } = useFields()
const RELATED_DOCS_REQUIRED = [3, 4, 5, 6, 8]
const fields = reactive({
  type: createField('Tipo de DTE', 'select', [validationRules.text_required]),
  client: createField('Cliente', 'select-filter', [validationRules.text_required]),
  discount: createField('Descuento', 'text', [validationRules.money_two_decimal]),
  documentBody: createDynamicList('Datos', [
    {
      key: 'description',
      label: 'Descripción',
      type: 'text',
      colClass: 'col-4',
      rules: [validationRules.text_required],
    },
    {
      key: 'unit_price',
      label: 'Precio Unitario',
      type: 'text',
      colClass: 'col',
      rules: [validationRules.text_required, validationRules.money_two_decimal],
    },
    {
      key: 'quantity',
      label: 'Cantidad',
      type: 'text',
      colClass: 'col',
      rules: [validationRules.text_required],
    },
    {
      key: 'neto',
      label: 'Valor Neto',
      type: 'computed',
      colClass: 'col',
      computed: (row) => {
        const price = parseFloat(row.unit_price) || 0
        const qty = parseFloat(row.quantity) || 0
        const total = price * qty
        const neto = total / 1.13
        return neto.toFixed(2)
      },
    },
    {
      key: 'iva',
      label: 'IVA',
      type: 'computed',
      colClass: 'col',
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
      colClass: 'col',
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
const relatedDocumentOptions = reactive({})
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
const totals = computed(() => {
  const rows = fields.documentBody.data
  const columns = fields.documentBody.columns
  const netoCol = columns.find((c) => c.key === 'neto')
  const ivaCol = columns.find((c) => c.key === 'iva')
  const totalCol = columns.find((c) => c.key === 'total')

  const subtotals = rows.reduce(
    (acc, row) => {
      acc.neto += parseFloat(netoCol?.computed(row) ?? 0)
      acc.iva += parseFloat(ivaCol?.computed(row) ?? 0)
      acc.total += parseFloat(totalCol?.computed(row) ?? 0)
      return acc
    },
    { neto: 0, iva: 0, total: 0 },
  )

  const discountAmount = parseFloat(fields.discount.data) || 0
  const factor = subtotals.total > 0 ? (subtotals.total - discountAmount) / subtotals.total : 1
  return {
    neto: subtotals.neto * factor,
    iva: subtotals.iva * factor,
    total: subtotals.total - discountAmount,
    discountAmount,
  }
})
const relatedDocuments = reactive(
  createDynamicList('Documentos Relacionados', [
    {
      key: 'document_number',
      label: 'Número de documento',
      type: 'select-filter',
      rules: [],
    },
  ]),
)
const requiresRelatedDocuments = computed(() => RELATED_DOCS_REQUIRED.includes(fields.type.data))
const searchRelatedDocument = (rowIndex) => async (val, update) => {
  if (!val || val.length < 18) {
    update(() => (relatedDocumentOptions[rowIndex] = []))
    return
  }

  let results = []
  try {
    let uri = '/api/v1/accounting/dte/search'
    const { data } = await api.post(uri, { control_number: val, _method: 'POST' })
    results = data.documents || []
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  }
  update(() => {
    relatedDocumentOptions[rowIndex] = results
  })
}
const removeRelatedDocument = (rowIndex) => {
  relatedDocuments.removeItem(rowIndex)
  const newOptions = {}
  Object.keys(relatedDocumentOptions)
    .map(Number)
    .filter((i) => i !== rowIndex)
    .forEach((i, newIndex) => {
      newOptions[newIndex] = relatedDocumentOptions[i]
    })
  Object.assign(relatedDocumentOptions, newOptions)
  delete relatedDocumentOptions[relatedDocuments.data.length]
}
const emitDocument = async () => {
  states.loading = true
  try {
    const payload = {
      type_id: fields.type.data,
      client_id: fields.client.data,
      items: fields.documentBody.resolvePayload(),
      totals: {
        neto: totals.value.neto.toFixed(2),
        iva: totals.value.iva.toFixed(2),
        discount: totals.value.discountAmount.toFixed(2),
        total: totals.value.total.toFixed(2),
      },
      ...(requiresRelatedDocuments.value && {
        related_documents: relatedDocuments.resolvePayload(),
      }),
    }

    await api.post('/api/v1/accounting/dte', payload)
    showNotification('Éxito', 'Documento emitido correctamente', 'blue-grey-10')
  } catch (err) {
    if (err.response?.status === 422) {
      const errors = err.response.data?.errors || {}

      for (const [key, field] of Object.entries(fields)) {
        if ('error' in field && errors[key]) {
          field.error = true
          field['error-message'] = errors[key][0]
        }
      }

      fields.documentBody.data.forEach((_, i) => {
        fields.documentBody.columns.forEach((col) => {
          const errKey = `items.${i}.${col.key}`

          if (errors[errKey]) {
            fields.documentBody.data[i][`_error_${col.key}`] = errors[errKey][0]
          }
        })
      })
    } else {
      showNotification(
        'Error',
        err.response?.data?.message ?? err.message ?? 'Error inesperado',
        'red-10',
      )
    }
  } finally {
    setTimeout(() => {
      states.loading = false
    }, 150)
  }
}
watch(
  () => fields.type.data,
  () => {
    relatedDocuments.data.splice(0)
    relatedDocuments.addItem()
    Object.keys(relatedDocumentOptions).forEach((k) => delete relatedDocumentOptions[k])
  },
)
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

                <template v-if="field.type === 'text'">
                  <q-input
                    v-model="field.data"
                    dense
                    dark
                    outlined
                    clearable
                    color="white"
                    v-if="!states.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                  />
                </template>

                <q-skeleton dark type="QInput" animation="fade" v-if="states.loading" />
              </div>
            </q-card-section>

            <q-separator dark class="q-mx-sm" />

            <!--    Documentos relacionados   --->
            <template v-if="requiresRelatedDocuments">
              <q-card-section>
                <p class="text-white text-weight-medium q-mb-sm">{{ relatedDocuments.label }}</p>

                <div class="row q-gutter-xs q-mb-xs text-white text-caption text-weight-bold">
                  <div class="col-1 text-center">#</div>
                  <div v-for="col in relatedDocuments.columns" :key="col.key" class="col">
                    {{ col.label }}
                  </div>
                  <div class="col-1" />
                </div>

                <div
                  v-for="(row, rowIndex) in relatedDocuments.data"
                  :key="rowIndex"
                  class="row items-center q-gutter-xs q-mb-sm"
                >
                  <div class="col-1 text-center text-white text-caption">{{ row._line }}</div>

                  <div v-for="col in relatedDocuments.columns" :key="col.key" class="col q-px-sm">
                    <q-select
                      v-model="row[col.key]"
                      dense
                      dark
                      outlined
                      clearable
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      hide-bottom-space
                      lazy-rules
                      :label="col.label"
                      :rules="col.rules"
                      :options="relatedDocumentOptions[rowIndex] ?? []"
                      :option-value="(option) => option.id"
                      :option-label="(option) => option.control_number"
                      @filter="(val, update) => searchRelatedDocument(rowIndex)(val, update)"
                    />
                  </div>

                  <div class="col-1 row justify-center q-gutter-xs">
                    <q-btn
                      v-if="rowIndex === relatedDocuments.data.length - 1"
                      round
                      dense
                      color="primary"
                      icon="mdi-plus"
                      size="sm"
                      @click="relatedDocuments.addItem()"
                    />
                    <q-btn
                      v-if="rowIndex > 0"
                      round
                      dense
                      color="negative"
                      icon="mdi-minus"
                      size="sm"
                      @click="removeRelatedDocument(rowIndex)"
                    />
                  </div>
                </div>
              </q-card-section>
              <q-separator dark class="q-mx-sm" />
            </template>

            <!--    Campos dinámicos    -->
            <q-card-section v-for="(field, index) in dynamicFields" :key="index">
              <p class="text-white text-weight-medium q-mb-sm">Cuerpo del documento</p>

              <div
                class="row q-gutter-xs q-mb-xs text-white text-caption text-weight-bold"
                v-if="!states.loading"
              >
                <div class="col-1 text-center">#</div>
                <div v-for="col in field.columns" :key="col.key" :class="col.colClass ?? 'col'">
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

                  <div
                    v-for="col in field.columns"
                    :key="col.key"
                    :class="[col.colClass ?? 'col', 'q-px-sm']"
                  >
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

            <q-separator dark class="q-ma-sm" />

            <!--    Totales     -->
            <q-card-section class="row justify-end q-pa-sm q-gutter-md">
              <div class="text-white text-caption text-right">
                <div class="text-weight-bold q-mb-xs">Valor Neto</div>
                <div class="text-h6">$ {{ totals.neto.toFixed(2) }}</div>
              </div>

              <q-separator dark vertical />

              <div class="text-white text-caption text-right">
                <div class="text-weight-bold q-mb-xs">IVA (13%)</div>
                <div class="text-h6">$ {{ totals.iva.toFixed(2) }}</div>
              </div>

              <q-separator dark vertical />

              <div class="text-white text-caption text-right">
                <div class="text-weight-bold q-mb-xs">Descuento</div>
                <div class="text-h6">$ {{ totals.discountAmount.toFixed(2) }}</div>
              </div>

              <q-separator dark vertical />
              <div class="text-white text-caption text-right">
                <div class="text-weight-bold q-mb-xs">Total</div>
                <div class="text-h6">$ {{ totals.total.toFixed(2) }}</div>
              </div>
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
