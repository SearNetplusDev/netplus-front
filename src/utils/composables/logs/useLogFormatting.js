import { fieldTranslations } from 'src/utils/composables/logs/fieldTranslations.js'

export const useLogFormatting = () => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/El_Salvador',
    }
    return new Intl.DateTimeFormat('es-Es', options).format(date)
  }

  const formatFieldName = (fieldName) => {
    if (fieldTranslations[fieldName]) {
      return fieldTranslations[fieldName]
    }
    // =====  Convertir de snake_case a un formato legible  =====
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return '< Sin datos >'
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    if (typeof value === 'boolean') {
      return value ? 'Activo' : 'Inactivo'
    }
    return String(value)
  }
  return { formatDate, formatFieldName, formatValue }
}
