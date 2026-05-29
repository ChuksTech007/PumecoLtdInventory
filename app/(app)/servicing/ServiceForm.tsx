'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IVehicle, IBranch, IServiceRecord } from '@/types'
import OtherSelect from '@/components/ui/OtherSelect'

const SERVICE_TYPES = ['routine_maintenance','oil_change','tire_replacement','brake_service','engine_repair','electrical_repair','bodywork','inspection','transmission','fuel_system','cooling_system']

interface Props { vehicles: IVehicle[]; branches: IBranch[]; record?: IServiceRecord; preselectedVehicleId?: string }

export default function ServiceForm({ vehicles, branches, record, preselectedVehicleId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const url = record ? `/api/servicing/${record._id}` : '/api/servicing'
    const res = await fetch(url, { method: record ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setLoading(false)
    if (res.ok) { const j = await res.json(); router.push(`/servicing/${j._id ?? record?._id}`); router.refresh() }
    else { const j = await res.json(); setError(j.error ?? 'Error') }
  }

  const sel = (label: string, name: string, options: {v:string;l:string}[], def?: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <select name={name} title={label} defaultValue={record ? (record as any)[name] : (def ?? '')}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
        <option value="">— Select —</option>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )

  const inp = (label: string, name: string, type='text', extra?: any) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input type={type} name={name} title={label} defaultValue={record ? (record as any)[name] ?? '' : ''} {...extra}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        {sel('Vehicle', 'vehicle_id', vehicles.map(v => ({ v: v._id, l: v.registration_number })), preselectedVehicleId)}
        {sel('Branch', 'branch_id', branches.map(b => ({ v: b._id, l: b.name })))}
        <OtherSelect name="service_type" label="Service Type" options={SERVICE_TYPES} defaultValue={record?.service_type ?? ''} />
        {sel('Status', 'status', ['pending','in_progress','completed','cancelled'].map(s => ({ v: s, l: s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) })), record?.status ?? 'pending')}
        {inp('Service Date', 'service_date', 'date', { defaultValue: record?.service_date ? new Date(record.service_date).toISOString().slice(0,10) : '' })}
        {inp('Completion Date', 'completion_date', 'date', { defaultValue: record?.completion_date ? new Date(record.completion_date).toISOString().slice(0,10) : '' })}
        {inp('Mileage at Service (km)', 'mileage_at_service', 'number')}
        {inp('Next Service Mileage (km)', 'next_service_mileage', 'number')}
        {inp('Labour Cost (₦)', 'labour_cost', 'number')}
        {inp('Parts Cost (₦)', 'parts_cost', 'number')}
        {inp('Mechanic Name', 'mechanic_name')}
        {inp('Workshop / Garage', 'workshop')}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
        <textarea name="description" title="Description" rows={3} defaultValue={record?.description ?? ''}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Parts Replaced</label>
        <textarea name="parts_replaced" title="Parts Replaced" rows={2} defaultValue={record?.parts_replaced ?? ''}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition">
          {loading ? 'Saving…' : record ? 'Update Record' : 'Create Record'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-gray-400 hover:text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition">Cancel</button>
      </div>
    </form>
  )
}
