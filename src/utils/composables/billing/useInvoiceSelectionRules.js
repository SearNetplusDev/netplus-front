/**
 * Reglas de selección de facturas para el pago.
 *
 * Las facturas deben pagarse en orden estricto: el que define `external.invoices`
 * (ya ordenado por prioridad de estado y dentro de cada estado, en el orden en que lo entrega
 * el backend; se asume cronológico, de la más antigua a la más reciente).
 *
 * - Una factura solo se puede seleccionar si TODAS las anteriores ya están seleccionadas.
 * - Si se quita una factura, se quitan también todas las posteriores.
 * @param external
 * @param fields
 * @returns {{isInvoiceDisabled: (function(*): (boolean|*))|*, normalizeSelection: (function([]=, []=): (any[]|*[]))|*}}
 */
export function useInvoiceSelectionRules({ external, fields }) {
  const getSelected = () => (Array.isArray(fields.invoices.data) ? fields.invoices.data : [])

  const isInvoiceDisabled = (opt) => {
    const selected = getSelected()

    //  Ya seleccionadas siempre se pueden quitar.
    if (selected.includes(opt.id)) return false
    const index = external.invoices.findIndex((inv) => inv.id === opt.id)
    if (index <= 0) return false

    //  Bloqueada si existe alguna factura anterior sin seleccionar
    return external.invoices.slice(0, index).some((inv) => !selected.includes(inv.id))
  }

  const normalizeSelection = (newVal = [], oldVal = []) => {
    const safeNew = Array.isArray(newVal) ? newVal : []
    const safeOld = Array.isArray(oldVal) ? oldVal : [oldVal]

    //  Si se agregó una factura no hay nada que corregir (las opciones bloqueadas no se pueden elegir)
    if (safeNew.length >= safeOld.length) return safeNew

    //  Se quitó una: conservar solo la secuencia continua desde la primera factura.
    const selected = new Set(safeNew)
    const result = []
    for (const inv of external.invoices) {
      if (!selected.has(inv.id)) break
      result.push(inv.id)
    }
    return result
  }

  return { isInvoiceDisabled, normalizeSelection }
}
