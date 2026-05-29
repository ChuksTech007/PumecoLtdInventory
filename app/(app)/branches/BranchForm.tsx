'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IBranch } from '@/types'

interface Props { branch?: IBranch }

export default function BranchForm({ branch }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const url = branch ? `/api/branches/${branch._id}` : '/api/branches'
    const method = branch ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setLoading(false)
    if (res.ok) {
      const json = await res.json()
      router.push(`/branches/${json._id ?? branch?._id}`)
      router.refresh()
    } else {
      const json = await res.json()
      setError(json.error ?? 'Something went wrong')
    }
  }

  const inp = (label: string, name: string, type = 'text', required = false) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}{required && ' *'}</label>
      <input type={type} name={name} required={required} defaultValue={branch ? (branch as any)[name] ?? '' : ''}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        {inp('Branch Name', 'name', 'text', true)}
        {inp('Branch Code', 'code', 'text', true)}
        {inp('Location / City', 'location', 'text', true)}
        {inp('State', 'state')}
        {inp('Address', 'address')}
        {inp('Manager Name', 'manager_name')}
        {inp('Phone', 'phone', 'tel')}
        {inp('Email', 'email', 'email')}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
        <textarea name="notes" rows={3} defaultValue={branch?.notes ?? ''}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition">
          {loading ? 'Saving…' : branch ? 'Update Branch' : 'Add Branch'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-gray-400 hover:text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
