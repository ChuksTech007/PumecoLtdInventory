import DeleteButton from '@/components/ui/DeleteButton'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import ServiceRecordModel from '@/models/ServiceRecord'
import BranchModel from '@/models/Branch'
import PageHeader from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Props { searchParams: Promise<{ status?: string; branch?: string; from_date?: string; to_date?: string }> }

export default async function ServicingPage({ searchParams }: Props) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const params = await searchParams
  await connectDB()

  const filter: Record<string, any> = { deleted_at: null }
  if (!isAdmin) filter.branch_id = session?.user?.branch_id
  if (params.status)    filter.status = params.status
  if (params.branch)    filter.branch_id = params.branch
  if (params.from_date || params.to_date) {
    filter.service_date = {}
    if (params.from_date) filter.service_date.$gte = new Date(params.from_date)
    if (params.to_date)   filter.service_date.$lte = new Date(params.to_date)
  }

  const [records, branches] = await Promise.all([
    ServiceRecordModel.find(filter).populate('vehicle_id', 'registration_number').populate('branch_id', 'name').sort({ service_date: -1 }).lean(),
    BranchModel.find({ is_active: true }).lean(),
  ])

  const canManage = ['admin', 'fleet_officer'].includes(session?.user?.role ?? '')

  return (
    <div className="p-6">
      <PageHeader title="Service Records" description={`${records.length} record(s)`} action={canManage ? { href: '/servicing/new', label: '+ New Record' } : undefined} />

      <form className="flex flex-wrap gap-2 mb-5">
        <select name="status" title="Filter by status" defaultValue={params.status ?? ''}
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          <option value="">All Statuses</option>
          {['pending','in_progress','completed','cancelled'].map(s => <option key={s} value={s}>{displayEnum(s)}</option>)}
        </select>
        <input type="date" name="from_date" title="From date" defaultValue={params.from_date ?? ''}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <input type="date" name="to_date" title="To date" defaultValue={params.to_date ?? ''}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Filter</button>
        <Link href="/servicing" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">Clear</Link>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
              {['Reference','Vehicle','Type','Status','Date','Cost','',''].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(records as any[]).length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No records found</td></tr>}
            {(records as any[]).map(r => (
              <tr key={r._id.toString()} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium text-white">{r.reference_number}</td>
                <td className="px-4 py-3 text-gray-300">{(r.vehicle_id as any)?.registration_number ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">{displayEnum(r.service_type)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-gray-400">{new Date(r.service_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-400">{formatCurrency(r.total_cost ?? 0)}</td>
                <td className="px-4 py-3">
                  <Link href={`/servicing/${r._id}`} className="text-orange-400 hover:text-orange-300 text-xs">View</Link>
                </td>
                <td className="px-4 py-3">
                  {canManage && <DeleteButton id={r._id.toString()} type="servicing" label={r.reference_number} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
