import { computed } from 'vue'

const getStatusFromName = (name = '') => ({
  overdue: name.includes('(Vencida)'),
  pending: name.includes('(Pendiente de pago)') || name.includes('(Pendiente)'),
  partial: name.includes('(Parcialmente pagada)'),
  issued: name.includes('(Emitida)'),
})

export function useInvoiceStatusHelper(external, fields) {
  const overdueInvoices = computed(() =>
    external.invoices.filter((i) => getStatusFromName(i.name).overdue),
  )

  const pendingInvoices = computed(() =>
    external.invoices.filter((i) => getStatusFromName(i.name).pending),
  )

  const partiallyPaidInvoices = computed(() =>
    external.invoices.filter((i) => getStatusFromName(i.name).partial),
  )

  const selectedBy = (predicate) =>
    fields.invoices.data?.filter((id) => {
      const inv = external.invoices.find((i) => i.id === id)
      return inv && predicate(getStatusFromName(inv.name))
    }) ?? []

  const allOverdueSelected = computed(
    () =>
      overdueInvoices.value.length === 0 ||
      selectedBy((s) => s.overdue).length === overdueInvoices.value.length,
  )

  const allPendingSelected = computed(
    () =>
      pendingInvoices.value.length === 0 ||
      selectedBy((s) => s.pending).length === pendingInvoices.value.length,
  )

  const allPartiallyPaidSelected = computed(
    () =>
      partiallyPaidInvoices.value.length === 0 ||
      selectedBy((s) => s.partial).length === partiallyPaidInvoices.value.length,
  )

  return {
    getStatusFromName,
    overdueInvoices,
    pendingInvoices,
    partiallyPaidInvoices,
    allOverdueSelected,
    allPendingSelected,
    allPartiallyPaidSelected,
  }
}
