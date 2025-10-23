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
    latitude: (val) =>
      /^([-+]?(90(\.0{6,})?|[0-8]?\d(\.\d{6,})?))$/.test(val) || 'Formato incorrecto para latitud',
    longitude: (val) =>
      /^([-+]?(180(\.0{6,})?|1[0-7]\d(\.\d{6,})?|[0-9]?\d(\.\d{6,})?))$/.test(val) ||
      'Formato incorrecto para longitud',
    email: (val) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) ||
      'Formato de correo incorrecto',
    nc: (val) => /^\d{12}$/.test(val) || 'Formato incorrecto para NC',
    money_format: (val) =>
      /^\d{1,4}\.\d{8}$/.test(val) ||
      'Formato inválido (debe contener de 1 a 4 cifras y 8 decimales)',
    number_stb: (val) => /^[0-9]$/.test(val) || 'Solo se admiten números del 0 al 9',
  }

  const createField = (label, type, rules = [], disabled = false, mask = '') => ({
    data: null,
    error: false,
    label,
    type,
    rules,
    disabled,
    mask,
  })

  const createToggle = (label) => ({
    data: false,
    error: false,
    type: 'toggle',
    label,
  })

  return { validationRules, createField, createToggle }
}
