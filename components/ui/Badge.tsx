import { cn } from '@/lib/utils'

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:          'bg-green-500/20 text-green-400',
    in_service:      'bg-yellow-500/20 text-yellow-400',
    breakdown:       'bg-red-500/20 text-red-400',
    decommissioned:  'bg-gray-500/20 text-gray-400',
    pending:         'bg-yellow-500/20 text-yellow-400',
    in_progress:     'bg-blue-500/20 text-blue-400',
    completed:       'bg-green-500/20 text-green-400',
    cancelled:       'bg-red-500/20 text-red-400',
    received:        'bg-green-500/20 text-green-400',
    dispensed:       'bg-orange-500/20 text-orange-400',
  }
  return (
    <Badge className={map[status] ?? 'bg-gray-500/20 text-gray-400'}>
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}
