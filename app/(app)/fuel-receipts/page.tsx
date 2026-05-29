import DeleteButton from '@/components/ui/DeleteButton'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import FuelReceiptModel from '@/models/FuelReceipt'
import BranchModel from '@/models/Branch'
import PageHeader from '@/components/ui/PageHeader'
import { formatNumber, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Props { searchParams: Promise<{ branch?: string; from_date?: string; to_date?: string }> }

export default async function FuelReceiptsPage({ searchParams }: Props) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const params = await searchParams
  await connectDB()

  const filter: Record<string, any> = {}
  if (!isAdmin) filter.branch_id = session?.user?.branch_id
  if (params.branch) filter.branch_id = params.branch
  if (params.from_date || params.to_date) {
    filter.receipt_date = {}
    if (params.from_date) filter.receipt_date.$gte = new Date(params.from_date)
    if (params.to_date) filter.receipt_date.$lte = new Date(params.to_date)
  }

  const [receipts, branches] = await Promise.all([
    FuelReceiptModel.find(filter)
      .populate('fuel_tank_id', 'name tank_number')
      .populate('branch_id', 'name')
      .sort({ receipt_date: -1 })
      .lean(),
    BranchModel.find({ is_active: true }).lean(),
  ])

  const canManage = ['admin', 'fuel_officer'].includes(session?.user?.role ?? '')

  return (
    <div className="p-6">
      <PageHeader title="Fuel Receipts" description={`${receipts.length} receipt(s)`} action={canManage ? { href: '/fuel-receipts/new', label: '+ New Receipt' } : undefined} />

      <form className="flex flex-wrap gap-2 mb-5">
        <input type="date" name="from_date" defaultValue={params.from_date ?? ''} title="From date" placeholder="From date"
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <input type="date" name="to_date" defaultValue={params.to_date ?? ''} title="To date" placeholder="To date"
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        {isAdmin && (
          <select name="branch" defaultValue={params.branch ?? ''} title="Filter by branch"
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
            <option value="">All Branches</option>
            {(branches as any[]).map(b => <option key={b._id.toString()} value={b._id.toString()}>{b.name}</option>)}
          </select>
        )}
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Filter</button>
        <Link href="/fuel-receipts" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">Clear</Link>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              {['Reference', 'Date', 'Tank', 'Branch', 'Supplier', 'Qty Received (L)', 'Total Cost', '', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(receipts as any[]).length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-600">No receipts found</td></tr>
            )}
            {(receipts as any[]).map(r => (
              <tr key={r._id.toString()} className="hover:bg-gray-800/50 transition">
                <td className="px-4 py-3 font-medium text-white">{r.reference_number}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(r.receipt_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-300">{(r.fuel_tank_id as any)?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">{(r.branch_id as any)?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">{r.supplier_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-300">{formatNumber(r.quantity_received)}</td>
                <td className="px-4 py-3 text-gray-400">{r.total_cost ? formatCurrency(r.total_cost) : '—'}</td>
                <td className="px-4 py-3">
                  <Link href={`/fuel-receipts/${r._id}`} className="text-orange-400 hover:text-orange-300 text-xs">View</Link>
                </td>
                <td className="px-4 py-3">
                  {canManage && <DeleteButton id={r._id.toString()} type="fuel-receipt" label={r.reference_number} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
