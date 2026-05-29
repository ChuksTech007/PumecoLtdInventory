'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

interface Props {
  userName: string
  userRole: string
  role: string
  children: React.ReactNode
}

export default function AppShell({ userName, userRole, role, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar
        userName={userName}
        userRole={userRole}
        role={role}
        isOpen={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 h-14 shrink-0 bg-gray-900 border-b border-gray-800 lg:hidden">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Pumeco" className="w-7 h-7 object-contain" />
            <span className="font-bold text-white text-sm">Pumeco Fleet</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
