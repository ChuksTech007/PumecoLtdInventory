import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'

const roleDisplay: Record<string, string> = {
  admin: 'Administrator',
  fleet_officer: 'Fleet Officer',
  fuel_officer: 'Fuel Officer',
  branch_manager: 'Branch Manager',
  viewer: 'Viewer',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <AppShell
      userName={session.user.name ?? 'User'}
      userRole={roleDisplay[session.user.role] ?? 'User'}
      role={session.user.role}
    >
      {children}
    </AppShell>
  )
}
