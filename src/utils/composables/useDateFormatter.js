export function useDateFormatter(locale = 'es-SV') {
  const formatDate = (date, options = {}) => {
    if (!date) return ''

    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options,
    }).format(d)
  }

  const formatDateTime = (date) => {
    if (!date) return ''

    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d)
  }

  const formatShortDate = (date) => {
    return formatDate(date)
  }

  const formatLongDate = (date) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return {
    formatDate,
    formatDateTime,
    formatShortDate,
    formatLongDate,
  }
}
