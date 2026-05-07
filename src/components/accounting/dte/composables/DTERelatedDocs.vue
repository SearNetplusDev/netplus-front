<script setup>
defineProps({
  relatedDocuments: {
    type: Object,
    required: true,
  },
  relatedDocumentOptions: {
    type: Object,
    required: true,
  },
  searchRelatedDocument: {
    type: Function,
    required: true,
  },
  removeRelatedDocuments: {
    type: Function,
    required: true,
  },
})
</script>

<template>
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
          :option-label="(option) => option.label"
          @filter="(val, update) => searchRelatedDocument(rowIndex)(val, update)"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">Sin resultados</q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!--      <div class="col-1 row justify-center q-gutter-xs">-->
      <!--        <q-btn-->
      <!--          round-->
      <!--          dense-->
      <!--          color="primary"-->
      <!--          icon="mdi-plus"-->
      <!--          size="sm"-->
      <!--          v-if="rowIndex === relatedDocuments.data.length - 1"-->
      <!--          @click="relatedDocuments.addItem()"-->
      <!--        />-->

      <!--        <q-btn-->
      <!--          v-if="rowIndex > 0"-->
      <!--          round-->
      <!--          dense-->
      <!--          color="negative"-->
      <!--          icon="mdi-minus"-->
      <!--          size="sm"-->
      <!--          @click="relatedDocuments.removeItem(rowIndex)"-->
      <!--        />-->
      <!--      </div>-->
    </div>
  </q-card-section>
</template>

<style scoped></style>
