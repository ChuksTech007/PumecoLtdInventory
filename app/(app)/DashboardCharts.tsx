'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  in_service: '#eab308',
  breakdown: '#ef4444',
  decommissioned: '#6b7280',
}

interface Props {
  fuelData: { date: string; value: number }[]
  vehicleData: { name: string; value: number }[]
}

export default function DashboardCharts({ fuelData, vehicleData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Fuel Dispensed — Last 30 Days (L)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={fuelData}>
            <defs>
              <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} interval={6} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f1f5f9' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area type="monotone" dataKey="value" stroke="#f97316" fill="url(#fuelGrad)" strokeWidth={2} dot={false} name="Litres" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Vehicle Status</h2>
        {vehicleData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={vehicleData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                {vehicleData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#6b7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f1f5f9' }} />
              <Legend formatter={(v) => <span className="text-gray-400 text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No vehicles yet</div>
        )}
      </div>
    </div>
  )
}
