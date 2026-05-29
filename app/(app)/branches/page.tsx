import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import BranchModel from '@/models/Branch'
import PageHeader from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import Link from 'next/link'

export default async function BranchesPage() {
  const session = await auth()
  const canManage = ['admin', 'branch_manager'].includes(session?.user?.role ?? '')
  await connectDB()

  const branches = await BranchModel.find({}).sort({ name: 1 }).lean()

  return (
    <div className="p-6">
      <PageHeader title="Branches" description={`${branches.length} branch(es)`} action={session?.user?.role === 'admin' ? { href: '/branches/new', label: '+ Add Branch' } : undefined} />

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              {['Code', 'Name', 'Location', 'State', 'Manager', 'Phone', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(branches as any[]).length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-600">No branches found</td></tr>
            )}
            {(branches as any[]).map(b => (
              <tr key={b._id.toString()} className="hover:bg-gray-800/50 transition">
                <td className="px-4 py-3 font-mono text-orange-400 text-xs">{b.code}</td>
                <td className="px-4 py-3 font-medium text-white">{b.name}</td>
                <td className="px-4 py-3 text-gray-400">{b.location}</td>
                <td className="px-4 py-3 text-gray-400">{b.state ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">{b.manager_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">{b.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.is_active ? 'active' : 'decommissioned'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/branches/${b._id}`} className="text-orange-400 hover:text-orange-300 text-xs">View</Link>
                    {canManage && <Link href={`/branches/${b._id}/edit`} className="text-gray-400 hover:text-white text-xs">Edit</Link>}
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
