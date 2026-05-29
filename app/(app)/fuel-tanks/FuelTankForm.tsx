'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IBranch, IFuelTank } from '@/types'
import OtherSelect from '@/components/ui/OtherSelect'

interface Props {
  branches: IBranch[]
  tank?: IFuelTank
}

export default function FuelTankForm({ branches, tank }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const url = tank ? `/api/fuel-tanks/${tank._id}` : '/api/fuel-tanks'
    const method = tank ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setLoading(false)
    if (res.ok) {
      const json = await res.json()
      router.push(`/fuel-tanks/${json._id ?? tank?._id}`)
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
      <input type={type} name={name} title={label} defaultValue={tank ? (tank as any)[name] ?? '' : ''}
        className={cls} {...extra} />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        {inp('Tank Name *', 'name')}
        {inp('Tank Number', 'tank_number')}

        <OtherSelect
          name="fuel_type"
          label="Fuel Type"
          options={['diesel', 'petrol', 'kerosene', 'lpg']}
          defaultValue={tank?.fuel_type ?? ''}
        />

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Branch</label>
          <select name="branch_id" title="Branch"
            defaultValue={typeof tank?.branch_id === 'object' ? (tank.branch_id as any)._id : (tank?.branch_id ?? '')}
            className={cls}>
            <option value="">Select branch</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>

        {inp('Capacity (L)', 'capacity', 'number', { min: 1 })}
        {inp('Current Level (L)', 'current_level', 'number', { min: 0, defaultValue: tank?.current_level ?? 0 })}
        {inp('Minimum Level (L)', 'minimum_level', 'number', { min: 0, defaultValue: tank?.minimum_level ?? 0 })}

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Active Status</label>
          <select name="is_active" title="Active status" defaultValue={tank ? String(tank.is_active) : 'true'} className={cls}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
        <textarea name="notes" title="Notes" rows={3} defaultValue={tank?.notes ?? ''}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition">
          {loading ? 'Saving…' : tank ? 'Update Tank' : 'Add Tank'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-gray-400 hover:text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
