<script setup>
const emissionTypeOptions = [
  { id: 1, name: 'Manual' },
  { id: 2, name: 'Por factura' },
]
const model = defineModel({ required: true })
</script>

<template>
  <q-card-section>
    <p class="text-white text-weight-medium q-mb-sm">Tipo de emisión</p>

    <div class="row">
      <div class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-sm">
        <q-select
          v-model="model"
          dark
          dense
          outlined
          clearable
          color="white"
          emit-value
          map-options
          transition-show="jump-up"
          transition-hide="jump-down"
          lazy-rules
          label="Tipo de emisión"
          :options="emissionTypeOptions"
          option-value="id"
          option-label="name"
          :rules="[(val) => !!val || 'Selecciona un tipo de emisión']"
        />
      </div>
    </div>
  </q-card-section>
</template>

<style scoped></style>
