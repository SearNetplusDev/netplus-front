import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function useFields() {
  const validationRules = {
    text_required: (val) => !!val || 'Campo requerido',
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
    nrc: (val) => /^\d{6}-\d$/.test(val) || 'Formato incorrecto',
    dui: (val) => /^\d{8}-\d$/.test(val) || 'Formato incorrecto',
    nit: (val) => /^\d{8}-\d$|^\d{4}-\d{6}-\d{3}-\d$/.test(val) || 'Formato incorrecto',
    national_phone: (val) => /^[267]\d{3}-\d{4}$/.test(val) || 'Formato incorrecto',
    two_decimal: (val) => /^\d{2}\.\d{2}$/.test(val) || 'Formato inválido',
    money_two_decimal: (val) => /^\d{1,4}\.\d{2}$/.test(val) || 'Formato inválido',
    parsed_phone: (getCountry) => (val) => {
      const country = getCountry()
      const parsed = parsePhoneNumberFromString(val, country)
      return (parsed && parsed.isValid()) || 'Teléfono inválido para el país seleccionado'
    },
    only_letters: (val) => /^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/.test(val) || 'No se permiten números',
    extension_days: (val) => /^[1-5]+$/.test(val) || 'Solo se puede agregar un máximo de 5 días.',
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
