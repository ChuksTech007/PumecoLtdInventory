import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import ServiceRecordModel from '@/models/ServiceRecord'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity-logger'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const record = await ServiceRecordModel.findByIdAndUpdate(
      id,
      { approved_by: session.user.id },
      { new: true }
    ).lean() as any

    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await logActivity('approve', 'ServiceRecord', id, record.reference_number,
      `Approved service record ${record.reference_number}`)

    return NextResponse.json(record)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
