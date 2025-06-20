export const getters = {
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
    const filters = {}

    if (!state.appliedFilters || state.appliedFilters.length === 0) return filters
    state.appliedFilters.forEach((f, i) => {
      if (!f.column?.name || !f.operator?.name) return
      filters[`f[${i}][column]`] = f.column.name
      filters[`f[${i}][operator]`] = f.operator.name

      if (f.query_1 !== undefined && f.query_1 !== null) {
        filters[`f[${i}][query_1]`] = f.query_1
      }
      if (f.query_2 !== undefined && f.query_2 !== null) {
        filters[`f[${i}][query_2]`] = f.query_2
      }
    })
    return filters
  },
}
