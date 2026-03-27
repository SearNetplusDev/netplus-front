import { ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useNotifications } from 'src/utils/notification.js'

export function useDTEInvoices() {
  const { showNotification } = useNotifications()
  const invoiceOptions = ref([])
  const selectedInvoices = ref([])
  const loadingInvoices = ref(false)
  const loadClientInvoices = async (clientId) => {
    if (!clientId) {
      invoiceOptions.value = []
      return
    }

    loadingInvoices.value = true

    try {
      const { data } = await api.post('/api/v1/accounting/client/invoices', {
        client_id: clientId,
        _method: 'POST',
      })
      invoiceOptions.value = data.invoices || []
    } catch (err) {
      showNotification(
        'Error',
        err.response?.data?.message ?? err.message ?? 'Error inesperado',
        'red-10',
      )
    } finally {
      setTimeout(() => {
        loadingInvoices.value = false
      }, 150)
    }
  }

  const toggleInvoice = (invoice) => {
    const idx = selectedInvoices.value.findIndex((i) => i.id === invoice.id)
    if (idx === -1) {
      selectedInvoices.value.push(invoice)
    } else {
      selectedInvoices.value.splice(idx, 1)
    }
  }

  const isInvoiceSelected = (invoice) => {
    return selectedInvoices.value.some((i) => i.id === invoice.id)
  }

  const reset = () => {
    invoiceOptions.value = []
    selectedInvoices.value = []
  }

  return {
    invoiceOptions,
    selectedInvoices,
    loadingInvoices,
    loadClientInvoices,
    toggleInvoice,
    isInvoiceSelected,
    reset,
  }
}
