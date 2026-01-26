export function useInvoiceSelectionRules({
  overdueInvoices,
  pendingInvoices,
  partiallyPaidInvoices,
  allOverdueSelected,
  allPendingSelected,
  allPartiallyPaidSelected,
  external,
  // fields,
}) {
  const isInvoiceDisabled = (opt) => {
    const isOverdue = opt.name.includes('(Vencida)')
    const isPending = opt.name.includes('(Pendiente de pago)') || opt.name.includes('(Pendiente)')
    const isPartially = opt.name.includes('(Parcialmente pagada)')

    if (overdueInvoices.value.length > 0 && !allOverdueSelected.value) {
      return !isOverdue
    }

    if (allOverdueSelected.value && pendingInvoices.value.length > 0 && !allPendingSelected.value) {
      return !isPending
    }

    if (
      allOverdueSelected.value &&
      allPendingSelected.value &&
      partiallyPaidInvoices.value.length > 0 &&
      !allPartiallyPaidSelected.value
    ) {
      return !isPartially
    }

    return false
  }

  const normalizeSelection = (newVal = [], oldVal = []) => {
    const safeNew = Array.isArray(newVal) ? newVal : []
    const safeOld = Array.isArray(oldVal) ? oldVal : []

    const getByStatus = (ids, matcher) =>
      ids.filter((id) => {
        const inv = external.invoices.find((i) => i.id === id)
        return inv && matcher(inv.name)
      })

    const overdue = getByStatus(safeNew, (n) => n.includes('(Vencida)'))
    const pending = getByStatus(
      safeNew,
      (n) => n.includes('(Pendiente de pago)') || n.includes('(Pendiente)'),
    )
    const partial = getByStatus(safeNew, (n) => n.includes('(Parcialmente pagada)'))

    const oldOverdue = getByStatus(safeOld, (n) => n.includes('(Vencida)'))
    const oldPending = getByStatus(
      safeOld,
      (n) => n.includes('(Pendiente de pago)') || n.includes('(Pendiente)'),
    )
    const oldPartial = getByStatus(safeOld, (n) => n.includes('(Parcialmente pagada)'))

    if (overdue.length < oldOverdue.length) {
      return overdue
    }

    if (pending.length < oldPending.length) {
      return [...overdue, ...pending]
    }

    if (partial.length < oldPartial.length) {
      return [...overdue, ...pending, ...partial]
    }

    return safeNew
  }

  return {
    isInvoiceDisabled,
    normalizeSelection,
  }
}
