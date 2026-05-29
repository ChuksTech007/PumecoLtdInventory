import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import BranchModel from '@/models/Branch'
import PageHeader from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum } from '@/lib/utils'
import Link from 'next/link'
import type { IBranch, IVehicle } from '@/types'

interface Props { searchParams: Promise<{ search?: string; status?: string; type?: string; branch?: string }> }

export default async function VehiclesPage({ searchParams }: Props) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const params = await searchParams
  await connectDB()

  const filter: Record<string, any> = { deleted_at: null }
  if (!isAdmin) filter.branch_id = session?.user?.branch_id
  if (params.search) filter.$or = [
    { registration_number: new RegExp(params.search, 'i') },
    { make: new RegExp(params.search, 'i') },
    { model: new RegExp(params.search, 'i') },
    { fleet_number: new RegExp(params.search, 'i') },
  ]
  if (params.status) filter.status = params.status
  if (params.type) filter.type = params.type
  if (params.branch) filter.branch_id = params.branch

  const [vehicles, branches] = await Promise.all([
    VehicleModel.find(filter).populate('branch_id', 'name').populate('assigned_driver_id', 'name').sort({ createdAt: -1 }).lean(),
    BranchModel.find({ is_active: true }).lean(),
  ])

  const canManage = ['admin', 'fleet_officer'].includes(session?.user?.role ?? '')

  return (
    <div className="p-6">
      <PageHeader title="Vehicles" description={`${vehicles.length} vehicle(s)`} action={canManage ? { href: '/vehicles/new', label: '+ Add Vehicle' } : undefined} />

      {/* Filters */}
      <form className="flex flex-wrap gap-2 mb-5">
        <input name="search" defaultValue={params.search} placeholder="Search reg, make, model…"
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <select name="status" defaultValue={params.status ?? ''}
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          <option value="">All Statuses</option>
          {['active','in_service','breakdown','decommissioned'].map(s => <option key={s} value={s}>{displayEnum(s)}</option>)}
        </select>
        {isAdmin && (
          <select name="branch" defaultValue={params.branch ?? ''}
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
            <option value="">All Branches</option>
            {(branches as any[]).map(b => <option key={b._id.toString()} value={b._id.toString()}>{b.name}</option>)}
          </select>
        )}
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Filter</button>
        <Link href="/vehicles" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">Clear</Link>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              {['Reg. No.','Make / Model','Type','Status','Branch','Mileage (km)','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(vehicles as any[]).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No vehicles found</td></tr>
            )}
            {(vehicles as any[]).map(v => (
              <tr key={v._id.toString()} className="hover:bg-gray-800/50 transition">
                <td className="px-4 py-3 font-medium text-white">{v.registration_number}</td>
                <td className="px-4 py-3 text-gray-300">{v.make} {v.model} {v.year ? `(${v.year})` : ''}</td>
                <td className="px-4 py-3 text-gray-400">{displayEnum(v.type)}</td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3 text-gray-400">{(v.branch_id as any)?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">{v.current_mileage?.toLocaleString() ?? '0'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/vehicles/${v._id}`} className="text-orange-400 hover:text-orange-300 text-xs">View</Link>
                    {canManage && <Link href={`/vehicles/${v._id}/edit`} className="text-gray-400 hover:text-white text-xs">Edit</Link>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
