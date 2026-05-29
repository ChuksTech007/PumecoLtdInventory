'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { IBranch, IUser, IVehicle } from '@/types'
import OtherSelect from '@/components/ui/OtherSelect'

interface Props {
  branches: IBranch[]
  drivers: IUser[]
  vehicle?: IVehicle
}

const TYPES = ['car','bus','truck','pickup','grader','excavator','roller','bulldozer','crane','tanker']

export default function VehicleForm({ branches, drivers, vehicle }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const url = vehicle ? `/api/vehicles/${vehicle._id}` : '/api/vehicles'
    const method = vehicle ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setLoading(false)
    if (res.ok) {
      const json = await res.json()
      router.push(`/vehicles/${json._id ?? vehicle?._id}`)
      router.refresh()
    } else {
      const json = await res.json()
      setError(json.error ?? 'Something went wrong')
    }
  }

  const field = (label: string, name: string, type = 'text', extra?: any) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input type={type} name={name} defaultValue={vehicle ? (vehicle as any)[name] ?? '' : ''} {...extra}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition" />
    </div>
  )

  const sel = (label: string, name: string, options: {v:string;l:string}[], def?: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <select name={name} defaultValue={def ?? ''} title={label}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
        <option value="">— Select —</option>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        {field('Registration Number', 'registration_number')}
        {field('Fleet Number', 'fleet_number')}
        {field('Make', 'make')}
        {field('Model', 'model')}
        {field('Year', 'year', 'number')}
        {field('Color', 'color')}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <OtherSelect name="type" label="Vehicle Type" options={TYPES} defaultValue={vehicle?.type ?? ''} />
        {sel('Status', 'status',
          ['active','in_service','breakdown','decommissioned'].map(s => ({ v: s, l: s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) })),
          vehicle?.status ?? 'active'
        )}
        {sel('Branch', 'branch_id',
          branches.map(b => ({ v: b._id, l: b.name })),
          typeof vehicle?.branch_id === 'object' ? (vehicle.branch_id as any)._id : (vehicle?.branch_id ?? '')
        )}
        {sel('Assigned Driver', 'assigned_driver_id',
          drivers.map(d => ({ v: d._id, l: d.name })),
          typeof vehicle?.assigned_driver_id === 'object' ? (vehicle.assigned_driver_id as any)._id : (vehicle?.assigned_driver_id ?? '')
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {field('Current Mileage (km)', 'current_mileage', 'number')}
        {field('Fuel Capacity (L)', 'fuel_capacity', 'number')}
        {field('Avg Consumption (L/km)', 'avg_fuel_consumption', 'number')}
        {field('Insurance Expiry', 'insurance_expiry', 'date')}
        {field('Road Worthiness Expiry', 'road_worthiness_expiry', 'date')}
        {field('Engine Number', 'engine_number')}
        {field('Chassis Number', 'chassis_number')}
        {field('Next Service Mileage (km)', 'next_service_mileage', 'number')}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
        <textarea name="notes" title="Notes" rows={3} defaultValue={vehicle?.notes ?? ''}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition">
          {loading ? 'Saving…' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-gray-400 hover:text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
