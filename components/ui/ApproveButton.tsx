'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function ApproveButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function approve() {
    setLoading(true)
    await fetch(`/api/servicing/${id}/approve`, { method: 'POST' })
    router.refresh()
  }
  return (
    <button onClick={approve} disabled={loading}
      className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm px-3 py-2 rounded-lg transition disabled:opacity-50">
      <CheckCircle className="w-3.5 h-3.5" />
      {loading ? '…' : 'Approve'}
    </button>
  )
}
