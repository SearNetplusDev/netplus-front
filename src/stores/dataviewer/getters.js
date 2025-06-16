export const getters = {
  /*
  columns: (state) => state.columns,
  currentItem: (state) => state.currentItem,
  hasSockets: (state) => state.hasSockets,
  collection: (state) => state.collection,
  data: (state) => state.collection.data,
  dataViewer: (state) => state.dataViewer,
  pagination: (state) => state.pagination,
  filterable: (state) => state.filterable,
  appliedFilters: (state) => state.appliedFilters,
  externalFilters: (state) => state.externalFilters,
  getFilters: (state) => {
    const f = {}
    const filters = state.appliedFilters.filter((filter) => filter.column?.name !== undefined)
    filters.forEach((filter, i) => {
      f[`f[${i}][column]`] = filter.column.name
      f[`f[${i}][match]`] = filter.filter_match
      f[`f[${i}][operator]`] = filter.operator.name
      f[`f[${i}][query_1]`] = filter.query_1
      f[`f[${i}][query_2]`] = filter.query_2
    })
    return f
  },
  */

  get_columns: (state) => state.columns,
  get_currentItem: (state) => state.currentItem,
  get_hasSockets: (state) => state.hasSockets,
  get_collection: (state) => state.collection,
  get_data: (state) => state.collection?.data || [],
  get_dataViewer: (state) => state.dataViewer,
  get_pagination: (state) => state.pagination,
  get_filterable: (state) => state.filterable,
  get_appliedFilters: (state) => state.appliedFilters,
  get_externalFilters: (state) => state.externalFilters,
  get_filters: (state) => {
    const f = {}
    const filters = state.appliedFilters.filter((filter) => filter.column?.name !== undefined)
    filters.forEach((filter, i) => {
      f[`f[${i}][column]`] = filter.column.name
      f[`f[${i}][match]`] = filter.filter_match
      f[`f[${i}][operator]`] = filter.operator.name
      f[`f[${i}][query_1]`] = filter.query_1
      f[`f[${i}][query_2]`] = filter.query_2
    })
    return f
  },
}
