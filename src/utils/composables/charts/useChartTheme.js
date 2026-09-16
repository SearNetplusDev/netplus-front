/**
 * Paletas de colores de cada gráfico.
 * @type {{clientTypes: string[], invoices: string[], supports: string[], cpu: string[]}}
 */
export const CHART_PALETTE = {
  clientTypes: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  invoices: ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#64748b', '#8338ec'],
  supports: ['#00E396', '#FEB019', '#008FFB', '#FF4560'],
  cpu: ['#00B4D8', '#48CAE4', '#90E0EF'],
}

/**
 * Bloque base "chart" (tamaño, fondo, colores de texto, toolbar)
 * @param type
 * @param id
 * @param width
 * @param height
 * @param toolbar
 */
export function baseChartChrome({ type, id, width = 200, height = 300, toolbar = false } = {}) {
  return {
    id,
    type,
    width,
    height,
    background: 'transparent',
    foreColor: '#f8fafc',
    toolbar: { show: toolbar },
  }
}

export function chartTitle(text, overrides = {}) {
  return {
    text,
    align: 'center',
    style: {
      color: '#f8fafc',
      fontSize: '18px',
      fontWeight: '600',
    },
    ...overrides,
  }
}

export function chartLegend(overrides = {}) {
  return {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    labels: { color: '#cbd5e1' },
    markers: { width: 12, height: 12, radius: 12 },
    itemMargin: { horizontal: 12, vertical: 8 },
    ...overrides,
  }
}

export function darkTooltip(overrides = {}) {
  return { theme: 'dark', ...overrides }
}

export function whiteDataLabels(overrides = {}) {
  return {
    enabled: true,
    style: { colors: ['#ffffff'], fontSize: '13px', fontWeight: 'bold' },
    ...overrides,
  }
}

/**
 * Color según el umbral de consumo de recursos (CPU/Memoria/RAM)
 * @param pct
 * @param warn
 * @param danger
 * @returns {string}
 */
export function colorByThreshold(pct, { warn = 75, danger = 90 } = {}) {
  if (pct > danger) return '#ff4560'
  if (pct > warn) return '#feb019'
  return '#00e396'
}
