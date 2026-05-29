import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import ServiceRecordModel from '@/models/ServiceRecord'
import FuelDispensingModel from '@/models/FuelDispensing'
import FuelTankModel from '@/models/FuelTank'
import StaffModel from '@/models/Staff'
import BranchModel from '@/models/Branch'
import { formatNumber } from '@/lib/utils'
import DashboardCharts from './DashboardCharts'
import { AlertTriangle, Truck, Wrench, Fuel, Building2, Users } from 'lucide-react'
import Link from 'next/link'
import { subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

export default async function DashboardPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const branchId = isAdmin ? null : session?.user?.branch_id

  await connectDB()

  const vehicleQ = branchId ? { branch_id: branchId, deleted_at: null } : { deleted_at: null }
  const serviceQ = branchId ? { branch_id: branchId, deleted_at: null } : { deleted_at: null }
  const dispQ    = branchId ? { branch_id: branchId } : {}
  const tankQ    = branchId ? { branch_id: branchId, is_active: true } : { is_active: true }

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd   = endOfMonth(now)
  const dayStart   = startOfDay(now)
  const dayEnd     = endOfDay(now)

  const [
    totalVehicles, activeVehicles, inServiceVehicles, breakdownVehicles,
    pendingServices, completedThisMonth,
    fuelToday, fuelThisMonth,
    tanks, staff, branches,
  ] = await Promise.all([
    VehicleModel.countDocuments(vehicleQ),
    VehicleModel.countDocuments({ ...vehicleQ, status: 'active' }),
    VehicleModel.countDocuments({ ...vehicleQ, status: 'in_service' }),
    VehicleModel.countDocuments({ ...vehicleQ, status: 'breakdown' }),
    ServiceRecordModel.countDocuments({ ...serviceQ, status: 'pending' }),
    ServiceRecordModel.countDocuments({ ...serviceQ, status: 'completed', service_date: { $gte: monthStart, $lte: monthEnd } }),
    FuelDispensingModel.aggregate([
      { $match: { ...dispQ, dispensing_date: { $gte: dayStart, $lte: dayEnd } } },
      { $group: { _id: null, total: { $sum: '$quantity_dispensed' } } },
    ]).then(r => r[0]?.total ?? 0),
    FuelDispensingModel.aggregate([
      { $match: { ...dispQ, dispensing_date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$quantity_dispensed' } } },
    ]).then(r => r[0]?.total ?? 0),
    FuelTankModel.find(tankQ).lean(),
    StaffModel.countDocuments(branchId ? { branch_id: branchId, is_active: true } : { is_active: true }),
    isAdmin ? BranchModel.countDocuments({ is_active: true }) : 1,
  ])

  const totalFuelStock = tanks.reduce((s: number, t: any) => s + (t.current_level ?? 0), 0)
  const lowTanks       = tanks.filter((t: any) => t.current_level <= t.minimum_level)

  // Alerts
  const alerts: { type: string; level: 'critical' | 'warning'; message: string; href: string }[] = []

  for (const t of lowTanks) {
    const isCritical = t.current_level <= (t.minimum_level * 0.5)
    alerts.push({
      type: 'fuel', level: isCritical ? 'critical' : 'warning',
      message: `Tank ${t.tank_number} is low: ${formatNumber(t.current_level)}L / ${formatNumber(t.capacity)}L`,
      href: `/fuel-tanks/${t._id}`,
    })
  }

  const needService = await VehicleModel.find({
    ...vehicleQ, next_service_mileage: { $exists: true, $ne: null },
  }).lean()
  for (const v of needService) {
    if ((v as any).current_mileage >= ((v as any).next_service_mileage - 500)) {
      alerts.push({
        type: 'service', level: 'warning',
        message: `${(v as any).registration_number} is due for service`,
        href: `/vehicles/${(v as any)._id}`,
      })
    }
  }

  const expInsurance = await VehicleModel.find({
    ...vehicleQ, insurance_expiry: { $gte: now, $lte: new Date(now.getTime() + 30 * 86400000) },
  }).lean()
  for (const v of expInsurance) {
    const days = Math.ceil(((v as any).insurance_expiry.getTime() - now.getTime()) / 86400000)
    alerts.push({
      type: 'insurance', level: days <= 7 ? 'critical' : 'warning',
      message: `Insurance for ${(v as any).registration_number} expires in ${days} day(s)`,
      href: `/vehicles/${(v as any)._id}`,
    })
  }

  // Chart data — fuel last 30 days
  const thirtyDaysAgo = subDays(now, 29)
  const rawFuel = await FuelDispensingModel.aggregate([
    { $match: { ...(branchId ? { branch_id: branchId } : {}), dispensing_date: { $gte: thirtyDaysAgo } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$dispensing_date' } },
      total: { $sum: '$quantity_dispensed' },
    }},
  ])
  const fuelByDay: Record<string, number> = {}
  for (const r of rawFuel) fuelByDay[r._id] = r.total
  const fuelChartData = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(now, 29 - i)
    const key = d.toISOString().slice(0, 10)
    return { date: key.slice(5), value: fuelByDay[key] ?? 0 }
  })

  // Vehicle status chart data
  const statusCounts = await VehicleModel.aggregate([
    { $match: vehicleQ },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
  const vehicleChartData = statusCounts.map((s: any) => ({ name: s._id, value: s.count }))

  const stats = [
    { label: 'Total Vehicles',  value: totalVehicles,   icon: Truck,     color: 'text-blue-400' },
    { label: 'Active',          value: activeVehicles,  icon: Truck,     color: 'text-green-400' },
    { label: 'In Service',      value: inServiceVehicles, icon: Wrench,  color: 'text-yellow-400' },
    { label: 'Breakdown',       value: breakdownVehicles, icon: Truck,   color: 'text-red-400' },
    { label: 'Pending Services',value: pendingServices,  icon: Wrench,   color: 'text-yellow-400' },
    { label: 'Services This Month', value: completedThisMonth, icon: Wrench, color: 'text-green-400' },
    { label: 'Fuel Today (L)',  value: formatNumber(fuelToday, 0), icon: Fuel, color: 'text-orange-400' },
    { label: 'Fuel This Month (L)', value: formatNumber(fuelThisMonth, 0), icon: Fuel, color: 'text-orange-400' },
    { label: 'Fuel Stock (L)',  value: formatNumber(totalFuelStock, 0), icon: Fuel, color: 'text-cyan-400' },
    { label: 'Low Tanks',       value: lowTanks.length, icon: Fuel,     color: 'text-red-400' },
    { label: 'Active Staff',    value: staff,           icon: Users,    color: 'text-purple-400' },
    { label: 'Branches',        value: branches,        icon: Building2,color: 'text-gray-400' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" /> Alerts ({alerts.length})
          </h2>
          <div className="space-y-2">
            {alerts.slice(0, 8).map((a, i) => (
              <Link key={i} href={a.href}
                className={`flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-800 transition text-sm ${
                  a.level === 'critical' ? 'border-l-2 border-red-500' : 'border-l-2 border-yellow-500'
                }`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.level === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                <span className="text-gray-300">{a.message}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <DashboardCharts fuelData={fuelChartData} vehicleData={vehicleChartData} />
    </div>
  )
}
