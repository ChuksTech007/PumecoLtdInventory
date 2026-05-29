'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface Props {
  id: string
  type: 'vehicle' | 'branch' | 'staff' | 'fuel-tank' | 'servicing' | 'fuel-receipt' | 'fuel-dispensing'
  redirectTo?: string
  label?: string
}

const typeToApi: Record<string, string> = {
  vehicle: 'vehicles',
  branch: 'branches',
  staff: 'staff',
  'fuel-tank': 'fuel-tanks',
  servicing: 'servicing',
  'fuel-receipt': 'fuel-receipts',
  'fuel-dispensing': 'fuel-dispensings',
}

export default function DeleteButton({ id, type, redirectTo, label }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/${typeToApi[type]}/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? 'Delete failed. Please try again.')
      setLoading(false)
      setConfirming(false)
      return
    }
    if (redirectTo) router.push(redirectTo)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Sure?</span>
        <button onClick={handleDelete} disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50">
          {loading ? '…' : 'Delete'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm px-3 py-2 rounded-lg transition">
      <Trash2 className="w-3.5 h-3.5" />
      {label ?? 'Delete'}
    </button>
  )
}
