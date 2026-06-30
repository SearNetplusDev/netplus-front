export function useMoneyFormatter() {
  const formatMoney = (val) => {
    if (val === null || val === undefined || val === '') {
      return '$0.00'
    }
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(val))
  }
  return { formatMoney }
}
