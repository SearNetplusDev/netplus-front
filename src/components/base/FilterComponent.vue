<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useDataviewerStore } from 'stores/dataviewer/index.js'

const useDataViewer = useDataviewerStore()
const filterCandidates = ref([])
const filterGroups = ref([])
const dateBetween = ref([])
const dateBetweenText = ref('')
const dateQuery = ref('')

watch(dateQuery, (newVal) => {
  if (newVal !== null && newVal !== '') {
    filterCandidates.value[0].query_1 = newVal
  }
})
watch(dateBetween, (newVal) => {
  if (newVal === null) return
  if (newVal['from'] === undefined) return
  if (newVal['from'] !== '' && newVal['to'] !== '') {
    filterCandidates.value[0].query_1 = newVal['from']
    filterCandidates.value[0].query_2 = newVal['to']
    dateBetweenText.value = `${newVal['from']} - ${newVal['to']}`
  }
})
const filterable = computed(() => {
  return useDataViewer.filterable
})
const appliedFilters = computed(() => {
  return useDataViewer.appliedFilters
})
const pagination = computed(() => {
  return useDataViewer.pagination
})
// const hasSockets = computed(() => {
//   return useDataViewer.hasSockets
// })
watch(filterable, (newVal) => {
  filterGroups.value = newVal.filterGroups
})
const fetchOperator = computed(() => {
  return (f) => {
    return availabeOperators().filter((operator) => {
      if (f.column && operator.parent.includes(f.column.type)) {
        return operator
      }
    })
  }
})
const fetch = () => {
  useDataViewer.fetch()
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
  setAppliedFilters(JSON.parse(JSON.stringify(filterCandidates)))
  setPagination({
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    filter_match: pagination.value.filterMatch,
    page: 1,
    rowsPerPage: pagination.value.rowsPerPage,
    rowsNumber: pagination.value.rowsNumber,
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
  filterCandidates.value.splice(0)
  addFilter()
  setPagination({
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    filter_match: pagination.value.filterMatch,
    page: 1,
    rowsPerPage: pagination.value.rowsPerPage,
    rowsNumber: pagination.value.rowsNumber,
  })
  applyChange()
}
const getTitle = (item) => {
  let title = ''
  try {
    title = JSON.parse(item).title
  } catch (e) {
    console.error(`Filter Component Error: ${e}`)
  }
  return title
}
const changeColumn = (i, j) => {
  filterCandidates[i].value.columnData = JSON.stringify(j)
  selectColumn(i)
}
const selectColumn = (i) => {
  if (filterCandidates[i].value.columnData === undefined) return
  let obj = JSON.parse(filterCandidates[i].value.columnData)
  filterCandidates[i].value.column = obj

  switch (obj.type) {
    case 'numeric':
      filterCandidates[i].value.operator = availabeOperators()[4]
      filterCandidates[i].value.query_1 = null
      filterCandidates[i].value.query_2 = null
      break
    case 'date':
      filterCandidates[i].value.operator = availabeOperators()[18]
      filterCandidates[i].value.query_1 = null
      filterCandidates[i].value.query_2 = null
      break
    case 'string':
      filterCandidates[i].value.operator = availabeOperators()[6]
      filterCandidates[i].value.query_1 = null
      filterCandidates[i].value.query_2 = null
      break
    case 'datetime':
      filterCandidates[i].value.operator = availabeOperators()[9]
      filterCandidates[i].value.query_1 = 28
      filterCandidates[i].value.query_2 = 'days'
      break
    case 'counter':
      filterCandidates[i].value.operator = availabeOperators()[14]
      filterCandidates[i].value.query_1 = 28
      filterCandidates[i].value.query_2 = 'days'
      break
    case 'options':
      filterCandidates[i].value.operator = availabeOperators()[20]
      filterCandidates[i].value.query_1 = null
      filterCandidates[i].value.query_2 = null
      break
  }
}
const selectOperator = (i) => {
  let obj = JSON.parse(filterCandidates[i].value.operatorData)
  filterCandidates[i].value.operator = obj
  filterCandidates[i].value.query_1 = null
  filterCandidates[i].value.query_2 = null
  dateQuery.value = null
  dateBetween.value = null
  switch (obj.name) {
    case 'in_the_past':
    case 'in_the_next':
      filterCandidates[i].value.query_1 = 28
      filterCandidates[i].value.query_2 = 'days'
      break
    case 'in_the_period':
      filterCandidates[i].value.query_1 = 'today'
      break
  }
}
const availabeOperators = () => {
  return [
    { title: 'Igual a', name: 'equal_to', parent: ['numeric', 'string'], component: 'single' },
    {
      title: 'No es igual a',
      name: 'not_equal_to',
      parent: ['numeric', 'string'],
      component: 'single',
    },

    { title: 'Menor que', name: 'less_than', parent: ['numeric'], component: 'single' },
    { title: 'Mayor que', name: 'greater_than', parent: ['numeric'], component: 'single' }, // 3

    { title: 'Entre', name: 'between', parent: ['numeric'], component: 'double' },
    { title: 'No entre', name: 'not_between', parent: ['numeric'], component: 'double' }, //5

    { title: 'Contiene', name: 'contains', parent: ['string'], component: 'single' },
    { title: 'Inicia con', name: 'starts_with', parent: ['string'], component: 'single' },
    { title: 'Termina con', name: 'ends_with', parent: ['string'], component: 'single' }, //8

    { title: 'En el pasado', name: 'in_the_past', parent: ['datetime'], component: 'datetime_1' },
    {
      title: 'En el siguiente',
      name: 'in_the_next',
      parent: ['datetime'],
      component: 'datetime_1',
    },
    {
      title: 'En el periodo',
      name: 'in_the_peroid',
      parent: ['datetime'],
      component: 'datetime_2',
    }, //11

    { title: 'Igual a cuenta', name: 'equal_to_count', parent: ['counter'], component: 'single' },
    {
      title: 'No Igual a cuenta',
      name: 'not_equal_to_count',
      parent: ['counter'],
      component: 'single',
    },
    {
      title: 'Menor que cuenta',
      name: 'less_than_count',
      parent: ['counter'],
      component: 'single',
    },
    {
      title: 'Mayor que cuenta',
      name: 'greater_than_count',
      parent: ['counter'],
      component: 'single',
    }, //15

    { title: 'Igual a', name: 'equal_to', parent: ['date'], component: 'date' },
    { title: 'Menor que', name: 'less_than', parent: ['date'], component: 'date' },
    { title: 'Mayor que', name: 'greater_than', parent: ['date'], component: 'date' },
    { title: 'Entre', name: 'between', parent: ['date'], component: 'date_double' }, //19

    { title: 'Igual a', name: 'equal_to', parent: ['options'], component: 'options' }, //20
  ]
}
const validateF = (f) => {
  switch (f.operator.component) {
    case 'single':
      return true
    default:
      break
  }
  return false
}
onMounted(() => {
  const filter = filterable.value
  if (filter.filterGroups.length > 0) {
    filterGroups.value = filter.filterGroups
  }
})
</script>

<template>
  <div class="q-pa-xs filter-component" style="border-radius: 20px">
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
                        <q-item-label :v-html="j.title" />
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
            <q-btn color="red-10" icon="delete_forever" @click="removeFilter(f, i)" />
          </q-field>
        </div>
        <!--  Fin remover filtro    -->
      </div>
    </div>

    <div class="q-pa-sm fit row justify-end items-start content-start">
      <div class="col-auto">
        <q-btn-group>
          <q-btn flat color="white" @click="addFilter" icon="add" />
          <q-btn
            flat
            color="red-10"
            icon="replay"
            @click="resetFilter"
            v-if="appliedFilters.length > 0"
          />
          <q-btn flat color="white" icon="filter_alt" @click="applyFilter" />
        </q-btn-group>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
