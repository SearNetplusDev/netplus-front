<script setup>
import { reactive, onMounted } from 'vue'
import { api } from 'src/utils/api.js'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const useDataViewer = useDataviewerStore()
const props = defineProps(['props'])
const data = reactive(props.props)
const getOptions = (url, index) => {
  api
    .get(url)
    .then((res) => {
      data.cols[index].options = res.data.response
    })
    .catch((err) => {
      console.error(`Filter table error: ${err}`)
    })
}

const filterChange = (key, model) => {
  if (!model || model.length === 0) {
    const existingIndex = useDataViewer.externalFilters.findIndex((filter) => filter.key === key)
    if (existingIndex !== -1) {
      useDataViewer.setExternalFilters({ key: existingIndex, option: 'splice', value: null })
    }
  } else {
    const item = { key, data: model }
    const existingIndex = useDataViewer.externalFilters.findIndex((filter) => filter.key === key)

    if (existingIndex !== -1) {
      useDataViewer.setExternalFilters({ key: existingIndex, option: 'replace', value: item })
    } else {
      useDataViewer.setExternalFilters({
        key: useDataViewer.externalFilters.length,
        option: 'push',
        value: item,
      })
    }
  }
  useDataViewer.fetch({ force: true })
}

onMounted(() => {
  data.cols.forEach((val, index) => {
    if (val.filterURL !== undefined) {
      getOptions(val.filterURL, index)
    }
  })
})
</script>

<template>
  <q-tr>
    <q-th v-for="col in data.cols" :key="col.name" class="text-left q-header">
      <span :class="col.model?.length > 0 ? 'text-amber' : 'text-white'">
        {{ col.label }}
      </span>
      <q-btn-dropdown v-if="col.filterable" size="xs" class="q-px-sm" dense flat>
        <template v-slot:label>
          <q-icon name="filter_alt" :color="col.model?.length > 0 ? 'amber' : '#fff'" />
        </template>

        <q-list dense v-if="col.options">
          <q-item
            dark
            class="bg-dark"
            v-for="option in col.options"
            :key="option.id"
            tag="label"
            v-ripple
          >
            <q-item-section>
              <q-checkbox
                v-model="col.model"
                keep-color
                :val="option.id"
                :label="option.name"
                size="xs"
                :color="col.model?.includes(option.id) ? 'positive' : 'negative'"
                @click="filterChange(col.name, col.model)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-th>
  </q-tr>
</template>

<style scoped></style>
