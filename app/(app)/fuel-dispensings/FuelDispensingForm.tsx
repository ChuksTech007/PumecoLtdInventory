'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IBranch, IFuelTank, IVehicle, IUser } from '@/types'
import OtherSelect from '@/components/ui/OtherSelect'

const PURPOSES = ['vehicle_fueling', 'generator', 'branch_transfer', 'equipment', 'compactor', 'site_operations']

interface Props {
  tanks: IFuelTank[]
  branches: IBranch[]
  vehicles: IVehicle[]
  drivers: IUser[]
}

export default function FuelDispensingForm({ tanks, branches, vehicles, drivers }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const res = await fetch('/api/fuel-dispensings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)
    if (res.ok) {
      const json = await res.json()
      router.push(`/fuel-dispensings/${json._id}`)
      router.refresh()
    } else {
      const json = await res.json()
      setError(json.error ?? 'Something went wrong')
    }
  }

  const cls = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition'

  const inp = (label: string, name: string, type = 'text', extra?: any) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input type={type} name={name} title={label} className={cls} {...extra} />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-lg px-4 py-3">
        Tank fuel level will be automatically deducted. Vehicle mileage will be updated if provided.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Fuel Tank *</label>
          <select name="fuel_tank_id" title="Fuel tank" className={cls}>
            <option value="">Select tank</option>
            {tanks.map(t => (
              <option key={t._id} value={t._id}>
                {t.name} — {(t as any).current_level?.toLocaleString()}L available
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Branch</label>
          <select name="branch_id" title="Branch" className={cls}>
            <option value="">Select branch</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>

        <OtherSelect name="purpose" label="Purpose" options={PURPOSES} />

        {inp('Dispensing Date', 'dispensing_date', 'date')}
        {inp('Quantity Dispensed (L)', 'quantity_dispensed', 'number', { min: 0.01, step: '0.01' })}
        {inp('Quantity Requested (L)', 'quantity_requested', 'number', { min: 0, step: '0.01' })}

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Vehicle</label>
          <select name="vehicle_id" title="Vehicle" className={cls}>
            <option value="">No vehicle</option>
            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registration_number} — {v.make} {v.model}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Driver</label>
          <select name="driver_id" title="Driver" className={cls}>
            <option value="">No driver</option>
            {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>

        {inp('Vehicle Mileage (km)', 'vehicle_mileage', 'number', { min: 0, placeholder: 'Current odometer reading' })}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
        <textarea name="notes" title="Notes" rows={3}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition">
          {loading ? 'Saving…' : 'Record Dispensing'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-gray-400 hover:text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
