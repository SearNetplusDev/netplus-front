export function useInvoiceOrdering() {
  const priority = (name) => {
    if (name.includes('(Vencida)')) return 1
    if (name.includes('(Pendiente de pago)') || name.includes('(Pendiente')) return 2
    if (name.includes('(Parcialmente pagada)')) return 3
    if (name.includes('(Emitida)')) return 4
    return 99
  }

  const sortInvoicesByPriority = (invoices) =>
    [...invoices].sort((a, b) => priority(a.name) - priority(b.name))

  return { sortInvoicesByPriority }
}
