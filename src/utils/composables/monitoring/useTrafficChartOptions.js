import { computed } from 'vue'
import { formatBps } from 'src/utils/composables/monitoring/formatBps.js'

/**
 * Opciones de ApexCharts para el gráfico de tráfico en tiempo real (rx/tx)
 * @param maxPoints
 * @param pollIntervalMs
 * @returns {ComputedRef<{chart: {id: string, type: string, background: string, foreColor: string, animations: {enabled: boolean, easing: string, dynamicAnimation: {speed: *}}, toolbar: {show: boolean}, zoom: {enabled: boolean}, parentHeightOffset: number}, colors: string[], fill: {type: string, gradient: {shadeIntensity: number, opacityFrom: number, opacityTo: number, stops: number[]}}, stroke: {curve: string, width: number}, dataLabels: {enabled: boolean}, markers: {size: number, hover: {size: number}}, grid: {borderColor: string, strokeDasharray: number, padding: {top: number, right: number, bottom: number, left: number}}, xaxis: {type: string, range, axisBorder: {show: boolean}, axisTick: {show: boolean}, labels: {dateTimeUTC: boolean, format: string, style: {colors: string, fontSize: string}}}, yaxis: {min: number, forceNumeric: boolean, labels: {minWidth: number, style: {colors: string, fontSize: string}, formatter: function(*): string|string}}, tooltip: {theme: string, shared: boolean, intersect: boolean, x: {format: string}, y: {formatter: function(*): string|string}, marker: {show: boolean}}, legend: {position: string, horizontalAlign: string, fontSize: string, labels: {colors: string}, markers: {size: number, shape: string}, itemMargin: {horizontal: number}}, responsive: [{breakpoint: number, options: {chart: {height: number}, legend: {position: string, horizontalAlign: string}, yaxis: {labels: {minWidth: number}}}}]}>}
 */
export function useTrafficChartOptions({ maxPoints, pollIntervalMs }) {
  return computed(() => ({
    chart: {
      id: 'realtime-traffic',
      type: 'area',
      background: 'transparent',
      foreColor: '#9e9e9e',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: { speed: pollIntervalMs },
      },
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
    },
    colors: ['#8bc34a', '#ff9800'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.03,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.08)',
      strokeDasharray: 4,
      padding: {
        top: 5,
        right: 10,
        bottom: 0,
        left: 10,
      },
    },
    xaxis: {
      type: 'datetime',
      range: (maxPoints - 1) * pollIntervalMs,
      axisBorder: { show: false },
      axisTick: { show: false },
      labels: {
        dateTimeUTC: false,
        format: 'HH:mm:ss',
        style: {
          colors: '#757575',
          fontSize: '11px',
        },
      },
    },
    yaxis: {
      min: 0,
      forceNumeric: true,
      labels: {
        minWidth: 65,
        style: {
          colors: '#9E9E9E',
          fontSize: '11px',
        },
        formatter: (value) => {
          return formatBps(value)
        },
      },
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      x: { format: 'HH:mm:ss' },
      y: {
        formatter: (value) => {
          return formatBps(value)
        },
      },
      marker: {
        show: true,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      labels: { colors: '#bdbdbd' },
      markers: { size: 6, shape: 'circle' },
      itemMargin: { horizontal: 8 },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 200,
          },
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
          },
          yaxis: {
            labels: {
              minWidth: 55,
            },
          },
        },
      },
    ],
  }))
}
