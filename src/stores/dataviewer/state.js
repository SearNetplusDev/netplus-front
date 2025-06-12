export const state = () => ({
  loading: true,
  hasSockets: false,
  currentItem: 0,
  appliedFilters: [],
  externalFilters: [],
  columns: [],
  filterable: {
    title: '',
    url: '',
    orderables: [],
    filterGroups: [],
  },
  pagination: {
    sortBy: 'id',
    descending: false,
    filterMatch: 'and',
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 10,
  },
  collection: {},
  dataViewer: {
    show: false,
    filter: false,
    allowCreate: false,
    showForm: 0,
  },
})
