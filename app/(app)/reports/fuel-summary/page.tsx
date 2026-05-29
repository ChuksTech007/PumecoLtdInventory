import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import FuelReceiptModel from '@/models/FuelReceipt'
import FuelDispensingModel from '@/models/FuelDispensing'
import PageHeader from '@/components/ui/PageHeader'
import { displayEnum, formatNumber, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Props { searchParams: Promise<{ from_date?: string; to_date?: string }> }

export default async function FuelSummaryPage({ searchParams }: Props) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const params = await searchParams
  await connectDB()

  const receiptFilter: Record<string, any> = {}
  const dispensingFilter: Record<string, any> = {}
  if (!isAdmin) {
    receiptFilter.branch_id = session?.user?.branch_id
    dispensingFilter.branch_id = session?.user?.branch_id
  }
  if (params.from_date || params.to_date) {
    const dateFilter: Record<string, any> = {}
    if (params.from_date) dateFilter.$gte = new Date(params.from_date)
    if (params.to_date) dateFilter.$lte = new Date(params.to_date)
    receiptFilter.receipt_date = dateFilter
    dispensingFilter.dispensing_date = dateFilter
  }

  const [receipts, dispensings] = await Promise.all([
    FuelReceiptModel.find(receiptFilter).lean(),
    FuelDispensingModel.find(dispensingFilter).populate('vehicle_id', 'registration_number').lean(),
  ])

  const totalReceived = (receipts as any[]).reduce((s, r) => s + (r.quantity_received ?? 0), 0)
  const totalDispensed = (dispensings as any[]).reduce((s, d) => s + (d.quantity_dispensed ?? 0), 0)
  const totalCost = (receipts as any[]).reduce((s, r) => s + (r.total_cost ?? 0), 0)

  const byPurpose: Record<string, number> = {}
  for (const d of dispensings as any[]) {
    byPurpose[d.purpose] = (byPurpose[d.purpose] ?? 0) + (d.quantity_dispensed ?? 0)
  }

  const byVehicle: Record<string, { reg: string; total: number }> = {}
  for (const d of dispensings as any[]) {
    if (d.vehicle_id) {
      const vid = (d.vehicle_id as any)._id?.toString() ?? d.vehicle_id.toString()
      const reg = (d.vehicle_id as any)?.registration_number ?? vid
      if (!byVehicle[vid]) byVehicle[vid] = { reg, total: 0 }
      byVehicle[vid].total += d.quantity_dispensed ?? 0
    }
  }
  const vehicleRows = Object.values(byVehicle).sort((a, b) => b.total - a.total)

  const csvParams = new URLSearchParams()
  if (params.from_date) csvParams.set('from_date', params.from_date)
  if (params.to_date) csvParams.set('to_date', params.to_date)
  csvParams.set('export', 'csv')
  const csvUrl = `/api/reports/fuel-summary?${csvParams.toString()}`

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Fuel Summary Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {params.from_date || params.to_date
              ? `${params.from_date ?? 'Start'} to ${params.to_date ?? 'Today'}`
              : 'All time'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">← Reports</Link>
          <a href={csvUrl} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition">
            Export CSV
          </a>
        </div>
      </div>

      <form className="flex flex-wrap gap-2">
        <input type="date" name="from_date" defaultValue={params.from_date ?? ''} title="From date" placeholder="From date"
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <input type="date" name="to_date" defaultValue={params.to_date ?? ''} title="To date" placeholder="To date"
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Apply</button>
        <Link href="/reports/fuel-summary" className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition">Clear</Link>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['Total Received', `${formatNumber(totalReceived)} L`, 'text-green-400'],
          ['Total Dispensed', `${formatNumber(totalDispensed)} L`, 'text-orange-400'],
          ['Total Receipt Cost', formatCurrency(totalCost), 'text-blue-400'],
        ].map(([label, value, color]) => (
          <div key={label as string} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">{label as string}</p>
            <p className={`text-2xl font-bold ${color as string}`}>{value as string}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Dispensing by Purpose</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
              <th className="px-4 py-3 text-left font-medium">Purpose</th>
              <th className="px-4 py-3 text-left font-medium">Qty Dispensed (L)</th>
              <th className="px-4 py-3 text-left font-medium">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {Object.entries(byPurpose).sort(([, a], [, b]) => b - a).map(([purpose, qty]) => (
              <tr key={purpose} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-300">{displayEnum(purpose)}</td>
                <td className="px-4 py-3 text-gray-400">{formatNumber(qty)}</td>
                <td className="px-4 py-3 text-gray-400">{totalDispensed > 0 ? ((qty / totalDispensed) * 100).toFixed(1) : '0'}%</td>
              </tr>
            ))}
            {Object.keys(byPurpose).length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-600">No dispensings in this period</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Vehicle Fuel Consumption</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
              <th className="px-4 py-3 text-left font-medium">Vehicle</th>
              <th className="px-4 py-3 text-left font-medium">Total Dispensed (L)</th>
              <th className="px-4 py-3 text-left font-medium">% of Vehicle Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {vehicleRows.map(row => {
              const vehicleTotal = vehicleRows.reduce((s, r) => s + r.total, 0)
              return (
                <tr key={row.reg} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-300">{row.reg}</td>
                  <td className="px-4 py-3 text-gray-400">{formatNumber(row.total)}</td>
                  <td className="px-4 py-3 text-gray-400">{vehicleTotal > 0 ? ((row.total / vehicleTotal) * 100).toFixed(1) : '0'}%</td>
                </tr>
              )
            })}
            {vehicleRows.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-600">No vehicle dispensings in this period</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
