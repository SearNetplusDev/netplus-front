export function useDocumentFields() {
  const documentMasks = {
    1: '#######', // Carnet de residente
    2: '', // Pasaporte (sin máscara por variabilidad)
    3: '########-#', // DUI
    4: '', // NIT (múltiples formatos, sin máscara)
    5: '', // Otro
  }

  const documentPlaceholders = {
    1: '0000000',
    2: 'A0000000 ó A00000000',
    3: '00000000-0',
    4: '0000-000000-000-0 ó 00000000-0',
    5: 'Número de documento',
  }

  const documentValidations = {
    1: {
      pattern: /^\d{7}$/,
      message: 'Formato de Carnet de residente incorrecto',
    },
    2: {
      pattern: /^[A-Z][0-9]{7,8}$/,
      message: 'Formato de pasaporte inválido',
    },
    3: {
      pattern: /^\d{8}-\d$/,
      message: 'Formato de DUI no válido',
    },
    4: {
      pattern: /^\d{8}-\d$|^\d{4}-\d{6}-\d{3}-\d$/,
      message: 'Formato de NIT incorrecto',
    },
    5: {
      pattern: /.+/,
      message: 'Campo requerido',
    },
  }

  const getDocumentMask = (documentTypeId) => {
    return documentMasks[documentTypeId] || ''
  }

  const getDocumentPlaceholder = (documentTypeId) => {
    return documentPlaceholders[documentTypeId] || ''
  }

  const getDocumentValidation = (documentTypeId) => {
    const config = documentValidations[documentTypeId]
    if (!config) return []

    return [(val) => config.pattern.test(val) || config.message]
  }

  return {
    getDocumentMask,
    getDocumentPlaceholder,
    getDocumentValidation,
  }
}
