import DeleteButton from '@/components/ui/DeleteButton'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import StaffModel from '@/models/Staff'
import BranchModel from '@/models/Branch'
import PageHeader from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum } from '@/lib/utils'
import Link from 'next/link'

interface Props { searchParams: Promise<{ search?: string; branch?: string; designation?: string }> }

const DESIGNATIONS = ['driver', 'mechanic', 'operator', 'supervisor', 'other']

export default async function StaffPage({ searchParams }: Props) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const params = await searchParams
  await connectDB()

  const filter: Record<string, any> = { deleted_at: null }
  if (!isAdmin) filter.branch_id = session?.user?.branch_id
  if (params.search) filter.$or = [
    { full_name: new RegExp(params.search, 'i') },
    { staff_number: new RegExp(params.search, 'i') },
  ]
  if (params.branch) filter.branch_id = params.branch
  if (params.designation) filter.designation = params.designation

  const [staff, branches] = await Promise.all([
    StaffModel.find(filter).populate('branch_id', 'name').sort({ full_name: 1 }).lean(),
    BranchModel.find({ is_active: true }).lean(),
  ])

  const canManage = ['admin', 'fleet_officer', 'branch_manager'].includes(session?.user?.role ?? '')

  return (
    <div className="p-6">
      <PageHeader title="Staff" description={`${staff.length} member(s)`} action={canManage ? { href: '/staff/new', label: '+ Add Staff' } : undefined} />

      <form className="flex flex-wrap gap-2 mb-5">
        <input name="search" defaultValue={params.search} placeholder="Search name, staff number…"
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <select name="designation" defaultValue={params.designation ?? ''} title="Filter by designation"
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          <option value="">All Designations</option>
          {DESIGNATIONS.map(d => <option key={d} value={d}>{displayEnum(d)}</option>)}
        </select>
        {isAdmin && (
          <select name="branch" defaultValue={params.branch ?? ''} title="Filter by branch"
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
            <option value="">All Branches</option>
            {(branches as any[]).map(b => <option key={b._id.toString()} value={b._id.toString()}>{b.name}</option>)}
          </select>
        )}
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Filter</button>
        <Link href="/staff" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">Clear</Link>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              {['Staff No.', 'Name', 'Designation', 'Branch', 'Phone', 'License Expiry', 'Status', 'Actions', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(staff as any[]).length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-600">No staff found</td></tr>
            )}
            {(staff as any[]).map(s => {
              const licenseExpired = s.license_expiry && new Date(s.license_expiry) < new Date()
              return (
                <tr key={s._id.toString()} className="hover:bg-gray-800/50 transition">
                  <td className="px-4 py-3 font-medium text-white">{s.staff_number}</td>
                  <td className="px-4 py-3 text-gray-300">{s.full_name}</td>
                  <td className="px-4 py-3 text-gray-400">{displayEnum(s.designation)}</td>
                  <td className="px-4 py-3 text-gray-400">{(s.branch_id as any)?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{s.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    {s.license_expiry ? (
                      <span className={licenseExpired ? 'text-red-400' : 'text-gray-400'}>
                        {new Date(s.license_expiry).toLocaleDateString()}
                        {licenseExpired && ' (Expired)'}
                      </span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={s.is_active ? 'active' : 'decommissioned'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/staff/${s._id}`} className="text-orange-400 hover:text-orange-300 text-xs">View</Link>
                      {canManage && <Link href={`/staff/${s._id}/edit`} className="text-gray-400 hover:text-white text-xs">Edit</Link>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && <DeleteButton id={s._id.toString()} type="staff" label={s.full_name} />}
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
