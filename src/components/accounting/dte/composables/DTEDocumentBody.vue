<script setup>
defineProps({
  dynamicFields: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <q-card-section v-for="(field, index) in dynamicFields" :key="index">
    <p class="text-white text-weight-medium q-mb-sm">Cuerpo del documento</p>

    <div v-if="!loading" class="row q-gutter-xs q-mb-xs text-white text-caption text-weight-bold">
      <div class="col-1 text-center">#</div>
      <div v-for="col in field.columns" :key="col.key" :class="col.colClass ?? 'col'">
        {{ col.label }}
      </div>
      <div class="col-1" />
    </div>

    <template v-if="!loading">
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
          <!--    Inputs de solo lectura (computed)   -->
          <q-input
            :model-value="col.computed(row)"
            dense
            dark
            outlined
            disable
            hide-bottom-space
            :label="col.label"
            v-if="col.type === 'computed'"
          />

          <!--    Select    -->
          <q-select
            v-else-if="col.type === 'select'"
            v-model="row[col.key]"
            dense
            dark
            outlined
            clearable
            emit-value
            map-options
            lazy-rules
            hide-bottom-space
            :label="col.label"
            :rules="col.rules"
            :options="col.options ?? []"
            :option-value="col.optionValue"
            :option-label="col.optionLabel"
          />

          <!--    Editables   -->
          <q-input
            v-model="row[col.key]"
            dense
            dark
            outlined
            clearable
            lazy-rules
            :label="col.label"
            :type="col.type"
            :rules="col.rules"
            :mask="col.mask"
            hide-bottom-space
            v-else
          />
        </div>

        <div class="col-1 row justify-center q-gutter-xs">
          <q-btn
            round
            dense
            color="primary"
            icon="mdi-plus"
            size="sm"
            v-if="rowIndex === field.data.length - 1"
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
</template>

<style scoped></style>
