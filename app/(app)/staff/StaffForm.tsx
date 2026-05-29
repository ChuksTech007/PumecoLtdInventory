'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IBranch, IStaff } from '@/types'
import OtherSelect from '@/components/ui/OtherSelect'

const DESIGNATIONS = ['driver', 'mechanic', 'operator', 'supervisor', 'foreman', 'security']

interface Props {
  branches: IBranch[]
  member?: IStaff
}

export default function StaffForm({ branches, member }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const url = member ? `/api/staff/${member._id}` : '/api/staff'
    const method = member ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setLoading(false)
    if (res.ok) {
      const json = await res.json()
      router.push(`/staff/${json._id ?? member?._id}`)
      router.refresh()
    } else {
      const json = await res.json()
      setError(json.error ?? 'Something went wrong')
    }
  }

  const inp = (label: string, name: string, type = 'text') => {
    const val = member ? (member as any)[name] : ''
    const formatted = (type === 'date' && val) ? new Date(val).toISOString().slice(0, 10) : (val ?? '')
    return (
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <input type={type} name={name} title={label} defaultValue={formatted}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        {inp('Full Name', 'full_name')}
        {inp('Staff Number', 'staff_number')}

        <OtherSelect
          name="designation"
          label="Designation"
          options={DESIGNATIONS}
          defaultValue={member?.designation ?? ''}
        />

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Branch</label>
          <select name="branch_id" title="Branch"
            defaultValue={typeof member?.branch_id === 'object' ? (member.branch_id as any)._id : (member?.branch_id ?? '')}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
            <option value="">No branch</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>

        {inp('Phone', 'phone', 'tel')}
        {inp('Email', 'email', 'email')}
        {inp('Hire Date', 'hire_date', 'date')}
        {inp('License Number', 'license_number')}
        {inp('License Class', 'license_class')}
        {inp('License Expiry', 'license_expiry', 'date')}
        {inp('Emergency Contact', 'emergency_contact')}
        {inp('Emergency Phone', 'emergency_phone', 'tel')}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
        <textarea name="notes" title="Notes" rows={3} defaultValue={member?.notes ?? ''}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition">
          {loading ? 'Saving…' : member ? 'Update Staff' : 'Add Staff'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-gray-400 hover:text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
