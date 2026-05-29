import { connectDB } from '@/lib/db'
import BranchModel from '@/models/Branch'
import VehicleModel from '@/models/Vehicle'
import StaffModel from '@/models/Staff'
import FuelTankModel from '@/models/FuelTank'
import UserModel from '@/models/User'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/ui/Badge'
import Link from 'next/link'
import DeleteButton from '@/components/ui/DeleteButton'

export default async function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const branch = await BranchModel.findById(id).lean()
  if (!branch) notFound()

  const session = await auth()
  const canManage = ['admin', 'branch_manager'].includes(session?.user?.role ?? '')
  const b = branch as any

  const [vehicleCount, staffCount, tankCount, userCount] = await Promise.all([
    VehicleModel.countDocuments({ branch_id: id, deleted_at: null }),
    StaffModel.countDocuments({ branch_id: id, deleted_at: null }),
    FuelTankModel.countDocuments({ branch_id: id }),
    UserModel.countDocuments({ branch_id: id, is_active: true }),
  ])

  const stats = [
    ['Vehicles', vehicleCount, '/vehicles'],
    ['Staff', staffCount, '/staff'],
    ['Fuel Tanks', tankCount, '/fuel-tanks'],
    ['Users', userCount, '/users'],
  ]

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">{b.name}</h1>
            <span className="text-xs font-mono bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">{b.code}</span>
            <StatusBadge status={b.is_active ? 'active' : 'decommissioned'} />
          </div>
          <p className="text-gray-400">{b.location}{b.state ? `, ${b.state}` : ''}</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/branches/${id}/edit`} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">Edit</Link>
            {session?.user?.role === 'admin' && <DeleteButton id={id} type="branch" redirectTo="/branches" />}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(([label, count, href]) => (
          <Link key={label as string} href={`${href}?branch=${id}`} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
            <p className="text-2xl font-bold text-white mb-1">{count as number}</p>
            <p className="text-xs text-gray-500">{label as string}</p>
          </Link>
        ))}
      </div>

      {/* Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
        {[
          ['Branch Name', b.name],
          ['Branch Code', b.code],
          ['Location', b.location],
          ['State', b.state ?? '—'],
          ['Address', b.address ?? '—'],
          ['Manager', b.manager_name ?? '—'],
          ['Phone', b.phone ?? '—'],
          ['Email', b.email ?? '—'],
          ['Status', b.is_active ? 'Active' : 'Inactive'],
          ['Created', new Date(b.createdAt).toLocaleDateString()],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-gray-500 mb-0.5">{k}</p>
            <p className="text-white font-medium">{v}</p>
          </div>
        ))}
      </div>

      {b.notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-2">Notes</p>
          <p className="text-gray-300 text-sm">{b.notes}</p>
        </div>
      )}
    </div>
  )
}
