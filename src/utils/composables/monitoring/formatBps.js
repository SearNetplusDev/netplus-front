export function formatBps(bps) {
  const value = Number(bps)

  if (bps === null || bps === undefined || Number.isNaN(value)) {
    return '-'
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} Gbps`
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} Mbps`
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)} Kbps`
  }

  return `${value.toFixed(0)} bps`
}
