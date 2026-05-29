import { connectDB } from '@/lib/db'
import StaffModel from '@/models/Staff'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum } from '@/lib/utils'
import Link from 'next/link'
import DeleteButton from '@/components/ui/DeleteButton'

export default async function StaffMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const member = await StaffModel.findOne({ _id: id, deleted_at: null })
    .populate('branch_id', 'name')
    .lean()
  if (!member) notFound()

  const session = await auth()
  const canManage = ['admin', 'fleet_officer', 'branch_manager'].includes(session?.user?.role ?? '')
  const s = member as any

  const licenseExpired = s.license_expiry && new Date(s.license_expiry) < new Date()

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">{s.full_name}</h1>
            <StatusBadge status={s.is_active ? 'active' : 'decommissioned'} />
          </div>
          <p className="text-gray-400">{s.staff_number} · {displayEnum(s.designation)} · {(s.branch_id as any)?.name ?? 'No Branch'}</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/staff/${id}/edit`} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">Edit</Link>
            <DeleteButton id={id} type="staff" redirectTo="/staff" />
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
        {[
          ['Staff Number', s.staff_number],
          ['Full Name', s.full_name],
          ['Designation', displayEnum(s.designation)],
          ['Branch', (s.branch_id as any)?.name ?? '—'],
          ['Phone', s.phone ?? '—'],
          ['Email', s.email ?? '—'],
          ['Hire Date', s.hire_date ? new Date(s.hire_date).toLocaleDateString() : '—'],
          ['Status', s.is_active ? 'Active' : 'Inactive'],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-gray-500 mb-0.5">{k}</p>
            <p className="text-white font-medium">{v}</p>
          </div>
        ))}
      </div>

      {/* License Info */}
      {(s.license_number || s.license_class || s.license_expiry) && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">License Information</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              ['License Number', s.license_number ?? '—'],
              ['License Class', s.license_class ?? '—'],
              ['License Expiry', s.license_expiry
                ? <span className={licenseExpired ? 'text-red-400 font-medium' : 'text-white font-medium'}>
                    {new Date(s.license_expiry).toLocaleDateString()}{licenseExpired ? ' (Expired)' : ''}
                  </span>
                : '—'
              ],
            ].map(([k, v]) => (
              <div key={k as string}>
                <p className="text-xs text-gray-500 mb-0.5">{k as string}</p>
                <div className="text-white font-medium">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {(s.emergency_contact || s.emergency_phone) && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><p className="text-xs text-gray-500 mb-0.5">Name</p><p className="text-white font-medium">{s.emergency_contact ?? '—'}</p></div>
            <div><p className="text-xs text-gray-500 mb-0.5">Phone</p><p className="text-white font-medium">{s.emergency_phone ?? '—'}</p></div>
          </div>
        </div>
      )}

      {s.notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-2">Notes</p>
          <p className="text-gray-300 text-sm">{s.notes}</p>
        </div>
      )}
    </div>
  )
}
