import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import ServiceRecordModel from '@/models/ServiceRecord'
import FuelDispensingModel from '@/models/FuelDispensing'
import MileageLogModel from '@/models/MileageLog'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/ui/Badge'
import { displayEnum, formatNumber } from '@/lib/utils'
import Link from 'next/link'
import DeleteButton from '@/components/ui/DeleteButton'

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const vehicle = await VehicleModel.findById(id).populate('branch_id', 'name').populate('assigned_driver_id', 'name').lean()
  if (!vehicle) notFound()

  const session = await auth()
  const canManage = ['admin', 'fleet_officer'].includes(session?.user?.role ?? '')

  const [services, fuels, mileageLogs] = await Promise.all([
    ServiceRecordModel.find({ vehicle_id: id, deleted_at: null }).sort({ service_date: -1 }).limit(10).lean(),
    FuelDispensingModel.find({ vehicle_id: id }).sort({ dispensing_date: -1 }).limit(10).lean(),
    MileageLogModel.find({ vehicle_id: id }).sort({ createdAt: -1 }).limit(10).lean(),
  ])

  const v = vehicle as any

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">{v.registration_number}</h1>
            <StatusBadge status={v.status} />
          </div>
          <p className="text-gray-400">{v.make} {v.model} {v.year ? `· ${v.year}` : ''} · {displayEnum(v.type)}</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/vehicles/${id}/edit`} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">Edit</Link>
            <DeleteButton id={id} type="vehicle" redirectTo="/vehicles" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Branch',   (v.branch_id as any)?.name ?? '—'],
          ['Driver',   (v.assigned_driver_id as any)?.name ?? 'Unassigned'],
          ['Mileage',  `${(v.current_mileage ?? 0).toLocaleString()} km`],
          ['Next Service', v.next_service_mileage ? `${v.next_service_mileage.toLocaleString()} km` : '—'],
          ['Insurance Expiry', v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString() : '—'],
          ['Road Worthiness', v.road_worthiness_expiry ? new Date(v.road_worthiness_expiry).toLocaleDateString() : '—'],
          ['Fuel Capacity', v.fuel_capacity ? `${v.fuel_capacity}L` : '—'],
          ['Engine No.', v.engine_number ?? '—'],
        ].map(([k, val]) => (
          <div key={k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-sm font-medium text-white">{val}</p>
          </div>
        ))}
      </div>

      {/* Service history */}
      <Section title="Service History" count={services.length} action={canManage ? `/servicing/new?vehicle_id=${id}` : undefined} actionLabel="+ New Service">
        <Table headers={['Reference','Type','Status','Date','Cost (₦)']}>
          {(services as any[]).map(s => (
            <tr key={s._id.toString()} className="hover:bg-gray-800/50">
              <td className="px-4 py-3"><Link href={`/servicing/${s._id}`} className="text-orange-400 hover:text-orange-300">{s.reference_number}</Link></td>
              <td className="px-4 py-3 text-gray-300">{displayEnum(s.service_type)}</td>
              <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
              <td className="px-4 py-3 text-gray-400">{new Date(s.service_date).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-gray-400">{formatNumber(s.total_cost)}</td>
            </tr>
          ))}
          {services.length === 0 && <EmptyRow cols={5} />}
        </Table>
      </Section>

      {/* Fuel history */}
      <Section title="Fuel History" count={fuels.length}>
        <Table headers={['Reference','Date','Qty (L)','Mileage','Purpose']}>
          {(fuels as any[]).map(f => (
            <tr key={f._id.toString()} className="hover:bg-gray-800/50">
              <td className="px-4 py-3"><Link href={`/fuel-dispensings/${f._id}`} className="text-orange-400 hover:text-orange-300">{f.reference_number}</Link></td>
              <td className="px-4 py-3 text-gray-400">{new Date(f.dispensing_date).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-gray-300">{formatNumber(f.quantity_dispensed)}</td>
              <td className="px-4 py-3 text-gray-400">{f.vehicle_mileage ? `${f.vehicle_mileage.toLocaleString()} km` : '—'}</td>
              <td className="px-4 py-3 text-gray-400">{displayEnum(f.purpose)}</td>
            </tr>
          ))}
          {fuels.length === 0 && <EmptyRow cols={5} />}
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
