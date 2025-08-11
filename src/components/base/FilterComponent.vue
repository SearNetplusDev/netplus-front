<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const useDataViewer = useDataviewerStore()
const filterCandidates = ref([])
const filterGroups = ref([])
const dateBetween = ref([])
const dateBetweenText = ref('')
const dateQuery = ref('')

const appliedFilters = computed(() => useDataViewer.appliedFilters)
const filterable = computed(() => useDataViewer.filterable)
const pagination = computed(() => useDataViewer.pagination)

const availableOperators = () => [
  { title: 'Igual a', name: 'equal_to', parent: ['numeric', 'string'], component: 'single' },
  {
    title: 'No es igual a',
    name: 'not_equal_to',
    parent: ['numeric', 'string'],
    component: 'single',
  },
  { title: 'Menor que', name: 'less_than', parent: ['numeric'], component: 'single' },
  { title: 'Mayor que', name: 'greater_than', parent: ['numeric'], component: 'single' },
  { title: 'Entre', name: 'between', parent: ['numeric'], component: 'double' },
  { title: 'Contiene', name: 'contains', parent: ['string'], component: 'single' },
  { title: 'En el pasado', name: 'in_the_past', parent: ['datetime'], component: 'datetime_1' },
  { title: 'En el periodo', name: 'in_the_peroid', parent: ['datetime'], component: 'datetime_2' },
  { title: 'Igual a', name: 'equal_to', parent: ['date'], component: 'date' },
  { title: 'Entre', name: 'between', parent: ['date'], component: 'date_double' },
  { title: 'Igual a', name: 'equal_to', parent: ['options'], component: 'options' },
]

watch(dateQuery, (newVal) => {
  if (newVal) filterCandidates.value[0].query_1 = newVal
})
watch(dateBetween, (newVal) => {
  if (newVal?.from && newVal?.to) {
    filterCandidates.value[0].query_1 = newVal.from
    filterCandidates.value[0].query_2 = newVal.to
    dateBetweenText.value = `${newVal.from} - ${newVal.to}`
  }
})
watch(filterable, (newVal) => {
  filterGroups.value = newVal.filterGroups
})
const fetchOperator = computed(() => {
  return (f) => {
    return availableOperators().filter((operator) => {
      if (f.column && operator.parent.includes(f.column.type)) {
        return operator
      }
    })
  }
})
const fetch = (options = {}) => {
  useDataViewer.fetch(options)
}
const setAppliedFilters = () => {
  useDataViewer.setAppliedFilters()
}
const setPagination = () => {
  useDataViewer.setPagination()
}
const applyChange = () => {
  fetch({ force: true })
}
const applyFilter = () => {
  useDataViewer.setAppliedFilters(JSON.parse(JSON.stringify(filterCandidates.value)))
  useDataViewer.setPagination({
    ...pagination.value,
    page: 1,
  })
  applyChange()
}
const addFilter = () => {
  filterCandidates.value.push({
    columnData: '',
    column: '',
    operatorData: '',
    operator: '',
    query_1: null,
    query_2: null,
  })
}
const removeFilter = (f, i) => {
  filterCandidates.value.splice(i, 1)
  if (filterCandidates.value.length === 0) {
    resetFilter()
  } else {
    applyFilter()
  }
}
const resetFilter = () => {
  setAppliedFilters([])
  filterCandidates.value = []
  addFilter()
  setPagination({
    ...pagination.value,
    page: 1,
  })
  applyChange()
}
const getTitle = (item) => {
  try {
    return JSON.parse(item).title || ''
  } catch (e) {
    console.error(`Filter Component Error: ${e}`)
    return ''
  }
}
const changeColumn = (i, j) => {
  filterCandidates.value[i].columnData = JSON.stringify(j)
  selectColumn(i)
}
const selectColumn = (i) => {
  const columnObj = JSON.parse(filterCandidates.value[i].columnData)
  filterCandidates.value[i].column = columnObj
  const type = columnObj.type
  const operators = availableOperators()
  const defaultOperators = {
    numeric: 4,
    string: 6,
    datetime: 9,
    counter: 14,
    date: 18,
    options: 20,
  }

  const op = operators[defaultOperators[type]]
  filterCandidates.value[i].operator = op
  filterCandidates.value[i].query_1 = null
  filterCandidates.value[i].query_2 = null
}
const selectOperator = (i) => {
  const operatorObj = JSON.parse(filterCandidates.value[i].operatorData)
  filterCandidates.value[i].operator = operatorObj
  filterCandidates.value[i].query_1 = null
  filterCandidates.value[i].query_2 = null
  dateQuery.value = null
  dateBetween.value = null

  switch (operatorObj.name) {
    case 'in_the_past':
    case 'in_the_next':
      filterCandidates.value[i].query_1 = 28
      filterCandidates.value[i].query_2 = 'days'
      break
    case 'in_the_period':
      filterCandidates.value[i].query_1 = 'today'
      break
  }
}
const validateF = (f) => {
  return f.operator.component === 'single'
}
onMounted(() => {
  if (filterable.value?.filterGroups?.length > 0) {
    filterGroups.value = filterable.value.filterGroups
  }
  addFilter()
})
</script>

<template>
  <div class="q-pa-xs filter-component" style="border-radius: 20px">
    <div class="q-pa-sm fit row justify-end items-start content-start">
      <div class="col-auto">
        <q-btn-group flat>
          <q-btn flat color="white" @click="addFilter" icon="add">
            <q-tooltip
              class="bg-grey-10"
              anchor="center left"
              self="center right"
              :offset="[10, 10]"
            >
              Añadir filtro a la búsqueda
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            color="white"
            icon="replay"
            @click="resetFilter"
            v-if="appliedFilters.length > 0"
          />
          <q-btn flat color="white" icon="mdi-filter-check" @click="applyFilter">
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              :offset="[10, 10]"
            >
              Aplicar filtros
            </q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </div>
    <div
      class="q-ma-xs-sm q-ma-sm-sm q-ma-md q-ma-lg-md"
      v-for="(f, i) in filterCandidates"
      :key="f.id"
    >
      <div
        class="col-xs-12 col-sm-12 col-md-4 col-lg-4 row wrap justify-start items-start content-start"
      >
        <!--    Select filter column  -->
        <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 q-pa-none q-ma-none">
          <div class="row">
            <div class="col-7 q-pl-xs center q-px-md">
              <q-select
                dense
                dark
                v-model="filterCandidates[i].columnData"
                :options="filterGroups"
                label="Filtro"
                color="white"
                transition-show="flip-up"
                transition-hide="flip-down"
                options-selected-class="text-deep-orange"
              >
                <template v-slot:option="{ opt }">
                  <q-expansion-item
                    expand-separator
                    dark
                    dense
                    group="section"
                    :default-opened="opt['opened']"
                    header-class="text-weight-bold"
                    :label="opt['name']"
                  >
                    <q-item
                      dense
                      clickable
                      v-ripple
                      v-close-popup
                      v-for="j in opt['filters']"
                      :key="j.name"
                      @click="changeColumn(i, j)"
                    >
                      <q-item-section>
                        <q-item-label>{{ j.title }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-expansion-item>
                </template>

                <template v-slot:selected>
                  {{ getTitle(filterCandidates[i].columnData) }}
                  <!--                  {{ getTitle(filterCandidates[i].value.columnData) }}-->
                </template>
              </q-select>
            </div>

            <!--    Filter Operator   -->
            <div class="q-pl-xs center q-px-md col-5" v-if="f.column">
              <q-select
                dark
                dense
                v-model="filterCandidates[i].operatorData"
                emit-value
                map-options
                label="Operador"
                color="white"
                :options="fetchOperator(f)"
                :option-value="(opt) => JSON.stringify(opt)"
                :option-label="(opt) => opt.title"
                @update:model-value="selectOperator(i)"
              />
            </div>
          </div>
        </div>

        <div class="col-xs-10 col-sm-10 col-md-7 center q-pa-none q-ma-none">
          <!--    Busqueda simple   -->
          <div class="row q-pa-none" v-if="f.column && f.operator">
            <q-input
              v-model="f.query_1"
              dark
              dense
              color="white"
              class="col-12 q-pa-none q-px-md"
              v-if="validateF(f)"
              v-on:keyup.enter="applyFilter"
            />
            <!--    Fin busqueda simple   -->

            <!--    Busqueda por fecha simple   -->
            <div class="q-pa-none col-12" v-if="f.operator.component === 'date'">
              <q-btn text-color="white" flat icon="event" :label="dateQuery">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="flip-down"
                  transition-hide="flip-up"
                >
                  <q-date minimal dark v-model="dateQuery" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn flat v-close-popup label="Cerrar" />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-btn>
            </div>
            <!--    Fin busqueda por fecha simple   -->

            <!--    Rangos de fecha   -->
            <div class="col-12 q-pl-xs" v-if="f.operator.component === 'date_double'">
              <q-btn text-color="white" dark flat icon="event" :label="dateBetweenText">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="flip-up"
                  transition-hide="flip-down"
                >
                  <q-date minimal dark v-model="dateBetween" range>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-btn>
            </div>
            <!--    Fin rangos de fecha   -->

            <!--    Búsqueda con dos campos   -->
            <q-input
              dark
              dense
              color="white"
              class="col-6 q-pl-xs q-px-md"
              v-if="f.operator.component === 'double'"
              v-model="f.query_1"
            />
            <q-input
              dark
              dense
              color="white"
              class="col-6 q-pl-xs q-px-md"
              v-if="f.operator.component === 'double'"
              v-on:keyup.enter="applyFilter"
              v-model="f.query_2"
            />
            <!--    Fin busqueda con dos campos   -->

            <div class="q-pl-xs q-px-md col-5" v-if="f.operator.component === 'options'">
              <q-select
                v-model="f.query_1"
                dark
                dense
                emit-value
                map-options
                label=""
                color="white"
                :options="JSON.parse(f.columnData).options"
              />
            </div>
          </div>
        </div>

        <!--    Remover filtro    -->
        <div class="filter-remove center col-xs-2 col-sm-2 col-md-1 q-pa-none q-ma-none" v-if="f">
          <q-field dense borderless class="q-pa-none q-ma-none q-px-md">
            <q-btn color="red-10" size="sm" icon="delete_forever" @click="removeFilter(f, i)" />
          </q-field>
        </div>
        <!--  Fin remover filtro    -->
      </div>
    </div>
  </div>
</template>

<style scoped></style>
