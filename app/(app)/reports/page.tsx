import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'

const REPORTS = [
  {
    href: '/reports/fuel-summary',
    title: 'Fuel Summary Report',
    description: 'View total fuel received and dispensed by date range. Breakdown by purpose and vehicle with CSV export.',
    icon: '⛽',
  },
  {
    href: '/reports/service-summary',
    title: 'Service Summary Report',
    description: 'Analyse service record costs and counts by status and service type. Includes CSV export.',
    icon: '🔧',
  },
  {
    href: '/reports/vehicle-status',
    title: 'Vehicle Status Report',
    description: 'Complete vehicle list with status, current mileage, insurance and road worthiness expiry dates, and last service details.',
    icon: '🚗',
  },
]

export default function ReportsPage() {
  return (
    <div className="p-6">
      <PageHeader title="Reports" description="Generate and export operational reports" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REPORTS.map(r => (
          <Link key={r.href} href={r.href}
            className="bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-xl p-6 transition group">
            <div className="text-3xl mb-4">{r.icon}</div>
            <h2 className="text-base font-semibold text-white mb-2 group-hover:text-orange-400 transition">{r.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{r.description}</p>
            <div className="mt-4 text-xs text-orange-400 group-hover:text-orange-300 transition">View Report →</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
