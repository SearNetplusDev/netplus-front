// import { api, cancelSource } from 'boot/axios.js'
import { api, cancelSource } from 'src/utils/api.js'

let timeoutReload = null

export const actions = {
  reset() {
    //  Mutations
    Object.assign(this, {
      loading: true,
      hasSockets: false,
      appliedFilters: [],
      externalFilters: [],
      filterable: {
        title: '',
        url: '',
        orderables: [],
        filterGroups: [],
      },
      pagination: {
        sortBy: 'id',
        descending: false,
        filter_match: 'and',
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10,
      },
      collection: {},
      dataViewer: {
        show: true,
        filter: true,
        allowCreate: true,
        showForm: 0,
      },
      currentItem: 0,
    })
  },
  setColumns(data) {
    this.columns = data
  },
  cancelRequest() {
    cancelSource.cancel()
    cancelSource.setSource()
    clearTimeout(timeoutReload)
  },

  fetch(data = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.cancelRequest()

        const pag = this.pagination ?? {
          sortBy: 'id',
          descending: false,
          filter_match: 'and',
          page: 1,
          rowsPerPage: 10,
          rowsNumber: 10,
        }

        const pagination = {
          order_column: pag.sortBy,
          order_direction: pag.descending ? 'desc' : 'asc',
          filter_match: pag.filter_match,
          limit: pag.rowsPerPage,
          page: pag.page,
          total: pag.rowsNumber,
        }

        let f = {}
        let externalFilters = this.externalFilters || []

        externalFilters = externalFilters.filter((filter) => {
          return (
            filter &&
            filter.key &&
            filter.data &&
            Array.isArray(filter.data) &&
            filter.data.length > 0
          )
        })

        externalFilters.forEach((filter, i) => {
          f[`e[${i}][column]`] = filter.key
          f[`e[${i}][data]`] = JSON.stringify(filter.data)
        })

        const params = {
          ...this.get_filters,
          ...f,
          ...pagination,
        }

        if (this.hasSockets && !data?.force) {
          timeoutReload = setTimeout(() => this.fetch(data), 60000)
          resolve()
          return
        }

        if (this.dataViewer?.showForm !== 0 || !this.filterable.url) {
          timeoutReload = setTimeout(() => this.fetch(data), 60000)
          resolve()
          return
        }

        api
          .post(`/api/v1${this.filterable.url}data`, null, {
            params: params,
            cancelToken: cancelSource.getSource().token,
          })
          .then((response) => {
            if (JSON.stringify(response.data?.collection) !== JSON.stringify(this.collection)) {
              this.collection = response.data?.collection
              const order_direction = pagination.order_direction !== 'asc'

              this.pagination = {
                sortBy: pagination.order_column,
                descending: order_direction,
                filter_match: pagination.filter_match,
                page: response.data.collection.current_page,
                rowsPerPage: response.data.collection.per_page,
                rowsNumber: response.data.collection.total,
              }
            }
            resolve(response.data)
          })
          .catch((err) => {
            if (err.name !== 'CanceledError') {
              console.error(`Error en dataviewer store: ${err}`)
              this.resetCollection()
            }
            reject(err)
          })
          .finally(() => {
            // if (!data?.skipAutoRefresh) {
            timeoutReload = setTimeout(() => this.fetch({ force: false }), 60000)
            // }
          })
      } catch (err) {
        console.error(`Error detectado en fetch data: ${err}`)
        reject(err)
      }
    })
  },

  setCurrentItem(data) {
    this.currentItem = data
  },
  setHasSocket(data) {
    this.hasSockets = data
  },

  setFilterable(data) {
    this.filterable = data
  },
  setExternalFilters(data) {
    if (data.option === undefined) {
      this.externalFilters = []
      return
    }
    switch (data.option) {
      case 'push':
        this.externalFilters.push(data.value)
        break
      case 'replace':
        this.externalFilters[data.key] = data.value
        break
      case 'splice':
        this.externalFilters.splice(data.key, 1)
        break
    }
  },
  setPagination(data) {
    if (!data || typeof data !== 'object') return
    this.pagination = {
      ...this.pagination,
      ...data,
    }
  },
  setAppliedFilters(data = []) {
    // this.externalFilters = data
    this.appliedFilters = data
  },
  setDataViewer(data) {
    // Object.assign(this.dataViewer, data)
    this.dataViewer = data
  },
  changeShowForm(payload) {
    this.dataViewer = {
      ...this.dataViewer,
      showForm: payload,
    }
  },
  resetDataViewer() {
    this.dataViewer = { ...this.dataViewer }
  },
  resetCollection() {
    this.collection = { data: [] }
  },
  setCollection(data) {
    this.collection = data
  },
  setAuthorization(data) {
    this.authorization = data
  },
}
