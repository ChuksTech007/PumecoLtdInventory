import { connectDB } from '@/lib/db'
import FuelDispensingModel from '@/models/FuelDispensing'
import { notFound } from 'next/navigation'
import { displayEnum, formatNumber } from '@/lib/utils'
import Link from 'next/link'

export default async function FuelDispensingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const dispensing = await FuelDispensingModel.findById(id)
    .populate('fuel_tank_id', 'name tank_number fuel_type')
    .populate('branch_id', 'name')
    .populate('vehicle_id', 'registration_number make model')
    .populate('driver_id', 'name')
    .populate('dispensed_by', 'name')
    .lean()
  if (!dispensing) notFound()
  const d = dispensing as any

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{d.reference_number}</h1>
          <p className="text-gray-400">Fuel Dispensing · {displayEnum(d.purpose)}</p>
        </div>
        <Link href="/fuel-dispensings" className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">
          ← Back
        </Link>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-lg px-4 py-3">
        Fuel dispensing records are immutable. Contact an administrator for corrections.
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
        {[
          ['Reference Number', d.reference_number],
          ['Dispensing Date', new Date(d.dispensing_date).toLocaleDateString()],
          ['Fuel Tank', `${(d.fuel_tank_id as any)?.name} (${(d.fuel_tank_id as any)?.tank_number})`],
          ['Fuel Type', (d.fuel_tank_id as any)?.fuel_type ? displayEnum((d.fuel_tank_id as any).fuel_type) : '—'],
          ['Branch', (d.branch_id as any)?.name ?? '—'],
          ['Purpose', displayEnum(d.purpose)],
          ['Vehicle', d.vehicle_id ? `${(d.vehicle_id as any)?.registration_number} — ${(d.vehicle_id as any)?.make} ${(d.vehicle_id as any)?.model}` : '—'],
          ['Driver', (d.driver_id as any)?.name ?? '—'],
          ['Dispensed By', (d.dispensed_by as any)?.name ?? '—'],
          ['Qty Requested (L)', d.quantity_requested ? formatNumber(d.quantity_requested) : '—'],
          ['Qty Dispensed (L)', formatNumber(d.quantity_dispensed)],
          ['Vehicle Mileage', d.vehicle_mileage ? `${d.vehicle_mileage.toLocaleString()} km` : '—'],
          ['Tank Level Before', d.tank_level_before != null ? `${formatNumber(d.tank_level_before)}L` : '—'],
          ['Tank Level After', d.tank_level_after != null ? `${formatNumber(d.tank_level_after)}L` : '—'],
          ['Created At', new Date(d.createdAt).toLocaleString()],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-gray-500 mb-0.5">{k}</p>
            <p className="text-white font-medium">{v}</p>
          </div>
        ))}
      </div>

      {d.notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-2">Notes</p>
          <p className="text-gray-300 text-sm">{d.notes}</p>
        </div>
      )}
    </div>
  )
}
