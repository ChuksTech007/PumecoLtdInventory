import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import FuelTankModel from '@/models/FuelTank'
import BranchModel from '@/models/Branch'
import PageHeader from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum } from '@/lib/utils'
import Link from 'next/link'

interface Props { searchParams: Promise<{ branch?: string; fuel_type?: string; is_active?: string }> }

export default async function FuelTanksPage({ searchParams }: Props) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const params = await searchParams
  await connectDB()

  const filter: Record<string, any> = {}
  if (!isAdmin) filter.branch_id = session?.user?.branch_id
  if (params.branch) filter.branch_id = params.branch
  if (params.fuel_type) filter.fuel_type = params.fuel_type
  if (params.is_active !== undefined && params.is_active !== '') filter.is_active = params.is_active === 'true'

  const [tanks, branches] = await Promise.all([
    FuelTankModel.find(filter).populate('branch_id', 'name').sort({ createdAt: -1 }).lean(),
    BranchModel.find({ is_active: true }).lean(),
  ])

  const canManage = ['admin', 'fuel_officer'].includes(session?.user?.role ?? '')

  return (
    <div className="p-6">
      <PageHeader title="Fuel Tanks" description={`${tanks.length} tank(s)`} action={canManage ? { href: '/fuel-tanks/new', label: '+ Add Tank' } : undefined} />

      <form className="flex flex-wrap gap-2 mb-5">
        <select name="fuel_type" defaultValue={params.fuel_type ?? ''} title="Filter by fuel type"
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          <option value="">All Fuel Types</option>
          {['diesel', 'petrol', 'kerosene'].map(f => <option key={f} value={f}>{displayEnum(f)}</option>)}
        </select>
        <select name="is_active" defaultValue={params.is_active ?? ''} title="Filter by status"
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {isAdmin && (
          <select name="branch" defaultValue={params.branch ?? ''} title="Filter by branch"
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
            <option value="">All Branches</option>
            {(branches as any[]).map(b => <option key={b._id.toString()} value={b._id.toString()}>{b.name}</option>)}
          </select>
        )}
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Filter</button>
        <Link href="/fuel-tanks" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">Clear</Link>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              {['Tank No.', 'Name', 'Fuel Type', 'Capacity', 'Level', 'Fill %', 'Branch', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(tanks as any[]).length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-600">No tanks found</td></tr>
            )}
            {(tanks as any[]).map(t => {
              const pct = t.capacity > 0 ? Math.round((t.current_level / t.capacity) * 100) : 0
              const isLow = t.current_level <= t.minimum_level
              return (
                <tr key={t._id.toString()} className={`hover:bg-gray-800/50 transition ${isLow ? 'bg-red-500/5' : ''}`}>
                  <td className="px-4 py-3 font-medium text-white">{t.tank_number}</td>
                  <td className="px-4 py-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      {t.name}
                      {isLow && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Low</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{displayEnum(t.fuel_type)}</td>
                  <td className="px-4 py-3 text-gray-400">{t.capacity.toLocaleString()}L</td>
                  <td className="px-4 py-3 text-gray-400">{t.current_level.toLocaleString()}L</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct <= 20 ? 'bg-red-500' : pct <= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-xs ${pct <= 20 ? 'text-red-400' : pct <= 50 ? 'text-yellow-400' : 'text-green-400'}`}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{(t.branch_id as any)?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.is_active ? 'active' : 'decommissioned'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/fuel-tanks/${t._id}`} className="text-orange-400 hover:text-orange-300 text-xs">View</Link>
                      {canManage && <Link href={`/fuel-tanks/${t._id}/edit`} className="text-gray-400 hover:text-white text-xs">Edit</Link>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
