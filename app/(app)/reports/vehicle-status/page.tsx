import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum } from '@/lib/utils'
import Link from 'next/link'

export default async function VehicleStatusReportPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  await connectDB()

  const filter: Record<string, any> = { deleted_at: null }
  if (!isAdmin) filter.branch_id = session?.user?.branch_id

  const vehicles = await VehicleModel.find(filter)
    .populate('branch_id', 'name')
    .sort({ registration_number: 1 })
    .lean()

  const now = new Date()
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const csvUrl = '/api/reports/vehicle-status?export=csv'

  function expiryClass(date: any) {
    if (!date) return 'text-gray-600'
    const d = new Date(date)
    if (d < now) return 'text-red-400'
    if (d < soon) return 'text-yellow-400'
    return 'text-gray-400'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Vehicle Status Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">{(vehicles as any[]).length} vehicle(s)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">← Reports</Link>
          <a href={csvUrl} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">Export CSV</a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['active', 'in_service', 'breakdown', 'decommissioned'] as const).map(status => {
          const count = (vehicles as any[]).filter(v => v.status === status).length
          return (
            <div key={status} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{displayEnum(status)}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              {['Reg No.', 'Make / Model', 'Type', 'Status', 'Branch', 'Mileage', 'Last Service', 'Insurance Expiry', 'Road Worthiness'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(vehicles as any[]).length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-600">No vehicles found</td></tr>
            )}
            {(vehicles as any[]).map(v => (
              <tr key={v._id.toString()} className="hover:bg-gray-800/50 transition">
                <td className="px-4 py-3">
                  <Link href={`/vehicles/${v._id}`} className="text-orange-400 hover:text-orange-300 font-medium">{v.registration_number}</Link>
                </td>
                <td className="px-4 py-3 text-gray-300">{v.make} {v.model}{v.year ? ` (${v.year})` : ''}</td>
                <td className="px-4 py-3 text-gray-400">{displayEnum(v.type)}</td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3 text-gray-400">{(v.branch_id as any)?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">{(v.current_mileage ?? 0).toLocaleString()} km</td>
                <td className="px-4 py-3 text-gray-400">{v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : '—'}</td>
                <td className={`px-4 py-3 ${expiryClass(v.insurance_expiry)}`}>
                  {v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString() : '—'}
                </td>
                <td className={`px-4 py-3 ${expiryClass(v.road_worthiness_expiry)}`}>
                  {v.road_worthiness_expiry ? new Date(v.road_worthiness_expiry).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-600">Red = expired · Yellow = expiring within 30 days</p>
    </div>
  )
}
