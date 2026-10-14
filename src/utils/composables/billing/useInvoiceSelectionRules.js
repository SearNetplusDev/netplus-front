/**
 * Reglas de selección de facturas para el pago.
 *
 * Las facturas deben pagarse en orden estricto, pero DENTRO DE CADA GRUPO
 * (cada servicio con facturación independiente, o el grupo de servicios consolidados).
 * El grupo lo define `invoice.group_key` (lo entrega el backend). El orden es el de
 * `external.invoices` (ya ordenado por prioridad de estado y, dentro de cada estado,
 * cronológico de la más antigua a la más reciente).
 *
 * - Una factura solo se puede seleccionar si TODAS las anteriores de su MISMO grupo
 * ya están seleccionadas.
 * - Si se quita una factura, se quitan también todas las posteriores del mismo grupo.
 * - Los grupos son independientes entre sí.
 * @param external
 * @param fields
 * @returns {{isInvoiceDisabled: (function(*): (boolean|*))|*, normalizeSelection: (function([]=, []=): (any[]|*[]))|*}}
 */
const DEFAULT_GROUP = 'default'
const groupOf = (inv) => inv?.group_key ?? DEFAULT_GROUP
export function useInvoiceSelectionRules({ external, fields }) {
  const getSelected = () => (Array.isArray(fields.invoices.data) ? fields.invoices.data : [])

  const isInvoiceDisabled = (opt) => {
    const selected = getSelected()

    //  Ya seleccionadas siempre se pueden quitar.
    if (selected.includes(opt.id)) return false

    const group = groupOf(opt)
    const sameGroup = external.invoices.filter((inv) => groupOf(inv) === group)
    const index = sameGroup.findIndex((inv) => inv.id === opt.id)
    if (index <= 0) return false

    //  Bloqueada si existe alguna factura anterior sin seleccionar
    return sameGroup.slice(0, index).some((inv) => !selected.includes(inv.id))
  }

  const normalizeSelection = (newVal = [], oldVal = []) => {
    const safeNew = Array.isArray(newVal) ? newVal : []
    const safeOld = Array.isArray(oldVal) ? oldVal : [oldVal]

    //  Si se agregó una factura no hay nada que corregir (las opciones bloqueadas no se pueden elegir)
    if (safeNew.length >= safeOld.length) return safeNew

    //  Se quitó una: conservar solo la secuencia continua desde la primera factura.
    const selected = new Set(safeNew)
    const brokenGroups = new Set()
    const result = []

    for (const inv of external.invoices) {
      const group = groupOf(inv)
      if (!selected.has(inv.id)) {
        brokenGroups.add(group)
        continue
      }
      if (!brokenGroups.has(group)) result.push(inv.id)
    }
    return result
  }

  return { isInvoiceDisabled, normalizeSelection }
}
