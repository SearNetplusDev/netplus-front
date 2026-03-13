<script setup>
import { reactive } from 'vue'
import { useFields } from 'src/utils/composables/useFields.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const props = defineProps({
  id: { type: Number, required: true },
})
const states = reactive({
  title: 'Emitir Documento Tributario Electrónico',
  loading: false,
})
const { createField, createDynamicList, validationRules } = useFields()
const fields = reactive({
  client: createField('Cliente', 'text', [validationRules.text_required]),
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
const emitDocument = async () => {
  const payload = fields.documentBody.resolvePayload()
  console.log(`ID: ${props.id}`)
  // console.log('Payload: ', JSON.stringify(fields.documentBody.data))
  console.log('Payload: ', JSON.stringify(payload))
}
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
                <template v-if="field.type === 'text'">
                  <q-input
                    v-model="field.data"
                    dark
                    dense
                    outlined
                    clearable
                    lazy-rules
                    v-if="!states.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                    :disable="field.disabled"
                    :mask="field.mask"
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
