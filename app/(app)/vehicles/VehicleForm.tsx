'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { IBranch, IUser, IVehicle } from '@/types'

interface Props {
  branches: IBranch[]
  drivers: IUser[]
  vehicle?: IVehicle
}

const TYPES = ['car','bus','truck','pickup','grader','excavator','roller','bulldozer','crane','tanker','other']

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

  const field = (label: string, name: string, type = 'text', required = false, extra?: any) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}{required && ' *'}</label>
      <input type={type} name={name} required={required} defaultValue={vehicle ? (vehicle as any)[name] : ''} {...extra}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        {field('Registration Number', 'registration_number', 'text', true)}
        {field('Fleet Number', 'fleet_number')}
        {field('Make', 'make', 'text', true)}
        {field('Model', 'model', 'text', true)}
        {field('Year', 'year', 'number')}
        {field('Color', 'color')}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Type *</label>
          <select name="type" required defaultValue={vehicle?.type ?? ''}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
            <option value="">Select type</option>
            {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
          <select name="status" defaultValue={vehicle?.status ?? 'active'}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
            {['active','in_service','breakdown','decommissioned'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Branch</label>
          <select name="branch_id" defaultValue={typeof vehicle?.branch_id === 'object' ? (vehicle.branch_id as any)._id : (vehicle?.branch_id ?? '')}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
            <option value="">No branch</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Assigned Driver</label>
          <select name="assigned_driver_id" defaultValue={typeof vehicle?.assigned_driver_id === 'object' ? (vehicle.assigned_driver_id as any)._id : (vehicle?.assigned_driver_id ?? '')}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
            <option value="">Not assigned</option>
            {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {field('Current Mileage (km)', 'current_mileage', 'number')}
        {field('Fuel Capacity (L)', 'fuel_capacity', 'number')}
        {field('Avg Consumption (L/km)', 'avg_fuel_consumption', 'number')}
        {field('Insurance Expiry', 'insurance_expiry', 'date')}
        {field('Road Worthiness Expiry', 'road_worthiness_expiry', 'date')}
        {field('Engine Number', 'engine_number')}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
        <textarea name="notes" rows={3} defaultValue={vehicle?.notes ?? ''}
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
