import { connectDB } from '@/lib/db'
import ServiceRecordModel from '@/models/ServiceRecord'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import DeleteButton from '@/components/ui/DeleteButton'
import ApproveButton from '@/components/ui/ApproveButton'

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const record = await ServiceRecordModel.findOne({ _id: id, deleted_at: null })
    .populate('vehicle_id', 'registration_number make model')
    .populate('branch_id', 'name')
    .populate('created_by', 'name')
    .populate('approved_by', 'name')
    .lean()
  if (!record) notFound()

  const session = await auth()
  const canManage = ['admin', 'fleet_officer'].includes(session?.user?.role ?? '')
  const r = record as any

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">{r.reference_number}</h1>
            <StatusBadge status={r.status} />
          </div>
          <p className="text-gray-400">{displayEnum(r.service_type)} · {(r.vehicle_id as any)?.registration_number}</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/servicing/${id}/edit`} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">Edit</Link>
            {!r.approved_by && <ApproveButton id={id} />}
            <DeleteButton id={id} type="servicing" redirectTo="/servicing" />
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        {[
          ['Vehicle', (r.vehicle_id as any)?.registration_number],
          ['Branch',  (r.branch_id as any)?.name ?? '—'],
          ['Service Date', new Date(r.service_date).toLocaleDateString()],
          ['Completion Date', r.completion_date ? new Date(r.completion_date).toLocaleDateString() : '—'],
          ['Mileage at Service', r.mileage_at_service ? `${r.mileage_at_service.toLocaleString()} km` : '—'],
          ['Next Service Mileage', r.next_service_mileage ? `${r.next_service_mileage.toLocaleString()} km` : '—'],
          ['Mechanic', r.mechanic_name ?? '—'],
          ['Workshop', r.workshop ?? '—'],
          ['Labour Cost', formatCurrency(r.labour_cost ?? 0)],
          ['Parts Cost', formatCurrency(r.parts_cost ?? 0)],
          ['Total Cost', formatCurrency(r.total_cost ?? 0)],
          ['Created By', (r.created_by as any)?.name ?? '—'],
          ['Approved By', r.approved_by ? (r.approved_by as any)?.name : 'Pending'],
        ].map(([k, v]) => (
          <div key={k}><p className="text-xs text-gray-500 mb-0.5">{k}</p><p className="text-white font-medium">{v}</p></div>
        ))}
      </div>

      {r.description && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-2">Description</p>
          <p className="text-gray-300 text-sm">{r.description}</p>
        </div>
      )}

      {r.parts_replaced && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-2">Parts Replaced</p>
          <p className="text-gray-300 text-sm">{r.parts_replaced}</p>
        </div>
      )}
    </div>
  )
}
