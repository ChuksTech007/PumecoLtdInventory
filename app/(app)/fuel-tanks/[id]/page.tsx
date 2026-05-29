import { connectDB } from '@/lib/db'
import FuelTankModel from '@/models/FuelTank'
import FuelReceiptModel from '@/models/FuelReceipt'
import FuelDispensingModel from '@/models/FuelDispensing'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum, formatNumber } from '@/lib/utils'
import Link from 'next/link'
import DeleteButton from '@/components/ui/DeleteButton'

export default async function FuelTankPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const tank = await FuelTankModel.findById(id).populate('branch_id', 'name').lean()
  if (!tank) notFound()

  const session = await auth()
  const canManage = ['admin', 'fuel_officer'].includes(session?.user?.role ?? '')
  const t = tank as any

  const [receipts, dispensings] = await Promise.all([
    FuelReceiptModel.find({ fuel_tank_id: id }).sort({ receipt_date: -1 }).limit(20).lean(),
    FuelDispensingModel.find({ fuel_tank_id: id }).sort({ dispensing_date: -1 }).limit(20).lean(),
  ])

  const pct = t.capacity > 0 ? Math.round((t.current_level / t.capacity) * 100) : 0
  const isLow = t.current_level <= t.minimum_level

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">{t.name}</h1>
            <StatusBadge status={t.is_active ? 'active' : 'decommissioned'} />
            {isLow && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Low Level</span>}
          </div>
          <p className="text-gray-400">{t.tank_number} · {displayEnum(t.fuel_type)} · {(t.branch_id as any)?.name ?? '—'}</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/fuel-tanks/${id}/edit`} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">Edit</Link>
            <DeleteButton id={id} type="fuel-tank" redirectTo="/fuel-tanks" />
          </div>
        )}
      </div>

      {/* Tank Level Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Current Level</h2>
          <span className={`text-lg font-bold ${pct <= 20 ? 'text-red-400' : pct <= 50 ? 'text-yellow-400' : 'text-green-400'}`}>{pct}%</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all ${pct <= 20 ? 'bg-red-500' : pct <= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatNumber(t.current_level)}L current</span>
          <span>Min: {formatNumber(t.minimum_level)}L</span>
          <span>{formatNumber(t.capacity)}L capacity</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Tank Number', t.tank_number],
          ['Fuel Type', displayEnum(t.fuel_type)],
          ['Branch', (t.branch_id as any)?.name ?? '—'],
          ['Status', t.is_active ? 'Active' : 'Inactive'],
          ['Capacity', `${formatNumber(t.capacity)}L`],
          ['Current Level', `${formatNumber(t.current_level)}L`],
          ['Minimum Level', `${formatNumber(t.minimum_level)}L`],
          ['Available Space', `${formatNumber(t.capacity - t.current_level)}L`],
        ].map(([k, v]) => (
          <div key={k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-sm font-medium text-white">{v}</p>
          </div>
        ))}
      </div>

      {t.notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-2">Notes</p>
          <p className="text-gray-300 text-sm">{t.notes}</p>
        </div>
      )}

      {/* Receipts */}
      <Section title="Fuel Receipts" count={receipts.length} action={canManage ? `/fuel-receipts/new` : undefined} actionLabel="+ New Receipt">
        <Table headers={['Reference', 'Date', 'Qty Received (L)', 'Price/L', 'Level Before', 'Level After']}>
          {(receipts as any[]).map(r => (
            <tr key={r._id.toString()} className="hover:bg-gray-800/50">
              <td className="px-4 py-3"><Link href={`/fuel-receipts/${r._id}`} className="text-orange-400 hover:text-orange-300">{r.reference_number}</Link></td>
              <td className="px-4 py-3 text-gray-400">{new Date(r.receipt_date).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-gray-300">{formatNumber(r.quantity_received)}</td>
              <td className="px-4 py-3 text-gray-400">{r.price_per_litre ? `₦${formatNumber(r.price_per_litre)}` : '—'}</td>
              <td className="px-4 py-3 text-gray-400">{r.tank_level_before != null ? `${formatNumber(r.tank_level_before)}L` : '—'}</td>
              <td className="px-4 py-3 text-gray-400">{r.tank_level_after != null ? `${formatNumber(r.tank_level_after)}L` : '—'}</td>
            </tr>
          ))}
          {receipts.length === 0 && <EmptyRow cols={6} />}
        </Table>
      </Section>

      {/* Dispensings */}
      <Section title="Fuel Dispensings" count={dispensings.length} action={canManage ? `/fuel-dispensings/new` : undefined} actionLabel="+ New Dispensing">
        <Table headers={['Reference', 'Date', 'Qty Dispensed (L)', 'Purpose', 'Level Before', 'Level After']}>
          {(dispensings as any[]).map(d => (
            <tr key={d._id.toString()} className="hover:bg-gray-800/50">
              <td className="px-4 py-3"><Link href={`/fuel-dispensings/${d._id}`} className="text-orange-400 hover:text-orange-300">{d.reference_number}</Link></td>
              <td className="px-4 py-3 text-gray-400">{new Date(d.dispensing_date).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-gray-300">{formatNumber(d.quantity_dispensed)}</td>
              <td className="px-4 py-3 text-gray-400">{displayEnum(d.purpose)}</td>
              <td className="px-4 py-3 text-gray-400">{d.tank_level_before != null ? `${formatNumber(d.tank_level_before)}L` : '—'}</td>
              <td className="px-4 py-3 text-gray-400">{d.tank_level_after != null ? `${formatNumber(d.tank_level_after)}L` : '—'}</td>
            </tr>
          ))}
          {dispensings.length === 0 && <EmptyRow cols={6} />}
        </Table>
      </Section>
    </div>
  )
}

function Section({ title, count, action, actionLabel, children }: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white">{title} <span className="text-gray-600 font-normal">({count})</span></h2>
        {action && <Link href={action} className="text-orange-400 hover:text-orange-300 text-xs">{actionLabel}</Link>}
      </div>
      {children}
    </div>
  )
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
          {headers.map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800">{children}</tbody>
    </table>
  )
}

function EmptyRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} className="px-4 py-6 text-center text-gray-600 text-sm">No records</td></tr>
}
