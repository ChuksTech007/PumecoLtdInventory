export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function generateRef(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export function formatNumber(n: number, decimals = 2) {
  return n.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function formatCurrency(n: number) {
  return '₦' + formatNumber(n)
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    in_service: 'bg-yellow-500/20 text-yellow-400',
    breakdown: 'bg-red-500/20 text-red-400',
    decommissioned: 'bg-gray-500/20 text-gray-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }
  return map[status] ?? 'bg-gray-500/20 text-gray-400'
}

export function displayEnum(val: string) {
  return val ? val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''
}
