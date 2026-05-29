import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import ActivityLogModel from '@/models/ActivityLog'
import PageHeader from '@/components/ui/PageHeader'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface Props { searchParams: Promise<{ action?: string; model_type?: string; page?: string }> }

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/20 text-green-400',
  update: 'bg-blue-500/20 text-blue-400',
  delete: 'bg-red-500/20 text-red-400',
  approve: 'bg-purple-500/20 text-purple-400',
}

const PAGE_SIZE = 30

const MODEL_TYPES = ['Vehicle', 'FuelTank', 'FuelReceipt', 'FuelDispensing', 'ServiceRecord', 'Branch', 'Staff']

export default async function ActivityLogPage({ searchParams }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/')

  const params = await searchParams
  await connectDB()

  const page = Math.max(1, parseInt(params.page ?? '1'))
  const filter: Record<string, any> = {}
  if (params.action) filter.action = params.action
  if (params.model_type) filter.model_type = params.model_type

  const [logs, total] = await Promise.all([
    ActivityLogModel.find(filter)
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    ActivityLogModel.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (params.action) p.set('action', params.action)
    if (params.model_type) p.set('model_type', params.model_type)
    if (params.page) p.set('page', params.page)
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    return `/activity-log?${p.toString()}`
  }

  return (
    <div className="p-6">
      <PageHeader title="Activity Log" description={`${total} event(s)`} />

      <form className="flex flex-wrap gap-2 mb-5">
        <select name="action" defaultValue={params.action ?? ''} title="Filter by action"
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          <option value="">All Actions</option>
          {['create', 'update', 'delete', 'approve'].map(a => (
            <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
          ))}
        </select>
        <select name="model_type" defaultValue={params.model_type ?? ''} title="Filter by model type"
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
          <option value="">All Types</option>
          {MODEL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Filter</button>
        <Link href="/activity-log" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">Clear</Link>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto mb-4">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              {['Time', 'User', 'Action', 'Type', 'Description'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(logs as any[]).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600">No activity found</td></tr>
            )}
            {(logs as any[]).map(log => (
              <tr key={log._id.toString()} className="hover:bg-gray-800/50 transition">
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {(log.user_id as any)?.name ?? <span className="text-gray-600">System</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_COLORS[log.action] ?? 'bg-gray-500/20 text-gray-400'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{log.model_type}</td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-md truncate">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-1 ml-auto">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-3 py-1.5 rounded-lg transition">
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-3 py-1.5 rounded-lg transition">
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
