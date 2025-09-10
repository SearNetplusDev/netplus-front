export function useFields() {
  const validationRules = {
    text_required: (val) => (val && val.length > 0) || 'Campo requerido',
    select_required: (val) => (val !== null && val !== '') || 'Campo requerido',
    valid_mac: (val) =>
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(val) || 'Formato incorrecto.',
    valid_ip: (val) =>
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        val,
      ) || 'Formato inválido',
  }

  const createField = (label, type, rules = []) => ({
    data: null,
    error: false,
    label,
    type,
    rules,
  })

  const createToggle = (label) => ({
    data: false,
    error: false,
    type: 'toggle',
    label,
  })

  return { validationRules, createField, createToggle }
}
