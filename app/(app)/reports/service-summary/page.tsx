import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import ServiceRecordModel from '@/models/ServiceRecord'
import PageHeader from '@/components/ui/PageHeader'
import { displayEnum, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Props { searchParams: Promise<{ from_date?: string; to_date?: string }> }

export default async function ServiceSummaryPage({ searchParams }: Props) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const params = await searchParams
  await connectDB()

  const filter: Record<string, any> = { deleted_at: null }
  if (!isAdmin) filter.branch_id = session?.user?.branch_id
  if (params.from_date || params.to_date) {
    filter.service_date = {}
    if (params.from_date) filter.service_date.$gte = new Date(params.from_date)
    if (params.to_date) filter.service_date.$lte = new Date(params.to_date)
  }

  const records = await ServiceRecordModel.find(filter)
    .populate('vehicle_id', 'registration_number')
    .populate('branch_id', 'name')
    .sort({ service_date: -1 })
    .lean()

  const totalCost = (records as any[]).reduce((s, r) => s + (r.total_cost ?? 0), 0)

  // By status
  const byStatus: Record<string, number> = {}
  for (const r of records as any[]) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
  }

  // By service type
  const byType: Record<string, { count: number; cost: number }> = {}
  for (const r of records as any[]) {
    if (!byType[r.service_type]) byType[r.service_type] = { count: 0, cost: 0 }
    byType[r.service_type].count++
    byType[r.service_type].cost += r.total_cost ?? 0
  }

  const csvParams = new URLSearchParams()
  if (params.from_date) csvParams.set('from_date', params.from_date)
  if (params.to_date) csvParams.set('to_date', params.to_date)
  csvParams.set('export', 'csv')
  const csvUrl = `/api/reports/service-summary?${csvParams.toString()}`

  const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-400',
    in_progress: 'text-blue-400',
    completed: 'text-green-400',
    cancelled: 'text-red-400',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Service Summary Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {params.from_date || params.to_date
              ? `${params.from_date ?? 'Start'} to ${params.to_date ?? 'Today'}`
              : 'All time'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">← Reports</Link>
          <a href={csvUrl} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">Export CSV</a>
        </div>
      </div>

      <form className="flex flex-wrap gap-2">
        <input type="date" name="from_date" defaultValue={params.from_date ?? ''} title="From date" placeholder="From date"
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <input type="date" name="to_date" defaultValue={params.to_date ?? ''} title="To date" placeholder="To date"
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Apply</button>
        <Link href="/reports/service-summary" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">Clear</Link>
      </form>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-white">{records.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalCost)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Avg Cost per Record</p>
          <p className="text-2xl font-bold text-blue-400">{records.length > 0 ? formatCurrency(totalCost / records.length) : '₦0.00'}</p>
        </div>
      </div>

      {/* By Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Records by Status</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Count</th>
              <th className="px-4 py-3 text-left font-medium">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {Object.entries(byStatus).sort(([, a], [, b]) => b - a).map(([status, count]) => (
              <tr key={status} className="hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <span className={`font-medium ${STATUS_COLORS[status] ?? 'text-gray-400'}`}>{displayEnum(status)}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{count}</td>
                <td className="px-4 py-3 text-gray-400">{records.length > 0 ? ((count / records.length) * 100).toFixed(1) : '0'}%</td>
              </tr>
            ))}
            {Object.keys(byStatus).length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-600">No records in this period</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* By Service Type */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Records by Service Type</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
              <th className="px-4 py-3 text-left font-medium">Service Type</th>
              <th className="px-4 py-3 text-left font-medium">Count</th>
              <th className="px-4 py-3 text-left font-medium">Total Cost</th>
              <th className="px-4 py-3 text-left font-medium">Avg Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {Object.entries(byType).sort(([, a], [, b]) => b.cost - a.cost).map(([type, data]) => (
              <tr key={type} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-300">{displayEnum(type)}</td>
                <td className="px-4 py-3 text-gray-400">{data.count}</td>
                <td className="px-4 py-3 text-gray-400">{formatCurrency(data.cost)}</td>
                <td className="px-4 py-3 text-gray-400">{data.count > 0 ? formatCurrency(data.cost / data.count) : '—'}</td>
              </tr>
            ))}
            {Object.keys(byType).length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-600">No records in this period</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
