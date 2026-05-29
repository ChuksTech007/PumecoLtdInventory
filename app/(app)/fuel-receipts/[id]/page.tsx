import { connectDB } from '@/lib/db'
import FuelReceiptModel from '@/models/FuelReceipt'
import { notFound } from 'next/navigation'
import { formatNumber, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function FuelReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const receipt = await FuelReceiptModel.findById(id)
    .populate('fuel_tank_id', 'name tank_number fuel_type')
    .populate('branch_id', 'name')
    .populate('received_by', 'name')
    .lean()
  if (!receipt) notFound()
  const r = receipt as any

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{r.reference_number}</h1>
          <p className="text-gray-400">Fuel Receipt · {(r.fuel_tank_id as any)?.name ?? '—'}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/fuel-receipts" className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">
            ← Back
          </Link>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-lg px-4 py-3">
        Fuel receipts are immutable records. Contact an administrator for corrections.
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
        {[
          ['Reference Number', r.reference_number],
          ['Receipt Date', new Date(r.receipt_date).toLocaleDateString()],
          ['Fuel Tank', `${(r.fuel_tank_id as any)?.name} (${(r.fuel_tank_id as any)?.tank_number})`],
          ['Fuel Type', (r.fuel_tank_id as any)?.fuel_type ?? '—'],
          ['Branch', (r.branch_id as any)?.name ?? '—'],
          ['Received By', (r.received_by as any)?.name ?? '—'],
          ['Supplier Name', r.supplier_name ?? '—'],
          ['Waybill Number', r.waybill_number ?? '—'],
          ['Invoice Number', r.invoice_number ?? '—'],
          ['Quantity Ordered (L)', r.quantity_ordered ? formatNumber(r.quantity_ordered) : '—'],
          ['Quantity Received (L)', formatNumber(r.quantity_received)],
          ['Price per Litre', r.price_per_litre ? formatCurrency(r.price_per_litre) : '—'],
          ['Total Cost', r.total_cost ? formatCurrency(r.total_cost) : '—'],
          ['Tank Level Before', r.tank_level_before != null ? `${formatNumber(r.tank_level_before)}L` : '—'],
          ['Tank Level After', r.tank_level_after != null ? `${formatNumber(r.tank_level_after)}L` : '—'],
          ['Created At', new Date(r.createdAt).toLocaleString()],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-gray-500 mb-0.5">{k}</p>
            <p className="text-white font-medium">{v}</p>
          </div>
        ))}
      </div>

      {r.notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-2">Notes</p>
          <p className="text-gray-300 text-sm">{r.notes}</p>
        </div>
      )}
    </div>
  )
}
