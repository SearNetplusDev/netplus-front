import { reactive } from 'vue'
import { api } from 'src/utils/api.js'
import { useFields } from 'src/utils/composables/useFields.js'
import { useNotifications } from 'src/utils/notification.js'

export function useDTERelatedDocs() {
  const { showNotification } = useNotifications()
  const { createDynamicList } = useFields()
  const relatedDocuments = reactive(
    createDynamicList('Documentos relacionados', [
      {
        key: 'document_number',
        label: 'Número de documento',
        type: 'select-filter',
        rules: [],
      },
    ]),
  )

  const relatedDocumentOptions = reactive({})

  const searchRelatedDocuments = (rowIndex) => async (val, update) => {
    if (!val || val.length < 18) {
      update(() => (relatedDocumentOptions[rowIndex] = []))
      return
    }

    let results = []

    try {
      const { data } = await api.post('/api/v1/accounting/dte/search', {
        control_number: val,
        _method: 'POST',
      })
      results = data.documents || []
    } catch (err) {
      showNotification(
        'Error',
        err.response?.data?.message ?? err.message ?? 'Error inesperado',
        'red-10',
      )
    }

    update(() => {
      relatedDocumentOptions[rowIndex] = results
    })
  }

  const removeRelatedDocument = (rowIndex) => {
    relatedDocuments.removeItem(rowIndex)

    const newOptions = {}
    Object.keys(relatedDocumentOptions)
      .map(Number)
      .filter((i) => i !== rowIndex)
      .forEach((i, newIndex) => {
        newOptions[newIndex] = relatedDocumentOptions[i]
      })
    Object.assign(relatedDocumentOptions, newOptions)
    delete relatedDocumentOptions[relatedDocuments.data.length]
  }

  const reset = () => {
    relatedDocuments.data.splice(0)
    relatedDocuments.addItem()
    Object.keys(relatedDocumentOptions).forEach((k) => delete relatedDocumentOptions[k])
  }

  return {
    relatedDocuments,
    relatedDocumentOptions,
    searchRelatedDocuments,
    removeRelatedDocument,
    reset,
  }
}
