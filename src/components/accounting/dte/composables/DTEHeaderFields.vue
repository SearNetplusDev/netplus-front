<script setup>
defineProps({
  fields: {
    type: Object,
    required: true,
  },
  normalFields: {
    type: Object,
    required: true,
  },
  requiresPaymentCondition: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <q-card-section class="row content-start items-start q-pa-sm">
    <div
      v-for="(field, index) in normalFields"
      :key="index"
      class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm"
      v-show="index !== 'payment_condition' || requiresPaymentCondition"
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
          v-if="!loading"
          :label="field.label"
          :rules="field.rules"
          :error="field.error"
          :error-message="field['error-message']"
          :options="field.options ?? []"
          :option-value="field.optionValue"
          :option-label="field.optionLabel"
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
          v-if="!loading"
          :label="field.label"
          :rules="field.rules"
          :error="field.error"
          :error-message="field['error-message']"
          :options="field.options ?? []"
          :option-value="field.optionValue"
          :option-label="field.optionLabel"
          @filter="field.filter"
          :disable="field.disabled"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">Sin resultados</q-item-section>
            </q-item>
          </template>
        </q-select>
      </template>

      <template v-if="field.type === 'text'">
        <q-input
          v-model="field.data"
          dense
          dark
          outlined
          clearable
          color="white"
          v-if="!loading"
          :label="field.label"
          :rules="field.rules"
          :error="field.error"
          :error-message="field['error-message']"
        />
      </template>

      <q-skeleton dark type="QInput" animation="fade" v-if="loading" />
    </div>
  </q-card-section>
</template>

<style scoped></style>
